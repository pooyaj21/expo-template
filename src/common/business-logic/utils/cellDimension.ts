export type Size = { width: number; height: number };

export type GridDimension = {
  size: Size;
  cols: number;
  spacing: number;
};

type GetHeight = (calculatedWidth: number) => number;

/**
 * Turns an available width into a column count and an exact cell size.
 *
 * Grids built from a hard-coded `numColumns` break on tablets and on a rotated
 * phone; this asks "how many cells of about this width fit?" and divides the
 * remainder back into the cells, so the row always fills the screen edge to
 * edge with even gutters.
 */
export class CellDimension {
  private constructor(
    private readonly baseWidth: number,
    private readonly spacing: number,
    private readonly getHeight: GetHeight,
  ) {}

  dimensions(availableWidth: number): GridDimension {
    const cols = Math.max(Math.floor(availableWidth / this.baseWidth), 1);
    const usedWidth = this.baseWidth * cols;
    const resolvedSpacing = Math.min(availableWidth - usedWidth, this.spacing);
    const totalSpacing = resolvedSpacing * (cols - 1);
    const width = (availableWidth - totalSpacing) / cols;

    return {
      size: { width, height: this.getHeight(width) },
      cols,
      spacing: resolvedSpacing <= 0 ? this.spacing : resolvedSpacing,
    };
  }

  /** Height follows the width by an aspect ratio, plus room for a caption. */
  static aspectRatio(
    widthToHeightRatio: number,
    baseWidth: number,
    spacing: number,
    extraHeight = 0,
  ): CellDimension {
    return new CellDimension(baseWidth, spacing, (width) =>
      Math.floor(width / widthToHeightRatio + extraHeight),
    );
  }

  static fixedHeight(
    baseWidth: number,
    spacing: number,
    height: number,
  ): CellDimension {
    return new CellDimension(baseWidth, spacing, () => height);
  }
}
