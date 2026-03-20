"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/components/StoreProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useStore();
  const redirectedFromProtectedRoute = Boolean(searchParams.get("next"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      await signIn(username, password);
      const nextPath = searchParams.get("next");
      const safeNextPath = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
        ? nextPath
        : "/";
      router.push(safeNextPath);
    } catch {
      setLocalError("Login failed. Check your username and password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="ui-card mx-auto w-full max-w-md p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Login</h1>
      <p className="mt-1 text-zinc-700">Sign in to continue to your account.</p>

      {redirectedFromProtectedRoute ? (
        <p className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800" role="status" aria-live="polite">
          Please sign in to continue.
        </p>
      ) : null}

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="ui-label">
          Username
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="ui-input"
            aria-invalid={Boolean(localError)}
            required
          />
        </label>

        <label className="ui-label">
          Password
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="ui-input"
            aria-invalid={Boolean(localError)}
            required
          />
        </label>

        {localError ? (
          <p className="text-sm text-red-600" role="alert" aria-live="assertive">
            {localError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="ui-button w-full disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="ui-card mx-auto w-full max-w-md p-6">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}


