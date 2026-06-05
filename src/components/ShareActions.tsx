"use client";

import { useEffect, useState } from "react";

interface ShareActionsProps {
  /** the full invite URL */
  link: string;
  /** short message shown before the link in chat apps / email body */
  message: string;
  /** title for the native share sheet + email subject */
  title: string;
}

// A single round, branded share button.
function ShareButton({
  label,
  bg,
  href,
  onClick,
  children,
}: {
  label: string;
  bg: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      <span
        className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-card transition-transform duration-150 group-active:scale-90"
        style={{ background: bg }}
      >
        {children}
      </span>
      <span className="text-[11px] font-medium text-warm-subtle dark:text-gray-400">{label}</span>
    </>
  );

  const cls = "group flex flex-col items-center gap-1.5 flex-shrink-0 w-16";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={label}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={label}>
      {inner}
    </button>
  );
}

export function ShareActions({ link, message, title }: ShareActionsProps) {
  // Web Share API is only present on (mostly mobile) browsers — gate the native
  // button so we don't show a dead control on desktop Chrome/Firefox.
  const [canNativeShare, setCanNativeShare] = useState(false);
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const text = `${message} ${link}`;
  const enc = encodeURIComponent;

  async function handleNativeShare() {
    try {
      await navigator.share({ title, text: message, url: link });
    } catch {
      // user dismissed the sheet — nothing to do
    }
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {canNativeShare && (
        <ShareButton label="Share…" bg="#3b3b3b" onClick={handleNativeShare}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
        </ShareButton>
      )}

      <ShareButton label="WhatsApp" bg="#25D366" href={`https://wa.me/?text=${enc(text)}`}>
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </ShareButton>

      {/* fb-messenger:// opens the app on mobile; falls back to the m.me web flow elsewhere */}
      <ShareButton
        label="Messenger"
        bg="#0084FF"
        href={`fb-messenger://share/?link=${enc(link)}`}
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.001 11.639C.001 4.949 5.241 0 12 0s12 4.95 12 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.371-.16-3.461-.46a.96.96 0 00-.64.05l-2.381 1.05a.96.96 0 01-1.35-.85l-.06-2.13a.97.97 0 00-.32-.68A11.39 11.39 0 01.001 11.639zm8.32-2.13l-3.52 5.59c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.86-.01l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.58c.35-.54-.32-1.15-.82-.76l-3.79 2.87c-.25.2-.6.2-.86.01l-2.8-2.1a1.811 1.811 0 00-2.6.48z" />
        </svg>
      </ShareButton>

      <ShareButton
        label="Telegram"
        bg="#229ED9"
        href={`https://t.me/share/url?url=${enc(link)}&text=${enc(message)}`}
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.139-5.061 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </ShareButton>

      <ShareButton
        label="Email"
        bg="#6b7280"
        href={`mailto:?subject=${enc(title)}&body=${enc(text)}`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </ShareButton>

      <ShareButton label="SMS" bg="#34C759" href={`sms:?&body=${enc(text)}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </ShareButton>
    </div>
  );
}
