"use client";

import { useEffect, useRef } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "./ToastProvider";

// Watches recent additions to the user's shared lists (by other members) and
// raises an in-app toast for each new one. Renders nothing.
export function ActivityWatcher() {
  const { isAuthenticated } = useConvexAuth();
  const activity = useQuery(
    api.items.getRecentActivity,
    isAuthenticated ? {} : "skip"
  );
  const { showToast } = useToast();

  // Item ids we've already accounted for. On the first non-empty result we mark
  // everything as seen (priming) so we don't toast items that already existed
  // when the app opened — only genuinely new ones after that.
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    if (!activity) return;

    if (!primed.current) {
      for (const a of activity) seen.current.add(a._id);
      primed.current = true;
      return;
    }

    for (const a of activity) {
      if (seen.current.has(a._id)) continue;
      seen.current.add(a._id);
      showToast({
        title: `${a.addedByName} added "${a.name}"`,
        subtitle: `to ${a.listName}`,
        store: a.store,
        listId: a.listId,
      });
    }
  }, [activity, showToast]);

  return null;
}
