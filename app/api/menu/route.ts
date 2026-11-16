import { cacheLife } from "next/cache";
import { connection } from "next/server";
import { slimMenu, type RawMenu } from "@/lib/slim";
import type { SlimMenu } from "@/lib/types";

// UT_MENU_URL lets you point at a broken URL to test the "menu unavailable" screen.
const UT_URL = process.env.UT_MENU_URL || "https://hf-foodpro.austin.utexas.edu/foodpro/data_all_endpoint.php?menu=1";
const SIX_HOURS = 6 * 60 * 60;

/**
 * Fetches UT's menu at most once every ~6 hours per server, slims it, and caches
 * the slim result. If the fetch throws, nothing is cached and the last good copy
 * keeps being served until it expires.
 */
async function getMenu(): Promise<SlimMenu> {
  "use cache";
  cacheLife({ stale: 300, revalidate: SIX_HOURS, expire: 3 * 24 * 60 * 60 });

  const res = await fetch(UT_URL, {
    headers: { "User-Agent": "LonghornMacros-unofficial/1.0 (student side project)" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`UT menu returned ${res.status}`);
  return slimMenu((await res.json()) as RawMenu);
}

export async function GET() {
  await connection(); // run per request (served from the cache above), so errors are never baked into the build
  try {
    const menu = await getMenu();
    return Response.json(menu, {
      headers: {
        // Vercel's CDN keeps this for 6h, and serves stale for up to a day while refreshing.
        "Cache-Control": `public, s-maxage=${SIX_HOURS}, stale-while-revalidate=86400`,
      },
    });
  } catch (err) {
    console.error("[api/menu] failed to load UT menu:", err);
    return Response.json(
      { error: "UT's menu server didn't respond" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
