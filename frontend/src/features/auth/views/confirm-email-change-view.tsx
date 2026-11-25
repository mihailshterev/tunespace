import { Suspense, useEffect, useState } from "react";
import { confirmEmailChange } from "@/shared/auth/api/auth.service";
import { ROUTES } from "@/shared/utils/constants";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

function ConfirmEmailChangeContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmUserEmailChange = async () => {
      const userId = searchParams.get("userId");
      const token = searchParams.get("token");
      const newEmail = searchParams.get("newEmail");

      if (!userId || !token || !newEmail) {
        setStatus("error");
        setMessage(
          "Invalid confirmation link. Please check your email for the correct link."
        );
        return;
      }

      try {
        const response = await confirmEmailChange({
          userId,
          token,
          newEmail,
        });
        setStatus("success");
        setMessage(response.message);

        setTimeout(() => {
          navigate(ROUTES.LOGIN);
        }, 5000);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setStatus("error");
        if (error?.response?.data?.message) {
          setMessage(error.response.data.message);
        } else if (error?.response?.status === 400) {
          setMessage(
            "Invalid or expired confirmation token. Please request a new email change."
          );
        } else {
          setMessage(
            "An error occurred while confirming your email change. Please try again."
          );
        }
      }
    };

    confirmUserEmailChange();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
        <div className="text-center">
          <div className="mb-6">
            {status === "loading" && (
              <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto" />
            )}
            {status === "success" && (
              <div className="flex justify-center items-center space-x-2">
                <CheckCircle className="w-16 h-16 text-green-400" />
                <Mail className="w-12 h-12 text-green-400" />
              </div>
            )}
            {status === "error" && (
              <XCircle className="w-16 h-16 text-red-400 mx-auto" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            {status === "loading" && "Confirming email change..."}
            {status === "success" && "Email Changed Successfully!"}
            {status === "error" && "Email Change Failed"}
          </h1>

          <p className="text-gray-300 mb-6">{message}</p>

          {status === "success" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Your email address has been updated. Please log in again with
                your new email.
              </p>
              <p className="text-xs text-gray-500">
                Redirecting you to login in a few seconds...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate(ROUTES.HOME)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          )}
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
            <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto" />
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

export function ConfirmEmailChangeView() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmEmailChangeContent />
    </Suspense>
  );
}
