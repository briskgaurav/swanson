// Geometry for the bottom-right "scroll" tab, shared between the canvas clip
// (which cuts the tab out of the sharp video so the blurred background shows
// through) and the ScrollIndicator overlay (text + arrow). All values in vw.
export const TAB = {
  width: 5, // panel width
  height: 24, // panel height
  convex: .5, // interior (top-left) rounded corner
  concave: .5, // inverted corners that flare into the video edges
  inset: 1.2, // distance from the corner, matches the canvas padding
}

// Small notch cut out of the TOP-RIGHT corner, mirroring the scroll tab so the
// blurred background flares through the corner the same way. All values in vw.
export const CORNER = {
  width: 52.5, // notch width
  height: 5.4, // notch height
  convex: .5, // interior (bottom-left) rounded corner
  concave: .5, // inverted corners that flare into the video edges
}

// Builds a clip-path that keeps the whole canvas EXCEPT the tab, using an
// even-odd hole. `cw`/`ch` are the canvas CSS size in px.
export function buildTabClipPath(cw, ch) {
  const vw = window.innerWidth / 100
  const W = TAB.width * vw
  const H = TAB.height * vw
  const r = TAB.convex * vw
  const c = TAB.concave * vw

  const x0 = cw - W // tab left edge
  const y0 = ch - H // tab top edge

  const n = (v) => v.toFixed(2)

  const outer = `M0 0 H${n(cw)} V${n(ch)} H0 Z`

  const hole = [
    `M${n(x0 + r)} ${n(y0)}`, // after the convex corner, along the top edge
    `H${n(cw - c)}`, // top edge toward the right
    `A${n(c)} ${n(c)} 0 0 0 ${n(cw)} ${n(y0 - c)}`, // concave flare up into right edge
    `V${n(ch)}`, // down the right edge
    `H${n(x0 - c)}`, // bottom edge toward the left
    `A${n(c)} ${n(c)} 0 0 0 ${n(x0)} ${n(ch - c)}`, // concave flare left into bottom edge
    `V${n(y0 + r)}`, // up the left edge
    `A${n(r)} ${n(r)} 0 0 1 ${n(x0 + r)} ${n(y0)}`, // convex interior corner
    "Z",
  ].join(" ")

  // Top-right corner notch — vertical mirror of the tab geometry above.
  const CW = CORNER.width * vw
  const CH = CORNER.height * vw
  const cr = CORNER.convex * vw
  const cc = CORNER.concave * vw
  const cx0 = cw - CW // notch left edge

  const cornerHole = [
    `M${n(cx0 + cr)} ${n(CH)}`, // convex interior corner, along the notch's bottom edge
    `H${n(cw - cc)}`, // bottom edge toward the right
    `A${n(cc)} ${n(cc)} 0 0 1 ${n(cw)} ${n(CH + cc)}`, // concave flare down into right edge
    `V0`, // up the right edge to the top-right corner
    `H${n(cx0 - cc)}`, // top edge toward the left
    `A${n(cc)} ${n(cc)} 0 0 1 ${n(cx0)} ${n(cc)}`, // concave flare down into top edge
    `V${n(CH - cr)}`, // down the left edge
    `A${n(cr)} ${n(cr)} 0 0 0 ${n(cx0 + cr)} ${n(CH)}`, // convex interior corner
    "Z",
  ].join(" ")

  return `path(evenodd, "${outer} ${hole} ${cornerHole}")`
}
