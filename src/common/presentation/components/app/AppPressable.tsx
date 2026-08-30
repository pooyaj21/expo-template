import { ComponentProps } from "react";
import { CTouchable } from "@/common/presentation/components/CTouchable";

interface AppPressableProps extends ComponentProps<typeof CTouchable> {
  /** Scale-down feedback on press. Off by default for list rows and cells. */
  enableAnimation?: boolean;
}

/** The branded touchable: throttling from CTouchable plus press feedback. */
export const AppPressable = ({
  enableAnimation,
  ...props
}: AppPressableProps) => (
  <CTouchable
    {...props}
    style={({ pressed, hovered }) => [
      {
        transform: [
          { scale: pressed && enableAnimation && props.onPress ? 0.97 : 1 },
        ],
      },
      typeof props.style === "function"
        ? props.style({ pressed, hovered })
        : props.style,
    ]}
  >
    {props.children}
  </CTouchable>
);
