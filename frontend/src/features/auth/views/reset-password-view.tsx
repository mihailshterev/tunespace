import { Suspense, useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { resetPassword } from "@/shared/auth/api/auth.service";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from "react-router";

function ResetPasswordContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!userId || !token) {
      toast("Invalid reset link. Please request a new password reset.");
      navigate("/auth/forgot-password");
    }
  }, [userId, token, navigate]);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors: { [key: string]: string } = {};

    const passwordValidationErrors = validatePassword(formData.newPassword);
    if (passwordValidationErrors.length > 0) {
      newErrors.newPassword = passwordValidationErrors[0];
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword({
        userId: userId!,
        token: token!,
        newPassword: formData.newPassword,
      });
      setIsSuccess(true);
      toast("Password reset successfully!");
    } catch {
      toast(
        "Invalid or expired reset token. Please request a new password reset."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/login")} className="w-full">
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userId || !token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="space-y-1 text-xs">
                  <li
                    className={
                      formData.newPassword.length >= 8 ? "text-green-600" : ""
                    }
                  >
                    • At least 8 characters
                  </li>
                  <li
                    className={
                      /(?=.*[a-z])/.test(formData.newPassword)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • One lowercase letter
                  </li>
                  <li
                    className={
                      /(?=.*[A-Z])/.test(formData.newPassword)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • One uppercase letter
                  </li>
                  <li
                    className={
                      /(?=.*\d)/.test(formData.newPassword)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • One number
                  </li>
                  <li
                    className={
                      /(?=.*[@$!%*?&])/.test(formData.newPassword)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            </div>

            <Button
              type="submit"
              disabled={
                isLoading || !formData.newPassword || !formData.confirmPassword
              }
              className="w-full"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>{" "}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Loading...</CardTitle>
          <CardDescription>
            Please wait while we process your request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ResetPasswordView() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
