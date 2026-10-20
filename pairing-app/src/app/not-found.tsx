import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-6 pt-24 text-center">
      <h1 className="t-display text-[2rem]">Nothing here.</h1>
      <p className="mt-2 text-muted">That page is not on the map.</p>
      <Link href="/" className="btn-primary mt-8">Back to search</Link>
    </div>
  );
}
