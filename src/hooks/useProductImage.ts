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
  const cached = useQuery(api.imgCache.getCached, { productName: key });
  const updateImgUrl = useMutation(api.items.updateImgUrl);
  const setCached = useMutation(api.imgCache.setCached);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (currentImgStatus !== "idle") return;
    if (cached === undefined) return; // query still loading
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function resolve() {
      await updateImgUrl({ itemId, imgUrl: undefined, imgStatus: "loading" });

      if (cached !== null && cached !== undefined) {
        const imgUrl = cached.imgUrl;
        await updateImgUrl({
          itemId,
          imgUrl,
          imgStatus: imgUrl ? "done" : "error",
        });
        return;
      }

      try {
        const res = await fetch(
          `/api/image-lookup?q=${encodeURIComponent(name)}`
        );
        const data: { imgUrl: string | null } = await res.json();
        const imgUrl = data.imgUrl ?? undefined;
        await updateImgUrl({ itemId, imgUrl, imgStatus: imgUrl ? "done" : "error" });
        await setCached({ productName: key, imgUrl });
      } catch {
        await updateImgUrl({ itemId, imgUrl: undefined, imgStatus: "error" });
      }
    }

    resolve();
  }, [currentImgStatus, cached, itemId, name, key, updateImgUrl, setCached]);
}
