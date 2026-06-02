"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ImgStatus } from "@/types";

interface Args {
  itemId: Id<"items">;
  name: string;
  currentImgStatus: ImgStatus;
}

export function useProductImage({ itemId, name, currentImgStatus }: Args) {
  const key = name.toLowerCase().trim();

  // Only query the cache when there's actually work to do
  const cached = useQuery(
    api.imgCache.getCached,
    currentImgStatus === "idle" ? { productName: key } : "skip"
  );

  const updateImgUrl = useMutation(api.items.updateImgUrl);
  const setCached = useMutation(api.imgCache.setCached);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (currentImgStatus !== "idle") return;
    if (cached === undefined) return; // cache query still loading
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function resolve() {
      try {
        await updateImgUrl({ itemId, imgUrl: undefined, imgStatus: "loading" });

        if (cached !== null) {
          // Cache hit — use stored result
          const imgUrl = cached.imgUrl;
          await updateImgUrl({
            itemId,
            imgUrl,
            imgStatus: imgUrl ? "done" : "error",
          });
          return;
        }

        // Cache miss — call the API route
        const res = await fetch(`/api/image-lookup?q=${encodeURIComponent(name)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { imgUrl: string | null } = await res.json();
        const imgUrl = data.imgUrl ?? undefined;

        await updateImgUrl({ itemId, imgUrl, imgStatus: imgUrl ? "done" : "error" });
        await setCached({ productName: key, imgUrl });
      } catch (err) {
        console.warn("[useProductImage] failed for", name, err);
        await updateImgUrl({ itemId, imgUrl: undefined, imgStatus: "error" }).catch(() => {});
      }
    }

    resolve();
  }, [currentImgStatus, cached, itemId, name, key, updateImgUrl, setCached]);
}
