"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useStore } from "@/components/StoreProvider";
import { useTheme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3c0 6 4.79 10.79 9.79 9.79z" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, updateProfile } = useStore();
  const { mode, setMode } = useTheme();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfilePicture("");
      return;
    }

    setUsername(user.username);
    setEmail(user.email);
    setProfilePicture(user.profilePicture ?? "");
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateProfile({
        username,
        email,
        password: password || undefined,
        profilePicture: profilePicture.trim() || undefined,
      });
      setPassword("");
      setMessage("Profile updated.");
    } catch {
      setMessage("Could not update your profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <section className="ui-card p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-zinc-700">Please log in to edit your details.</p>
      </section>
    );
  }

  return (
    <section className="ui-card mx-auto w-full max-w-xl p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-zinc-900">Your Profile</h1>
      <p className="mt-1 text-zinc-700">Update your account details and avatar.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/profile/orders" className="ui-button-secondary inline-flex">
          View Order History
        </Link>
        <Link href="/profile/wishlist" className="ui-button-secondary inline-flex">
          Wishlist
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-zinc-200">
          {profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-zinc-500">No photo</span>
          )}
        </div>
        <label className="ui-label">
          Profile picture URL
          <input
            type="url"
            value={profilePicture}
            onChange={(event) => setProfilePicture(event.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="ui-input"
          />
        </label>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="ui-label">
          Username
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="ui-input"
            required
          />
        </label>

        <label className="ui-label">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="ui-input"
            required
          />
        </label>

        <label className="ui-label">
          New password (optional)
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="ui-input"
          />
        </label>

        {message ? <p className="text-sm text-zinc-700">{message}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="ui-button disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <div className="mt-6 border-t border-zinc-200 pt-5">
        <h2 className="text-base font-semibold text-zinc-900">Appearance</h2>
        <p className="mt-1 text-sm text-zinc-600">Choose your preferred colour scheme.</p>
        <div
          className="mt-3 inline-flex items-center gap-2 rounded-full"
          role="group"
          aria-label="Theme mode"
        >
          <button
            type="button"
            onClick={() => setMode("light")}
            aria-pressed={mode === "light"}
            aria-label="Use light theme"
            title="Light"
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              mode === "light" ? "ui-button" : "ui-button-secondary border-0 shadow-none"
            }`}
          >
            <SunIcon />
            Light
          </button>
          <button
            type="button"
            onClick={() => setMode("dark")}
            aria-pressed={mode === "dark"}
            aria-label="Use dark theme"
            title="Dark"
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              mode === "dark" ? "ui-button" : "ui-button-secondary border-0 shadow-none"
            }`}
          >
            <MoonIcon />
            Dark
          </button>
        </div>
      </div>
    </section>
  );
}

