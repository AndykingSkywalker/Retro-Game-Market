"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useStore } from "@/components/StoreProvider";

export default function ProfilePage() {
  const { user, updateProfile } = useStore();

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
    </section>
  );
}

