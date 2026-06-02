import { Id } from "../../convex/_generated/dataModel";

export type Store = "lidl" | "ah";

export type ImgStatus = "idle" | "loading" | "done" | "error";

export interface GroceryItem {
  _id: Id<"items">;
  listId: Id<"lists">;
  name: string;
  qty: number;
  done: boolean;
  imgUrl?: string;
  imgStatus: ImgStatus;
  note?: string;
  createdAt: number;
}
