/**
 * Full rendered extent of `el`, including absolutely-positioned children
 * (e.g. shades hanging below a rod frame, or a sideways shade extending left)
 * that overflow the element's own box.
 */
export function measureExtent(el: HTMLElement) {
  const own = el.getBoundingClientRect();
  let left = own.left;
  let top = own.top;
  let right = own.right;
  let bottom = own.bottom;
  el.querySelectorAll("*").forEach((child) => {
    const r = (child as HTMLElement).getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  });
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}
