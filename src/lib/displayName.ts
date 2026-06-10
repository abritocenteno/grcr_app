// Minimal shape of the fields we read off Clerk's user object (from useUser()).
interface NamedUser {
  firstName?: string | null;
  fullName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
}

// Best-effort human-readable name for the signed-in Clerk user, used when
// attributing item additions to a person in member notifications.
export function displayName(user: NamedUser | null | undefined): string | undefined {
  if (!user) return undefined;
  const name =
    user.firstName ||
    user.fullName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress;
  return name || undefined;
}
