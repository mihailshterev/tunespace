import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  LogOut,
  MoreHorizontal,
  ShieldCheck,
  ShieldMinus,
  UserMinus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { getErrorMessage } from "@/shared/api/error-message";
import { ROUTES, UserRole } from "@/shared/utils/constants";
import UserSearchDialog from "@/features/profile/components/user-search-dialog";
import type UserType from "@/features/profile/types/user";
import {
  isBandManagerRole,
  type BandMember,
  type BandRole,
} from "@/features/band/types/band";

const MEMBER_ROLE_LABELS: Partial<Record<string, string>> = {
  [UserRole.Admin]: "Site Admin",
  [UserRole.BandAdmin]: "Band Admin",
  [UserRole.BandMember]: "Member",
};

interface BandMembersProps {
  bandId: string;
  bandName: string;
  members: BandMember[];
  currentUserId: string | undefined;
  canManageBand: boolean;
  onAddMember: (user: UserType) => Promise<void>;
  removeMember: (args: { bandId: string; userId: string }) => Promise<void>;
  setMemberRole: (args: {
    bandId: string;
    userId: string;
    role: BandRole;
  }) => Promise<void>;
}

type PendingRemoval = { member: BandMember; isSelf: boolean };

export function BandMembers({
  bandId,
  bandName,
  members,
  currentUserId,
  canManageBand,
  onAddMember,
  removeMember,
  setMemberRole,
}: BandMembersProps) {
  const navigate = useNavigate();
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const managerCount = members.filter((m) => isBandManagerRole(m.role)).length;
  const isOnlyMember = members.length <= 1;

  // Mirrors the server rules so blocked actions are explained up front; the server still enforces them.
  const leaveBlockedReason = (member: BandMember): string | null => {
    if (isOnlyMember) {
      return "You're the only member. Delete the band instead.";
    }
    if (isBandManagerRole(member.role) && managerCount <= 1) {
      return `${member.id === currentUserId ? "You're" : `${member.name} is`} the only manager. Make another member a Band Admin first.`;
    }
    return null;
  };

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "That change couldn't be made."));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const changeRole = (member: BandMember, role: BandRole) =>
    run(
      () => setMemberRole({ bandId, userId: member.id, role }),
      role === UserRole.BandAdmin
        ? `${member.name} is now a Band Admin`
        : `${member.name} is now a member`,
    );

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;
    const { member, isSelf } = pendingRemoval;
    const ok = await run(
      () => removeMember({ bandId, userId: member.id }),
      isSelf ? `You left ${bandName}` : `${member.name} was removed`,
    );
    setPendingRemoval(null);
    if (ok && isSelf) {
      navigate(ROUTES.HOME);
    }
  };

  const currentMember = members.find((m) => m.id === currentUserId);
  const selfLeaveReason = currentMember ? leaveBlockedReason(currentMember) : null;

  return (
    <Card className="mb-6 overflow-hidden border-muted/20">
      <CardHeader className="bg-muted/10 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span>Band Members</span>
          <div className="ml-auto flex items-center gap-2">
            {currentMember && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                disabled={busy || !!selfLeaveReason}
                title={selfLeaveReason ?? undefined}
                onClick={() =>
                  setPendingRemoval({ member: currentMember, isSelf: true })
                }
              >
                <LogOut className="h-3.5 w-3.5" /> Leave band
              </Button>
            )}
            {canManageBand && (
              <UserSearchDialog
                trigger={
                  <button className="text-sm px-3 py-1 bg-primary hover:bg-primary/80 text-primary-foreground rounded-md">
                    Add Member
                  </button>
                }
                title="Add Band Member"
                onSelectUser={onAddMember}
                buttonText="Add to Band"
              />
            )}
          </div>
        </CardTitle>
        {currentMember && selfLeaveReason && (
          <p className="text-xs text-muted-foreground">{selfLeaveReason}</p>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {members.map((member) => {
            const isSelf = member.id === currentUserId;
            const isSiteAdmin = member.role === UserRole.Admin;
            const removalBlocked = leaveBlockedReason(member);
            const demoteBlocked =
              member.role === UserRole.BandAdmin && managerCount <= 1
                ? "They're the only manager. Make another member a Band Admin first."
                : null;
            const showMenu = canManageBand && !isSelf;

            return (
              <Card key={member.id} className="flex flex-col overflow-hidden">
                <div className="bg-muted/20 aspect-square flex items-center justify-center">
                  <Avatar className="w-[220px] h-[220px] max-w-full rounded-lg shadow-md border border-muted">
                    {member.profilePicture && (
                      <AvatarImage
                        src={`data:image/jpeg;base64,${member.profilePicture}`}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="text-3xl font-semibold bg-secondary/30">
                      {member.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-3 flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold truncate">
                      {member.name}
                      {isSelf && (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          (you)
                        </span>
                      )}
                    </h4>
                    <Badge
                      variant={
                        isBandManagerRole(member.role) ? "default" : "secondary"
                      }
                      className="mt-1"
                    >
                      {MEMBER_ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                  </div>
                  {showMenu && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          disabled={busy}
                          aria-label={`Manage ${member.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        {member.role === UserRole.BandMember && (
                          <DropdownMenuItem
                            onSelect={() =>
                              changeRole(member, UserRole.BandAdmin)
                            }
                          >
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Make Band Admin
                          </DropdownMenuItem>
                        )}
                        {member.role === UserRole.BandAdmin && (
                          <DropdownMenuItem
                            disabled={!!demoteBlocked}
                            onSelect={() =>
                              changeRole(member, UserRole.BandMember)
                            }
                          >
                            <ShieldMinus className="h-4 w-4 mr-2" />
                            <div>
                              Make regular member
                              {demoteBlocked && (
                                <div className="text-xs text-muted-foreground">
                                  {demoteBlocked}
                                </div>
                              )}
                            </div>
                          </DropdownMenuItem>
                        )}
                        {isSiteAdmin && (
                          <DropdownMenuItem disabled>
                            <ShieldCheck className="h-4 w-4 mr-2" />
                            Site admin roles are managed in User Management
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={!!removalBlocked}
                          className="text-red-400 focus:text-red-300"
                          onSelect={() =>
                            setPendingRemoval({ member, isSelf: false })
                          }
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          <div>
                            Remove from band
                            {removalBlocked && (
                              <div className="text-xs text-muted-foreground">
                                {removalBlocked}
                              </div>
                            )}
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>

      <Dialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => !open && !busy && setPendingRemoval(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingRemoval?.isSelf
                ? `Leave ${bandName}?`
                : `Remove ${pendingRemoval?.member.name} from ${bandName}?`}
            </DialogTitle>
            <DialogDescription>
              {pendingRemoval?.isSelf
                ? "You'll lose access to the band dashboard. A band manager can add you back later."
                : `${pendingRemoval?.member.name} will lose access to the band dashboard.`}
              {pendingRemoval?.member.role !== UserRole.Admin &&
                " Their account becomes a regular listener account."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setPendingRemoval(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={confirmRemoval}
            >
              {pendingRemoval?.isSelf ? "Leave band" : "Remove member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
