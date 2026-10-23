import type { Photo } from "./types";

/** A cropped, compressed copy from the provider's CDN (hotlinked, as Unsplash requires), at 2x for sharp screens. */
export function photoUrl(photo: Photo, w: number, h = w): string {
  const join = photo.src.includes("?") ? "&" : "?";
  const W = Math.round(w), H = Math.round(h);
  return photo.provider === "unsplash"
    ? `${photo.src}${join}w=${W}&h=${H}&fit=crop&auto=format&q=70&dpr=2`
    : `${photo.src}${join}auto=compress&cs=tinysrgb&fit=crop&w=${W}&h=${H}&dpr=2`;
}

const UTM = "utm_source=pairing_explorer&utm_medium=referral";
/** Credit links: Unsplash asks for referral parameters on every link back. */
export function creditLinks(photo: Photo): { by: string; site: string; siteName: string } {
  if (photo.provider === "unsplash") {
    const add = (u: string) => `${u}${u.includes("?") ? "&" : "?"}${UTM}`;
    return { by: add(photo.byUrl), site: add("https://unsplash.com/"), siteName: "Unsplash" };
  }
  return { by: photo.byUrl, site: photo.url, siteName: "Pexels" };
}
