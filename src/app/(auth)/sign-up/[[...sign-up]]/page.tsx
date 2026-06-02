import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <SignUp />
    </main>
  );
}
