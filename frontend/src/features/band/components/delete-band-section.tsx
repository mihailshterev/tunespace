import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { Input } from "@/shared/ui/input";
import { getErrorMessage } from "@/shared/api/error-message";
import { ROUTES } from "@/shared/utils/constants";

interface DeleteBandSectionProps {
  bandId: string;
  bandName: string;
  deleteBand: (bandId: string) => Promise<void>;
}

export function DeleteBandSection({
  bandId,
  bandName,
  deleteBand,
}: DeleteBandSectionProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);

  const confirmed = confirmation.trim() === bandName.trim();

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteBand(bandId);
      toast.success(`${bandName} was deleted`);
      setOpen(false);
      navigate(ROUTES.HOME);
    } catch (error) {
      toast.error(getErrorMessage(error, "The band couldn't be deleted."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="w-full border-red-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-400 text-lg">Danger zone</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Deleting the band removes its profile, events, merchandise, chats and
          followers. Every member goes back to a regular listener account.
        </p>
        <Button
          variant="destructive"
          className="gap-2 shrink-0"
          onClick={() => {
            setConfirmation("");
            setOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" /> Delete band
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={(next) => !busy && setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {bandName}?</DialogTitle>
            <DialogDescription>
              This can't be undone. Type the band's name to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={bandName}
            aria-label="Band name"
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!confirmed || busy}
              onClick={handleDelete}
            >
              Delete band
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
