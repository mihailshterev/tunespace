import { Suspense, useState } from "react";
import { resendEmailConfirmation } from "@/shared/auth/api/auth.service";
import { ROUTES } from "@/shared/utils/constants";
import { Mail, RefreshCw } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

function EmailConfirmationSentContent() {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email") || "";

  const handleResendConfirmation = async () => {
    if (!email) {
      setResendError("Email address not found. Please register again.");
      return;
    }

    setIsResending(true);
    setResendError("");
    setResendMessage("");

    try {
      const response = await resendEmailConfirmation(email);
      setResendMessage(response.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.data?.message) {
        setResendError(error.response.data.message);
      } else {
        setResendError(
          "Failed to resend confirmation email. Please try again."
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
        <div className="text-center">
          <div className="mb-6">
            <Mail className="w-16 h-16 text-indigo-400 mx-auto" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            Check Your Email
          </h1>

          <p className="text-gray-300 mb-6">
            We&apos;ve sent a confirmation email to{" "}
            <span className="font-semibold text-white">{email}</span>. Please
            click the link in the email to confirm your account.
          </p>

          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400">
              📧 Didn&apos;t receive the email? Check your spam folder or wait a
              few minutes for it to arrive.
            </p>
          </div>

          {resendMessage && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm">{resendMessage}</p>
            </div>
          )}

          {resendError && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{resendError}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendConfirmation}
              disabled={isResending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isResending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {isResending ? "Sending..." : "Resend Confirmation Email"}
            </button>

            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            If you continue to have problems, please contact our support team.
          </p>
        </div>
      </div>{" "}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
        <div className="text-center">
          <div className="mb-6">
            <Mail className="w-16 h-16 text-indigo-400 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
          <p className="text-gray-300">
            Please wait while we process your request.
          </p>
        </div>
      </div>
    </div>
  );
}

export function EmailConfirmationSentView() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailConfirmationSentContent />
    </Suspense>
  );
}
