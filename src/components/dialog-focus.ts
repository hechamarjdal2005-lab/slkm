import type { KeyboardEvent } from "react";

// Native dialogs make the background inert; wrap Tab explicitly so keyboard
// navigation stays within the panel instead of moving into browser chrome.
export function keepDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
    'a[href], button:not(:disabled), select:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
  )).filter(element => element.getClientRects().length > 0 && element.tabIndex >= 0);
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
}
