"use client";

import { useEffect, useRef, useState } from "react";
import {
  listNotificationsAction,
  markNotificationsReadAction,
  type NotificationItem,
} from "@/lib/notifications/actions";

/**
 * Cloche de notifications (7.0 §5) — chargée au montage (pas de temps réel
 * en v1, H103). Ouvrir le panneau marque tout comme lu.
 */
export function NotificationsBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listNotificationsAction()
      .then(({ items, unread }) => {
        setItems(items);
        setUnread(unread);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      markNotificationsReadAction().catch(() => {});
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label={`Notifications${unread > 0 ? ` (${unread} non lues)` : ""}`}
        aria-expanded={open}
        className="relative flex size-9 items-center justify-center rounded-full text-secondary transition-colors duration-(--duration-fast) hover:bg-surface-raised hover:text-primary"
      >
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 9a2.5 2.5 0 0 0 4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-on-brand">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Notifications"
          className="absolute right-0 top-11 z-150 w-80 rounded-(--radius-l) border border-white/10 bg-surface-overlay p-2 shadow-xl"
        >
          <ul className="max-h-96 space-y-1 overflow-y-auto">
            {items.length === 0 && (
              <li className="p-3 text-sm text-secondary">Aucune notification pour l&apos;instant.</li>
            )}
            {items.map((n) => (
              <li key={n.id} className={`rounded-(--radius-m) p-3 ${n.read ? "" : "bg-surface-raised"}`}>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-secondary">{n.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
