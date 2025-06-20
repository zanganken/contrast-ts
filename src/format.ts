import "culori/css";
import {
  clampChroma,
  converter,
  formatCss,
  formatHex,
  formatRgb,
} from "culori/fn";
import { FindColorByMode } from "culori/src/common";
import { ColorEntry } from "dist";
import { ColorOutput } from "~/contrast";
import { detectColorGamut } from "~/gamut";

export type Formatter<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : "object" | "css"
> = (color: ColorEntry) => FormatterReturn<O, F>;

export type FormatterReturn<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : "object" | "css"
> = "css" extends F
  ? string
  : FindColorByMode<"rgb" extends O ? "rgb" : O extends "hex" ? "rgb" : O>;

export function formatter<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : "object" | "css"
>(output: O, format: F): Formatter<O, F> {
  const toFormat = output !== "hex" ? converter(output) : converter("rgb");

  switch (format) {
    case "object":
      return <Formatter<O, F>>((color: ColorEntry) => {
        if (typeof color === "string") color = toFormat(color)!;
        return toFormat(clampChroma(color, color.mode, detectColorGamut()));
      });

    case "css":
      switch (output) {
        case "rgb":
          return <Formatter<O, F>>((color: ColorEntry) => {
            if (typeof color === "string") color = toFormat(color)!;
            return formatRgb(
              toFormat(clampChroma(color, color.mode, detectColorGamut()))
            );
          });
        case "hex":
          return <Formatter<O, F>>((color: ColorEntry) => {
            if (typeof color === "string") color = toFormat(color)!;
            return formatHex(
              toFormat(clampChroma(color, color.mode, detectColorGamut()))
            );
          });
        default:
          return <Formatter<O, F>>((color: ColorEntry) => {
            if (typeof color === "string") color = toFormat(color)!;
            return formatCss(
              toFormat(clampChroma(color, color.mode, detectColorGamut()))
            );
          });
      }
  }
}
