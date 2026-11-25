import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/shared/forms/zod-resolver";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { AlertCircle, Mail, Lock, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { changeEmail, forgotPassword } from "@/shared/auth/api/auth.service";
import { toast } from "sonner";

const emailChangeSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
});

type EmailChangeForm = z.infer<typeof emailChangeSchema>;

const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type PasswordResetForm = z.infer<typeof passwordResetSchema>;

interface ProfileSettingsProps {
  userEmail: string;
  isExternalProvider: boolean;
}

const ProfileSettings = ({
  userEmail,
  isExternalProvider,
}: ProfileSettingsProps) => {
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] =
    useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    reset: resetEmailForm,
  } = useForm<EmailChangeForm>({
    resolver: zodResolver(emailChangeSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordResetForm>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: userEmail,
    },
  });

  const onEmailChange = async (data: EmailChangeForm) => {
    if (isExternalProvider) {
      toast("External provider users cannot change their email address.");
      return;
    }

    setIsChangingEmail(true);
    setEmailChangeSuccess(false);

    try {
      const response = await changeEmail({ newEmail: data.newEmail });
      setEmailChangeSuccess(true);
      resetEmailForm();
      toast(
        response.message ||
          "Email change confirmation sent to your new email address."
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to request email change. Please try again.";
      toast(errorMessage);
    } finally {
      setIsChangingEmail(false);
    }
  };

  const onPasswordReset = async (data: PasswordResetForm) => {
    if (isExternalProvider) {
      toast("External provider users cannot reset their password.");
      return;
    }

    setIsRequestingPasswordReset(true);
    setPasswordResetSuccess(false);

    try {
      const response = await forgotPassword({ email: data.email });
      setPasswordResetSuccess(true);
      toast(
        response.message ||
          "Password reset email sent. Please check your inbox."
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to send password reset email. Please try again.";
      toast(errorMessage);
    } finally {
      setIsRequestingPasswordReset(false);
    }
  };

  if (isExternalProvider) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your account is managed by an external provider (Spotify). Email
              and password changes are not available. Please manage your account
              settings through your Spotify account.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Change Email Address</h3>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Current Email
            </Label>
            <div className="p-3 bg-muted/50 rounded-md text-sm">
              {userEmail}
            </div>
          </div>

          {emailChangeSuccess && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Email change confirmation sent! Please check your new email
                address and click the confirmation link.
              </AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleEmailSubmit(onEmailChange)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="Enter new email address"
                {...registerEmail("newEmail")}
                disabled={isChangingEmail}
              />
              {emailErrors.newEmail && (
                <p className="text-sm text-destructive">
                  {emailErrors.newEmail.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isChangingEmail}
              className="w-full sm:w-auto"
            >
              {isChangingEmail ? "Sending..." : "Change Email"}
            </Button>
          </form>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Reset Password</h3>
          </div>

          <p className="text-sm text-muted-foreground">
            Request a password reset link to be sent to your email address.
          </p>

          {passwordResetSuccess && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Password reset email sent! Please check your inbox and follow
                the instructions.
              </AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handlePasswordSubmit(onPasswordReset)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email Address</Label>
              <Input
                id="resetEmail"
                type="email"
                {...registerPassword("email")}
                disabled={isRequestingPasswordReset}
                readOnly
                className="bg-muted/50"
              />
              {passwordErrors.email && (
                <p className="text-sm text-destructive">
                  {passwordErrors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="outline"
              disabled={isRequestingPasswordReset}
              className="w-full sm:w-auto"
            >
              {isRequestingPasswordReset ? "Sending..." : "Send Reset Email"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
