import { Link } from "react-router";
import { Ban, RotateCcw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ROUTES, UserRole } from "@/shared/utils/constants";
import { cn } from "@/shared/utils/cn";
import { isBandManagerRole } from "@/features/band/types/band";
import type { ManagedUser } from "@/features/admin/types/managed-user";
import { useUserAvatar } from "@/features/admin/hooks/useUserManagement";
import {
  ROLE_LABELS,
  formatLastActive,
  getRoleOption,
  isSoleManager,
} from "@/features/admin/utils";

interface UserRowProps {
  user: ManagedUser;
  isCurrentUser: boolean;
  isPending: boolean;
  onRoleChange: (user: ManagedUser, role: UserRole) => void;
  onToggleSuspended: (user: ManagedUser) => void;
}

export function UserRow({
  user,
  isCurrentUser,
  isPending,
  onRoleChange,
  onToggleSuspended,
}: UserRowProps) {
  const locked = isCurrentUser || isPending;
  const avatarUrl = useUserAvatar(user.username, user.hasProfilePicture);

  return (
    <tr
      className={cn(
        "border-b border-border/60 last:border-0 transition-colors hover:bg-muted/40",
        user.isSuspended && "bg-destructive/5",
      )}
    >
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            {avatarUrl && (
              <AvatarImage
                src={avatarUrl}
                alt=""
                className="object-cover"
              />
            )}
            <AvatarFallback className="text-xs">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-medium">
              <Link
                to={`${ROUTES.PROFILE}/${user.username}`}
                className="truncate hover:underline"
              >
                {user.username}
              </Link>
              {isCurrentUser && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  You
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {user.email}
              {user.externalProvider && ` · via ${user.externalProvider}`}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        {user.band ? (
          <div className="min-w-0">
            <Link
              to={`${ROUTES.BAND}/${user.band.id}`}
              className="block truncate max-w-[160px] hover:underline"
            >
              {user.band.name}
            </Link>
            <div className="text-xs text-muted-foreground">
              {isBandManagerRole(user.role) ? "Manager" : "Member"}
              {isSoleManager(user) && " · only manager"}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-3">
        <Select
          value={user.role}
          disabled={locked}
          onValueChange={(value) => onRoleChange(user, value as UserRole)}
        >
          <SelectTrigger
            className="h-8 w-[150px]"
            aria-label={`Role for ${user.username}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-[280px]">
            {Object.values(UserRole).map((role) => {
              const option = getRoleOption(user, role);
              return (
                <SelectItem
                  key={role}
                  value={role}
                  disabled={option.kind === "blocked"}
                >
                  <span>{ROLE_LABELS[role]}</span>
                  {option.kind === "blocked" && (
                    <span className="block text-xs text-muted-foreground whitespace-normal">
                      {option.reason}
                    </span>
                  )}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </td>
      <td className="py-3 px-3">
        <div className="flex flex-wrap gap-1.5">
          {user.isSuspended ? (
            <Badge variant="destructive">Suspended</Badge>
          ) : (
            <Badge variant="secondary">Active</Badge>
          )}
          {!user.emailConfirmed && (
            <Badge variant="outline" className="text-muted-foreground">
              Unverified
            </Badge>
          )}
        </div>
      </td>
      <td className="py-3 px-3 text-sm text-muted-foreground whitespace-nowrap">
        {formatLastActive(user.lastActiveDate)}
      </td>
      <td className="py-3 pl-3 pr-4 text-right">
        <Button
          variant={user.isSuspended ? "outline" : "ghost"}
          size="sm"
          disabled={locked}
          onClick={() => onToggleSuspended(user)}
          className={cn(
            "gap-1.5",
            !user.isSuspended &&
              "text-red-400 hover:text-red-300 hover:bg-red-500/10",
          )}
        >
          {user.isSuspended ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" /> Restore
            </>
          ) : (
            <>
              <Ban className="h-3.5 w-3.5" /> Suspend
            </>
          )}
        </Button>
      </td>
    </tr>
  );
}
