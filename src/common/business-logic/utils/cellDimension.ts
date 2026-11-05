export type Size = {
  width: number;
  height: number;
};

export type CellLayoutDimension = {
  size: Size;
  cols: number;
  spacing: number;
};

type GetHeightFn = (calculatedWidth: number) => number;

export class CellDimension {
  private baseWidth: number;
  private spacing: number;
  private getHeight: GetHeightFn;

  private constructor(
    baseWidth: number,
    spacing: number,
    getHeight: GetHeightFn,
  ) {
    this.baseWidth = baseWidth;
    this.spacing = spacing;
    this.getHeight = getHeight;
  }

  dimensions(width: number, minColumns: number = 1): CellLayoutDimension {
    const colNumber = Math.max(
      Math.floor((width + this.spacing) / (this.baseWidth + this.spacing)),
      minColumns,
    );

    const sumSpacing = this.spacing * (colNumber - 1);
    const calculatedWidth = (width - sumSpacing) / colNumber;
    const calculatedHeight = this.getHeight(calculatedWidth);

    return {
      size: {
        width: calculatedWidth,
        height: calculatedHeight,
      },
      cols: colNumber,
      spacing: this.spacing,
    };
  }

  phoneDimensions(width: number): CellLayoutDimension {
    const colNumber = Math.max(Math.floor(width / this.baseWidth), 1);

    const sumWidth = this.baseWidth * colNumber;
    const calculatedSpacing = Math.min(width - sumWidth, this.spacing);
    const sumSpacing = calculatedSpacing * (colNumber - 1);
    const calculatedWidth = (width - sumSpacing) / colNumber;
    const calculatedHeight = this.getHeight(calculatedWidth);

    return {
      size: {
        width: calculatedWidth,
        height: calculatedHeight,
      },
      cols: colNumber,
      spacing: calculatedSpacing <= 0 ? this.spacing : calculatedSpacing,
    };
  }

  static dynamicHeight(
    widthRatio: number,
    baseWidth: number,
    spacing: number,
    extraHeight: number = 0,
  ): CellDimension {
    return new CellDimension(baseWidth, spacing, (calculatedWidth) =>
      Math.floor(calculatedWidth / widthRatio + extraHeight),
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
