import { colorFor } from "@/lib/color";

const SIZE_CLASS = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-lg",
} as const;

export function TeamAvatar({
  name,
  shortName,
  size = "md",
}: {
  name: string;
  shortName: string;
  size?: keyof typeof SIZE_CLASS;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZE_CLASS[size]}`}
      style={{ backgroundColor: colorFor(name) }}
      aria-hidden
    >
      {shortName.slice(0, 3)}
    </span>
  );
}
