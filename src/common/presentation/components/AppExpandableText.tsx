import { useState } from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";

export type AppExpandableTextProps = {
  text: string;
  /** Lines shown while collapsed. */
  numberOfLines: number;
  /** Label rendered inline when the text is truncated (caller localizes, e.g. "...See more >"). */
  moreText: string;
  /** Called when the more-label is pressed (e.g. open a full-text dialog). */
  onMorePress: () => void;
  /** When true, always render `moreText` at the end — even if the body is not truncated. */
  alwaysShowMore?: boolean;
  style?: StyleProp<TextStyle>;
  moreTextStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

// Proportional fonts: char count ≠ pixel width. Extra headroom so the
// inline more-label is never pushed into the parent's ellipsis.
const MORE_TEXT_CHAR_BUFFER = 10;

export const AppExpandableText = ({
  text,
  numberOfLines,
  moreText,
  onMorePress,
  alwaysShowMore = false,
  style,
  moreTextStyle,
  containerStyle,
}: AppExpandableTextProps) => {
  const { colors, typography } = useAppTheme();
  const [fullLines, setFullLines] = useState<string[]>();

  if (!text) return null;

  const hasMeasured = fullLines != null;
  const lineCount = fullLines?.length ?? 0;
  const isTruncated = hasMeasured && lineCount > numberOfLines;
  // Wait for measurement so we never paint the more-label under numberOfLines
  // (that ellipsis is what turns "See more >" into "See..").
  const showMore = hasMeasured && (alwaysShowMore || isTruncated);
  // Reserve on the last visible line whenever the body already fills every
  // allowed line — including exact fill with alwaysShowMore.
  const shouldReserveForMore = showMore && lineCount >= numberOfLines;
  const visibleText = shouldReserveForMore
    ? fullLines!
        .slice(0, numberOfLines)
        .join("")
        .trimEnd()
        .slice(0, -(moreText.length + MORE_TEXT_CHAR_BUFFER))
        .trimEnd()
    : text;

  return (
    <View style={containerStyle}>
      <Text
        style={style}
        // Manual truncation owns the layout when the more-label is inlined;
        // keeping numberOfLines would ellipsize the label itself.
        numberOfLines={showMore ? undefined : numberOfLines}
      >
        {visibleText}
        {showMore && (
          <Text
            style={[
              { ...typography.regular[14], color: colors.primary.dark },
              moreTextStyle,
            ]}
            onPress={onMorePress}
            suppressHighlighting
          >
            {/* Labels that already open with "..." attach flush to the body
                (`[body]...See more >`); others keep a separating space. */}
            {moreText.startsWith("...") ? moreText : ` ${moreText}`}
          </Text>
        )}
      </Text>
      <View
        pointerEvents="none"
        style={{ position: "absolute", start: 0, end: 0 }}
      >
        <Text
          style={[style, { opacity: 0, minHeight: 0 }]}
          onTextLayout={(e) =>
            setFullLines(e.nativeEvent.lines.map((line) => line.text))
          }
        >
          {text}
        </Text>
      </View>
    </View>
  );
};

export default AppExpandableText;
