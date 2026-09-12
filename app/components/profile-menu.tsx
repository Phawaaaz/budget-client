"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ChevronsUpDown, Info, Keyboard, LogOut } from "lucide-react";
import { signOut } from "../lib/auth";

type Props = { variant: "sidebar" | "topbar"; onAbout: () => void; onShortcuts: () => void };

/** Account menu. The sidebar variant rises above the profile block; the topbar variant drops below the avatar. Positioned fixed so the scrolling sidebar can't clip it. */
export default function ProfileMenu({ variant, onAbout, onShortcuts }: Props) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({});
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const place = useCallback(() => {
    const r = trigger.current?.getBoundingClientRect();
    if (!r) return;
    setPosition(variant === "sidebar"
      ? { left: r.left, bottom: window.innerHeight - r.top + 8, width: Math.max(r.width, 236) }
      : { right: window.innerWidth - r.right, top: r.bottom + 8, width: 264 });
  }, [variant]);

  const hide = useCallback((returnFocus = true) => {
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); if (returnFocus) trigger.current?.focus(); }, 120);
  }, []);

  useEffect(() => {
    if (!open || closing) return;
    const items = () => [...(menu.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
    items()[0]?.focus();
    function onPointer(e: PointerEvent) {
      const target = e.target as Node;
      if (!menu.current?.contains(target) && !trigger.current?.contains(target)) hide(false);
    }
    function onKey(e: KeyboardEvent) {
      const list = items();
      const at = list.indexOf(document.activeElement as HTMLElement);
      const move = (i: number) => { e.preventDefault(); list[(i + list.length) % list.length]?.focus(); };
      if (e.key === "Escape") { e.preventDefault(); hide(); }
      else if (e.key === "ArrowDown") move(at + 1);
      else if (e.key === "ArrowUp") move(at - 1);
      else if (e.key === "Home") move(0);
      else if (e.key === "End") move(list.length - 1);
      else if (e.key === "Tab") hide(false);
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    return () => { window.removeEventListener("pointerdown", onPointer); window.removeEventListener("keydown", onKey); window.removeEventListener("resize", place); };
  }, [open, closing, hide, place]);

  function toggle() { if (open) { hide(); return; } place(); setOpen(true); }
  // Close at once and hand focus back to the trigger first, so a dialog opened by the action restores focus there.
  function choose(action: () => void) { setOpen(false); setClosing(false); trigger.current?.focus(); action(); }

  return <>
    <button ref={trigger} type="button" className={variant === "sidebar" ? "profile-trigger" : "profile-avatar"} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} aria-label={variant === "topbar" ? "Account menu" : undefined} title={variant === "topbar" ? "Account" : undefined} onClick={toggle}>
      {variant === "sidebar" ? <><span className="avatar" aria-hidden="true">F</span><span className="profile-name">Fawaz<small>Personal workspace</small></span><ChevronsUpDown size={15} aria-hidden="true" /></> : "F"}
    </button>
    {open && <div ref={menu} id={menuId} role="menu" aria-label="Account" className={`profile-menu is-${variant}${closing ? " closing" : ""}`} style={position}>
      <div className="profile-menu-head" role="presentation"><span className="avatar" aria-hidden="true">F</span><span>Fawaz<small>Personal workspace · Sample data</small></span></div>
      <button role="menuitem" type="button" onClick={() => choose(onAbout)}><Info size={16} aria-hidden="true" /> About this workspace</button>
      <button role="menuitem" type="button" onClick={() => choose(onShortcuts)}><Keyboard size={16} aria-hidden="true" /> Keyboard shortcuts <kbd>?</kbd></button>
      <div className="profile-menu-rule" role="separator" />
      <form action={signOut}><button role="menuitem" type="submit"><LogOut size={16} aria-hidden="true" /> Sign out</button></form>
    </div>}
  </>;
}
