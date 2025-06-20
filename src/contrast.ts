"use strict";

import "culori/css";
import {
  Color,
  Mode,
  colorsNamed,
  parse,
  wcagContrast,
  wcagLuminance,
} from "culori/fn";

import { FormatterReturn, formatter } from "~/format";
import {
  calcBothLuminances,
  calcLuminanceGoals,
  isDark,
  setLuminance,
} from "~/luminance";
import { clampNumber } from "~/utils";

type CustomMode =
  | "dlab"
  | "cubehelix"
  | "dlch"
  | "hsi"
  | "hsv"
  | "itp"
  | "jab"
  | "itp"
  | "jch"
  | "lab65"
  | "lch65"
  | "lchuv"
  | "luv"
  | "okhsl"
  | "okhsv"
  | "xyb"
  | "yiq";
type NamedColor = keyof typeof colorsNamed;
export type ColorEntry = Color | NamedColor | (string & {});
export type ColorPriority = "main" | "secondary" | "both";
export type ColorOutput = Exclude<Mode, CustomMode> | "hex";
export type ColorFormat = "object" | "css";

type GCCArgs<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : ColorFormat
> = {
  mainColor: ColorEntry;
  minWcagContrast?: number;
  output?: O;
  format?: F;
};

type GCCArgswithSecondaryColor<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : ColorFormat
> = GCCArgs<O, F> & {
  secondaryColor: ColorEntry;
  priority?: ColorPriority;
};

type GCCArgswithoutSecondaryColor<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : ColorFormat
> = GCCArgs<O, F> & {
  secondaryColor?: never;
  priority?: never;
};

/**
 * Generate contrasted colors based on the options parameter,
 * documentation is available at https://github.com/zanganken/generate-contrast
 */
function generateContrastedColors<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : ColorFormat
>(
  options: GCCArgswithSecondaryColor<O, F>
): [FormatterReturn<O, F>, FormatterReturn<O, F>];

function generateContrastedColors<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : ColorFormat
>(
  options: GCCArgswithoutSecondaryColor<O, F>
): [FormatterReturn<O, F>, FormatterReturn<O, F>];

function generateContrastedColors<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : ColorFormat
>({
  mainColor,
  secondaryColor,
  minWcagContrast = 7,
  priority,
  output = <O>"rgb",
  format = <F>"css",
}: GCCArgswithoutSecondaryColor<O, F> | GCCArgswithSecondaryColor<O, F>) {
  secondaryColor ??= { mode: "rgb", r: 0.73333, g: 0.73333, b: 0.73333 };

  if (typeof mainColor === "string") mainColor = parse(mainColor)!;
  if (typeof secondaryColor === "string")
    secondaryColor = parse(secondaryColor)!;

  if (!mainColor) throw Error("invalid mainColor argument");
  if (!secondaryColor) throw Error("invalid secondaryColor argument");

  const toFormat = formatter(output, format);
  const toObject = formatter(output === "hex" ? "rgb" : output, "object");

  mainColor = toObject(mainColor);
  secondaryColor = toObject(secondaryColor);
  minWcagContrast = clampNumber(minWcagContrast, 1, 21);

  if (wcagContrast(mainColor, secondaryColor) < minWcagContrast) {
    switch (priority) {
      case "main":
      default:
        {
          const [minLuminanceGoal, maxLuminanceGoal] = calcLuminanceGoals(
            toFormat(mainColor),
            minWcagContrast
          );

          secondaryColor = setLuminance(
            secondaryColor,
            isDark(mainColor) ? maxLuminanceGoal : minLuminanceGoal,
            {
              output: output === "hex" ? "rgb" : output,
              format: "object",
              aim: isDark(secondaryColor) ? "above" : "below",
            }
          );

          if (wcagContrast(mainColor, secondaryColor) < minWcagContrast) {
            const [minLuminanceGoal, maxLuminanceGoal] = calcLuminanceGoals(
              toFormat(secondaryColor),
              minWcagContrast
            );

            mainColor = setLuminance(
              mainColor,
              isDark(mainColor) ? minLuminanceGoal : maxLuminanceGoal,
              {
                output: output === "hex" ? "rgb" : output,
                format: "object",
              }
            );
          }
        }

        break;
      case "secondary":
        {
          const [minLuminanceGoal, maxLuminanceGoal] = calcLuminanceGoals(
            toFormat(secondaryColor),
            minWcagContrast
          );

          mainColor = setLuminance(
            mainColor,
            isDark(secondaryColor) ? maxLuminanceGoal : minLuminanceGoal,
            {
              output: output === "hex" ? "rgb" : output,
              format: "object",
              aim: isDark(secondaryColor) ? "above" : "below",
            }
          );

          if (wcagContrast(mainColor, secondaryColor) < minWcagContrast) {
            const [minLuminanceGoal, maxLuminanceGoal] = calcLuminanceGoals(
              toFormat(mainColor),
              minWcagContrast
            );

            secondaryColor = setLuminance(
              secondaryColor,
              isDark(secondaryColor) ? minLuminanceGoal : maxLuminanceGoal,
              { output: output === "hex" ? "rgb" : output, format: "object" }
            );
          }
        }

        break;
      case "both":
        {
          const mainLuminance = wcagLuminance(mainColor);
          const secondaryLuminance = wcagLuminance(secondaryColor);

          const [minLuminance, maxLuminance] = calcBothLuminances(
            toFormat(mainColor),
            toFormat(secondaryColor),
            minWcagContrast
          );

          mainColor = setLuminance(
            toFormat(mainColor),
            mainLuminance >= secondaryLuminance ? maxLuminance : minLuminance,
            { output: output === "hex" ? "rgb" : output, format: "object" }
          );

          secondaryColor = setLuminance(
            toFormat(secondaryColor),
            mainLuminance < secondaryLuminance ? maxLuminance : minLuminance,
            { output: output === "hex" ? "rgb" : output, format: "object" }
          );
        }

        break;
    }
  }

  return [toFormat(mainColor), toFormat(secondaryColor)];
}

export default generateContrastedColors;
