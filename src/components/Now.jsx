import { now } from "../constants";

/**
 * Bordered "Now" card. Displays the small uppercase label and the body text from
 * the `now` export in constants. Lives in the hero's bottom row on the right side.
 */
export default function Now() {
  return (
    <div className="max-w-[320px] rounded-xl border border-edge p-4 text-sm leading-relaxed text-ink">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted">
        {now.label}
      </span>
      {now.body}
    </div>
  );
}
