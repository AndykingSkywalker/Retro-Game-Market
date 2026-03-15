"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/StoreProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      await signUp({
        username,
        email,
        password,
        profilePicture: profilePicture.trim() || undefined,
      });
      router.push("/");
    } catch {
      setLocalError("Could not create account. Please try different details.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="ui-card mx-auto w-full max-w-md p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Create Account</h1>
      <p className="mt-1 text-zinc-700">Sign up to save a basket and checkout faster.</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="ui-label">
          Username
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="ui-input"
            aria-invalid={Boolean(localError)}
            required
          />
        </label>

        <label className="ui-label">
          Email
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="ui-input"
            aria-invalid={Boolean(localError)}
            required
          />
        </label>

        <label className="ui-label">
          Password
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="ui-input"
            aria-invalid={Boolean(localError)}
            required
            minLength={6}
          />
        </label>

        <label className="ui-label">
          Profile picture URL (optional)
          <input
            id="register-profile-picture"
            type="url"
            value={profilePicture}
            onChange={(event) => setProfilePicture(event.target.value)}
            className="ui-input"
            aria-invalid={Boolean(localError)}
            placeholder="https://example.com/avatar.jpg"
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
          {isSubmitting ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </section>
  );
}


