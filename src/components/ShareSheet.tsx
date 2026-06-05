"use client";

import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { ShareActions } from "./ShareActions";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Group } from "@/types";

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  listId: Id<"lists">;
  listName: string;
  currentGroupId?: Id<"groups"> | null;
  currentGroupName?: string | null;
  groups: Group[];
  isOwner: boolean;
  /** called after a non-owner leaves the household (they lose list access) */
  onLeft?: () => void;
}

export function ShareSheet({
  isOpen,
  onClose,
  listId,
  listName,
  currentGroupId,
  currentGroupName,
  groups,
  isOwner,
  onLeft,
}: ShareSheetProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const createGroupMutation = useMutation(api.groups.createGroup);
  const shareListMutation = useMutation(api.lists.shareListWithGroup);
  const unshareListMutation = useMutation(api.lists.unshareList);
  const createTokenMutation = useMutation(api.groups.createInviteToken);
  const leaveGroupMutation = useMutation(api.groups.leaveGroup);

  async function handleLeave() {
    if (!currentGroupId) return;
    await leaveGroupMutation({ groupId: currentGroupId });
    handleClose();
    onLeft?.();
  }

  const members = useQuery(
    api.groups.getGroupMembers,
    currentGroupId ? { groupId: currentGroupId } : "skip"
  );

  async function handleCreateGroupAndShare() {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    setCreatingGroup(true);
    try {
      const groupId = await createGroupMutation({ name: trimmed });
      await shareListMutation({ listId, groupId });
      await generateInvite(groupId);
    } finally {
      setCreatingGroup(false);
      setNewGroupName("");
    }
  }

  async function generateInvite(groupId: Id<"groups">) {
    const token = await createTokenMutation({ groupId });
    const base = window.location.origin;
    setInviteLink(`${base}/join/${token}`);
  }

  async function handleCopy() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShareWithExistingGroup(groupId: Id<"groups">) {
    await shareListMutation({ listId, groupId });
    await generateInvite(groupId);
  }

  function handleClose() {
    setInviteLink(null);
    setCopied(false);
    setNewGroupName("");
    onClose();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={`Share "${listName}"`}>
      <div className="space-y-4">
        {/* Already shared */}
        {currentGroupId && currentGroupName ? (
          <>
            <div className="flex items-center gap-3 p-3 bg-warm-bg dark:bg-gray-800 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-warm-text/10 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-warm-text dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-warm-text dark:text-gray-100">{currentGroupName}</p>
                <p className="text-xs text-warm-subtle dark:text-gray-500">
                  {members ? `${members.length} member${members.length !== 1 ? "s" : ""}` : "…"}
                </p>
              </div>
            </div>

            {/* Invite link */}
            {inviteLink ? (
              <div className="space-y-2">
                <p className="text-xs text-warm-subtle dark:text-gray-500 font-medium">Invite link</p>
                <div className="flex gap-2">
                  <p className="flex-1 text-xs bg-warm-bg dark:bg-gray-800 rounded-xl px-3 py-3 text-warm-subtle dark:text-gray-400 truncate font-mono">
                    {inviteLink}
                  </p>
                  <button
                    onClick={handleCopy}
                    className={[
                      "px-4 rounded-xl text-xs font-bold transition-colors",
                      copied
                        ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        : "bg-warm-text dark:bg-gray-100 text-warm-card dark:text-gray-900",
                    ].join(" ")}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                {/* Send the invite straight to WhatsApp / Messenger / etc. */}
                <p className="text-xs text-warm-subtle dark:text-gray-500 font-medium pt-1">Send via</p>
                <ShareActions
                  link={inviteLink}
                  title={`Join ${currentGroupName} on Groceries`}
                  message={`Join "${listName}" — our shared grocery list:`}
                />
              </div>
            ) : (
              <button
                onClick={() => generateInvite(currentGroupId)}
                className="w-full h-12 rounded-2xl border-2 border-warm-muted dark:border-gray-700 text-sm font-semibold text-warm-text dark:text-gray-100 transition-colors active:bg-warm-muted dark:active:bg-gray-800"
              >
                Get invite link
              </button>
            )}

            {isOwner ? (
              <button
                onClick={() => unshareListMutation({ listId })}
                className="w-full h-10 rounded-xl text-xs font-medium text-red-400 active:bg-red-50 dark:active:bg-red-950/20 transition-colors"
              >
                Remove from household
              </button>
            ) : (
              <button
                onClick={handleLeave}
                className="w-full h-10 rounded-xl text-xs font-medium text-red-400 active:bg-red-50 dark:active:bg-red-950/20 transition-colors"
              >
                Leave household
              </button>
            )}
          </>
        ) : (
          <>
            {/* Share with existing group */}
            {groups.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-warm-subtle dark:text-gray-500 uppercase tracking-wide">Your households</p>
                {groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => handleShareWithExistingGroup(group._id)}
                    className="w-full flex items-center gap-3 p-3 bg-warm-bg dark:bg-gray-800 rounded-2xl active:bg-warm-muted dark:active:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-warm-text/10 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-4 h-4 text-warm-text dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-warm-text dark:text-gray-100 flex-1 text-left">{group.name}</span>
                    <svg className="w-4 h-4 text-warm-muted dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-warm-muted dark:bg-gray-800" />
                  <span className="text-xs text-warm-subtle dark:text-gray-600">or</span>
                  <div className="flex-1 h-px bg-warm-muted dark:bg-gray-800" />
                </div>
              </div>
            )}

            {/* Create new household */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-warm-subtle dark:text-gray-500 uppercase tracking-wide">Create a household</p>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Our Home, Family…"
                className={[
                  "w-full min-h-[48px] px-4 rounded-2xl text-base font-medium",
                  "bg-warm-bg dark:bg-gray-800 text-warm-text dark:text-gray-100",
                  "placeholder:text-warm-subtle dark:placeholder:text-gray-500",
                  "border-0 focus:outline-none focus:ring-2 focus:ring-warm-text/20",
                ].join(" ")}
                autoComplete="off"
              />
              <button
                onClick={handleCreateGroupAndShare}
                disabled={!newGroupName.trim() || creatingGroup}
                className={[
                  "w-full h-12 rounded-2xl font-bold text-sm",
                  "bg-warm-text dark:bg-gray-100 text-warm-card dark:text-gray-900",
                  "transition-all duration-150 active:scale-[0.98]",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {creatingGroup ? "Creating…" : "Create & share"}
              </button>
            </div>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
