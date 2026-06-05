import { Id } from "../../convex/_generated/dataModel";

export type Store = string; // any store name, e.g. "lidl", "ah", "jumbo"
export type ImgStatus = "idle" | "loading" | "done" | "error";
export type GroupRole = "owner" | "member";
export type ViewMode = "list" | "grid";

export interface GroceryItem {
  _id: Id<"items">;
  listId: Id<"lists">;
  store: Store;
  name: string;
  qty: number;
  done: boolean;
  imgUrl?: string;
  imgStatus: ImgStatus;
  note?: string;
  createdAt: number;
}

export interface GroceryList {
  _id: Id<"lists">;
  ownerId: string;
  name: string;
  groupId?: Id<"groups">;
  groupName?: string | null;
  memberCount?: number;
  lidlCount: number;
  ahCount: number;
  totalCount: number;
  isOwner: boolean;
  createdAt: number;
}

// A home-screen suggestion (store-popular product, popular pick, or favourite).
// `store` is set for store-specific rows so Quick Add can preselect it.
export interface SuggestionItem {
  name: string;
  imgUrl: string | null;
  isPersonal?: boolean;
  store?: string;
  price?: number | null;
  unit?: string | null;
}

export interface Group {
  _id: Id<"groups">;
  name: string;
  ownerId: string;
  createdAt: number;
}

export interface GroupMember {
  _id: Id<"groupMembers">;
  groupId: Id<"groups">;
  userId: string;
  role: GroupRole;
  joinedAt: number;
}
