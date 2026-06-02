import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <SignIn />
    </main>
  );
}
