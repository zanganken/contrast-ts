"use strict";

import "culori/css";
import { Color, modeRgb, parse, useMode, wcagLuminance } from "culori/fn";
import { ColorEntry, ColorOutput } from "~/contrast";
import { FormatterReturn, formatter } from "~/format";
import { getLinearGoal, toLRgb } from "~/lrgb";

const toRgb = useMode(modeRgb);

export type SetLuminanceOptions<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : "object" | "css"
> = {
  output?: O;
  format?: F;
  aim?: "below" | "above";
};

/**
 *
 * @param color css color string | namedColor | Color object
 * @param luminanceGoal the luminance goal we're aiming for, clamped between 0 and 1
 * @param {Object} [options] options - default: { output: "rgb", format: "css" }
 * @returns a new color with set luminanceGoal (default to css rgb value)
 */
export function setLuminance<
  O extends ColorOutput,
  F extends O extends "hex" ? "css" : "object" | "css"
>(
  color: ColorEntry,
  luminanceGoal: number,
  { output, format, aim }: SetLuminanceOptions<O, F> = {}
): FormatterReturn<O, F> {
  if (typeof color === "string") color = parse(color)!;
  if (!color) throw Error("invalid argument color");

  const toFormat = formatter(output ?? "rgb", format ?? "css");

  if (luminanceGoal >= 1)
    return <FormatterReturn<O, F>>toFormat({ mode: "rgb", r: 1, g: 1, b: 1 });
  if (luminanceGoal < 0)
    return <FormatterReturn<O, F>>toFormat({ mode: "rgb", r: 0, g: 0, b: 0 });

  let res, resLuminance, step;
  const initialLuminanceGoal = luminanceGoal;

  do {
    step = luminanceGoal - wcagLuminance(color);
    const lRgb = toLRgb(color);

    const lR = lRgb.r + step;
    const lG = lRgb.g + step;
    const lB = lRgb.b + step;

    lRgb.r = getLinearGoal(
      { coeff: 0.2126, value: lR },
      [
        { coeff: 0.7152, value: lG },
        { coeff: 0.0722, value: lB },
      ],
      luminanceGoal
    );
    lRgb.g = getLinearGoal(
      { value: lG, coeff: 0.7152 },
      [
        { value: lR, coeff: 0.2126 },
        { value: lB, coeff: 0.0722 },
      ],
      luminanceGoal
    );
    lRgb.b = getLinearGoal(
      { value: lB, coeff: 0.0722 },
      [
        { value: lR, coeff: 0.2126 },
        { value: lG, coeff: 0.7152 },
      ],
      luminanceGoal
    );

    res = toFormat(lRgb);
    resLuminance = wcagLuminance(res);

    aim ??= step > 0 ? "above" : "below";

    // helps with contrast ratio
    if (aim === "above") luminanceGoal += 0.0015;
    else luminanceGoal -= 0.0015;
  } while (
    aim === "above"
      ? resLuminance < initialLuminanceGoal
      : resLuminance > initialLuminanceGoal
  );

  return <FormatterReturn<O, F>>res;
}

export function inLuminance(luminance: number) {
  return luminance >= 0 && luminance <= 1;
}

export function calcLuminanceGoals(
  reference: Color | string | number,
  minContrast: number
) {
  if (typeof reference === "string") reference = parse(reference)!;
  if (!reference) throw Error("invalid reference argument");

  const referenceLuminance =
    typeof reference === "number" ? reference : wcagLuminance(reference);

  const minLuminanceGoal = (referenceLuminance + 0.05) / minContrast - 0.05;
  const maxLuminanceGoal = minContrast * (referenceLuminance + 0.05) - 0.05;

  return <[number, number]>[minLuminanceGoal, maxLuminanceGoal];
}

export function calcBothLuminances(
  colorA: Color | string | number,
  colorB: Color | string | number,
  minContrast: number
) {
  if (typeof colorA === "string") colorA = parse(colorA)!;
  if (!colorA) throw Error("invalid colorA argument");

  if (typeof colorB === "string") colorB = parse(colorB)!;
  if (!colorB) throw Error("invalid colorB argument");

  const luminances = [
    typeof colorA === "number" ? colorA : wcagLuminance(colorA),
    typeof colorB === "number" ? colorB : wcagLuminance(colorB),
  ];

  let minLuminance = Math.min(...luminances);
  let maxLuminance = Math.max(...luminances);

  let step =
    (minContrast * minLuminance + minContrast * 0.05 - maxLuminance - 0.05) /
    (minContrast + 1);

  minLuminance -= step;
  maxLuminance += step;

  if (minLuminance < 0) maxLuminance = calcLuminanceGoals(0, minContrast)[1];
  if (maxLuminance > 1) minLuminance = calcLuminanceGoals(1, minContrast)[0];

  return <[number, number]>[minLuminance, maxLuminance];
}

export function isDark(color: Color) {
  const { r, g, b } = toRgb(color);

  const yiq = ((r * 299 + g * 587 + b * 114) * 255) / 1000;

  return yiq < 128;
}
