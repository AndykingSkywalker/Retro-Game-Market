"use client";

import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  useTheme();
  // Applies stored theme on mount — UI controls are now on the profile page.
  return null;
}
