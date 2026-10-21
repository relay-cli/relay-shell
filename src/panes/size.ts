/**
 * How much of a split a pane or nested split takes along the split's axis:
 * a fixed number of cells, a percentage, or a share of the remaining space.
 */
export type PaneSize = number | `${number}%` | `${number}fr`;

export type SplitDirection = 'row' | 'column';

export interface SizeStyle {
  width?: number | string;
  height?: number | string;
  flexGrow: number;
  flexShrink: number;
  flexBasis?: number | string;
  minWidth?: number;
  minHeight?: number;
}

const fraction = /^(\d+(?:\.\d+)?)fr$/;
const percent = /^(\d+(?:\.\d+)?)%$/;

/** Translate a pane size into flexbox style for a child of a split. */
export const sizeStyle = (
  size: PaneSize | undefined,
  direction: SplitDirection,
  minimum?: number,
): SizeStyle => {
  const axis = direction === 'row' ? 'width' : 'height';
  const minAxis = direction === 'row' ? 'minWidth' : 'minHeight';
  const min = minimum === undefined ? {} : {[minAxis]: minimum};
  if (typeof size === 'number') {
    if (!Number.isFinite(size) || size < 0) throw new Error(`Invalid pane size: ${size}`);
    return {[axis]: Math.floor(size), flexGrow: 0, flexShrink: 0, ...min};
  }
  const value = size ?? '1fr';
  const share = fraction.exec(value);
  if (share?.[1] !== undefined) {
    return {flexGrow: Number(share[1]), flexShrink: 1, flexBasis: 0, ...min};
  }
  if (percent.test(value)) return {[axis]: value, flexGrow: 0, flexShrink: 1, ...min};
  throw new Error(`Invalid pane size: ${value}`);
};
