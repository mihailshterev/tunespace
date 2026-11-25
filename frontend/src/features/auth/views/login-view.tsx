import AuthForm from "@/features/auth/components/auth-form";

export function LoginView() {
  return (
    <div className="w-full min-h-screen flex justify-center flex-col items-center gap-12">
      <h1
        className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 inline-block"
        style={{ fontSize: "4rem", lineHeight: "1.1" }}
      >
        TuneSpace
      </h1>
      <div className="flex justify-center items-center gap-4">
        <div className="flex flex-col justify-center items-center w-full">
          <AuthForm className="w-[750px]" type={"login"} />
        </div>
      </div>
    </div>
  );
}
