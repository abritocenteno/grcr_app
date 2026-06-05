// Dev/maintenance utilities — run from the CLI, e.g.
//   npx convex run maintenance:reresolveImages
//
// These are intentionally NOT auth-gated so they can be invoked from the
// Convex CLI (which has no user identity). Keep them out of any client code.

import { mutation } from "./_generated/server";

// Wipe the image cache and reset every item to "idle" so each one re-resolves
// its photo through the current image-lookup logic. Use this after changing
// the matching rules to clear out stale/wrong images that were stored before.
export const reresolveImages = mutation({
  args: {},
  handler: async (ctx) => {
    const cached = await ctx.db.query("imgCache").collect();
    await Promise.all(cached.map((c) => ctx.db.delete(c._id)));

    const items = await ctx.db.query("items").collect();
    await Promise.all(
      items.map((i) =>
        ctx.db.patch(i._id, { imgUrl: undefined, imgStatus: "idle" as const })
      )
    );

    return { clearedCache: cached.length, resetItems: items.length };
  },
});
