/**
 * Layout constants more than one screen agrees on. A value used by exactly one
 * component belongs in that component's StyleSheet — this file exists so a cell
 * and the list that measures it cannot drift apart.
 *
 * Replace numbers with the project's own scale; the shape is the point.
 */
export const DimensionProvider = {
  layout: {
    contentMaxWidth: 1240,
    tabletSideMargin: 24,
    columnMaxWidth: 640,
    columnSideMargin: 20,
    railGap: 24,
  },
  bottomSheet: {
    tablet: {
      maxWidth: 560,
    },
  },
  screen: {
    sideMargin: 20,
    sectionGap: 32,
  },
  radius: {
    small: 8,
    medium: 12,
    large: 16,
    pill: 999,
  },
  cell: {
    width: 156,
    height: 264,
    radius: 12,
    padding: 12,
    spacing: 12,
  },
  list: {
    sideMargin: 20,
    spacing: 12,
  },
  example: {
    list: {
      sideMargin: 16,
      tablet: {
        sideMargin: 24,
      },
    },
  },
};
