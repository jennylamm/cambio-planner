import { formatAUD } from "@/lib/catalog";
import type { TallyLine } from "@/lib/useDesign";

/** Itemised cost summary for the right-hand tally panel. */
export function Tally({
  lines,
  totalSale,
  totalRrp,
}: {
  lines: TallyLine[];
  totalSale: number;
  totalRrp: number;
}) {
  return (
    <div className="w-full">
      {lines.length === 0 ? (
        <div className="text-xs text-base-content/40">Nothing added yet.</div>
      ) : (
        <div className="flex flex-col">
          {lines.map((l) => (
            <div
              key={l.key}
              className="flex items-baseline gap-2 border-b border-base-200 py-1 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-base-content" title={l.label}>
                  {l.label}
                </div>
                <div className="truncate text-[11px] text-base-content/50" title={l.colour}>
                  {l.colour}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="whitespace-nowrap text-base-content">{formatAUD(l.price)}</div>
                <div className="whitespace-nowrap text-base-content/40 line-through">
                  {formatAUD(l.rrp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-baseline justify-between border-t border-base-300 pt-2">
        <span className="text-[13px] text-base-content/60">Total</span>
        <span className="text-base font-bold text-primary">{formatAUD(totalSale)}</span>
      </div>
      <div className="flex justify-between text-xs text-base-content/40">
        <span>Full retail</span>
        <span className="line-through">{formatAUD(totalRrp)}</span>
      </div>
    </div>
  );
}
