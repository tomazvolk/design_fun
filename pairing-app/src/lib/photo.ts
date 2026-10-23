import type { Photo } from "./types";

/** A cropped, compressed copy from the Pexels CDN, at 2x for sharp screens. */
export function photoUrl(photo: Photo, w: number, h = w): string {
  return `${photo.src}?auto=compress&cs=tinysrgb&fit=crop&w=${Math.round(w)}&h=${Math.round(h)}&dpr=2`;
}
