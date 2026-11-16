"use client";

import { useEffect, useState } from "react";
import type { SlimMenu } from "./types";

const CACHE_KEY = "lm:v1:menuCache";

type State =
  | { status: "loading"; menu: null; error: null }
  | { status: "ok"; menu: SlimMenu; error: null }
  | { status: "stale"; menu: SlimMenu; error: string } // fetch failed, showing saved copy
  | { status: "error"; menu: null; error: string };

let inflight: Promise<SlimMenu> | null = null;
let memo: SlimMenu | null = null;

function loadSaved(): SlimMenu | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as SlimMenu) : null;
  } catch {
    return null;
  }
}

async function fetchMenu(): Promise<SlimMenu> {
  const res = await fetch("/api/menu");
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || body.error) throw new Error(body?.error ?? `Menu request failed (${res.status})`);
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(body));
  } catch {}
  return body as SlimMenu;
}

/** Loads the menu once per app session; falls back to the last saved copy if offline/failing. */
export function useMenu(): State {
  const [state, setState] = useState<State>(() =>
    memo ? { status: "ok", menu: memo, error: null } : { status: "loading", menu: null, error: null },
  );

  useEffect(() => {
    if (memo) return;
    let alive = true;
    inflight ??= fetchMenu();
    inflight
      .then((menu) => {
        memo = menu;
        if (alive) setState({ status: "ok", menu, error: null });
      })
      .catch((e: Error) => {
        inflight = null;
        const saved = loadSaved();
        if (!alive) return;
        setState(
          saved
            ? { status: "stale", menu: saved, error: e.message }
            : { status: "error", menu: null, error: e.message },
        );
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
