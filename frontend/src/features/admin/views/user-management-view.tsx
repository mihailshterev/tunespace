import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  UserX,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import Loading from "@/shared/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import useAuth from "@/shared/auth/hooks/useAuth";
import { UserRole } from "@/shared/utils/constants";
import {
  useChangeUserRole,
  useDeleteBandAndSetRole,
  useManagedUsers,
  useSetUserSuspended,
  useUserStats,
} from "@/features/admin/hooks/useUserManagement";
import type {
  ManagedUser,
  UserListFilters,
  UserStatusFilter,
} from "@/features/admin/types/managed-user";
import { UserRow } from "@/features/admin/components/user-row";
import { ROLE_LABELS, getRoleOption, isSoleManager } from "@/features/admin/utils";

const PAGE_SIZE = 20;

type PendingAction =
  | { kind: "suspend"; user: ManagedUser }
  | { kind: "grant-admin"; user: ManagedUser }
  | { kind: "remove-from-band"; user: ManagedUser }
  | { kind: "delete-band"; user: ManagedUser; role: UserRole };

export function UserManagementView() {
  const { auth } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<UserListFilters>({
    search: "",
    role: "all",
    status: "all",
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  // Debounce typing so every keystroke doesn't hit the API.
  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((f) =>
        f.search === searchInput ? f : { ...f, search: searchInput, page: 1 },
      );
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching } = useManagedUsers(filters);
  const { data: stats } = useUserStats();
  const changeRole = useChangeUserRole();
  const setSuspended = useSetUserSuspended();
  const deleteBandAndSetRole = useDeleteBandAndSetRole();

  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE))
    : 1;
  const busyUserId =
    (changeRole.isPending && changeRole.variables?.userId) ||
    (setSuspended.isPending && setSuspended.variables?.userId) ||
    (deleteBandAndSetRole.isPending &&
      deleteBandAndSetRole.variables?.user.id) ||
    null;

  const handleRoleChange = (user: ManagedUser, role: UserRole) => {
    const option = getRoleOption(user, role);
    switch (option.kind) {
      case "current":
      case "blocked":
        return;
      case "confirm-admin":
        setPendingAction({ kind: "grant-admin", user });
        return;
      case "confirm-remove-from-band":
        setPendingAction({ kind: "remove-from-band", user });
        return;
      case "confirm-delete-band":
        setPendingAction({ kind: "delete-band", user, role });
        return;
      case "apply":
        changeRole.mutate({ userId: user.id, role });
    }
  };

  const handleToggleSuspended = (user: ManagedUser) => {
    if (user.isSuspended) {
      setSuspended.mutate({ userId: user.id, suspended: false });
    } else {
      setPendingAction({ kind: "suspend", user });
    }
  };

  const confirmPendingAction = () => {
    if (!pendingAction) return;
    const { user } = pendingAction;
    switch (pendingAction.kind) {
      case "suspend":
        setSuspended.mutate({ userId: user.id, suspended: true });
        break;
      case "grant-admin":
        changeRole.mutate({ userId: user.id, role: UserRole.Admin });
        break;
      case "remove-from-band":
        changeRole.mutate({ userId: user.id, role: UserRole.Listener });
        break;
      case "delete-band":
        deleteBandAndSetRole.mutate({ user, role: pendingAction.role });
        break;
    }
    setPendingAction(null);
  };

  const dialog = pendingAction ? describePendingAction(pendingAction) : null;

  const bandUsers =
    (stats?.usersByRole.BandAdmin ?? 0) + (stats?.usersByRole.BandMember ?? 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Review accounts, assign roles and suspend users who break the rules.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total users"
          value={stats?.totalUsers}
        />
        <StatCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Admins"
          value={stats?.usersByRole.Admin}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="In bands"
          value={stats ? bandUsers : undefined}
        />
        <StatCard
          icon={<UserX className="h-4 w-4" />}
          label="Suspended"
          value={stats?.suspendedUsers}
          tone="danger"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username or email"
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <Select
          value={filters.role}
          onValueChange={(value) =>
            setFilters((f) => ({
              ...f,
              role: value as UserListFilters["role"],
              page: 1,
            }))
          }
        >
          <SelectTrigger className="sm:w-[170px]" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {Object.values(UserRole).map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters((f) => ({
              ...f,
              status: value as UserStatusFilter,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="sm:w-[150px]" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load users. Please try again later.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="flex justify-center py-16">
          <Loading />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-3 pl-4 pr-3 font-medium">User</th>
                    <th className="py-3 px-3 font-medium">Band</th>
                    <th className="py-3 px-3 font-medium">Role</th>
                    <th className="py-3 px-3 font-medium">Status</th>
                    <th className="py-3 px-3 font-medium">Last active</th>
                    <th className="py-3 pl-3 pr-4 font-medium text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={isFetching ? "opacity-60 transition-opacity" : ""}
                >
                  {data?.items.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isCurrentUser={user.id === auth?.id}
                      isPending={busyUserId === user.id}
                      onRoleChange={handleRoleChange}
                      onToggleSuspended={handleToggleSuspended}
                    />
                  ))}
                  {data?.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-muted-foreground"
                      >
                        No users match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {data && data.totalCount > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>
            {data.totalCount} user{data.totalCount === 1 ? "" : "s"} · page{" "}
            {filters.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page >= totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <DialogContent>
          {dialog && (
            <>
              <DialogHeader>
                <DialogTitle>{dialog.title}</DialogTitle>
                <DialogDescription>{dialog.description}</DialogDescription>
              </DialogHeader>
              {dialog.warning && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{dialog.warning}</AlertDescription>
                </Alert>
              )}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setPendingAction(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant={dialog.destructive ? "destructive" : "default"}
                  onClick={confirmPendingAction}
                >
                  {dialog.confirmLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PendingActionDialog {
  title: string;
  description: string;
  warning?: string;
  confirmLabel: string;
  destructive: boolean;
}

function describePendingAction(action: PendingAction): PendingActionDialog {
  const { user } = action;
  const bandName = user.band?.name;

  switch (action.kind) {
    case "suspend":
      return {
        title: `Suspend ${user.username}?`,
        description:
          "They'll be signed out everywhere within seconds and can't log in until an admin restores the account. Their content and band membership stay in place.",
        warning: isSoleManager(user)
          ? `${user.username} is the only manager of ${bandName}. While suspended, nobody in the band can manage it; you can promote another member to Band Admin.`
          : undefined,
        confirmLabel: "Suspend account",
        destructive: true,
      };
    case "grant-admin":
      return {
        title: `Make ${user.username} an admin?`,
        description:
          "Admins can manage every user and every band, including changing roles and suspending accounts." +
          (bandName ? ` They stay in ${bandName} and can still manage it.` : ""),
        confirmLabel: "Grant admin",
        destructive: false,
      };
    case "remove-from-band":
      return {
        title: `Remove ${user.username} from ${bandName}?`,
        description: `Listeners can't belong to a band, so making ${user.username} a Listener removes them from ${bandName}. A band manager can add them back later.`,
        confirmLabel: "Remove and make Listener",
        destructive: true,
      };
    case "delete-band":
      return {
        title: `Delete ${bandName}?`,
        description: `${user.username} is the only member of ${bandName}, so they can't leave it without the band being deleted.`,
        warning:
          "Deleting the band permanently removes its profile, events, merchandise, chats and followers.",
        confirmLabel: `Delete band and make ${ROLE_LABELS[action.role]}`,
        destructive: true,
      };
  }
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | undefined;
  tone?: "default" | "danger";
}

function StatCard({ icon, label, value, tone = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={tone === "danger" ? "text-red-400" : "text-indigo-400"}
          >
            {icon}
          </span>
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">
          {value ?? "–"}
        </div>
      </CardContent>
    </Card>
  );
}
