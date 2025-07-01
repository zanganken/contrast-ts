"use strict";

import "culori/css";
import { Color, modeRgb, parse, useMode, wcagLuminance } from "culori/fn";
import { ColorEntry, ColorOutput } from "~/contrast";
import { FormatterReturn, formatter } from "~/format";

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
  const toOklch = formatter("oklch", "object");

  if (luminanceGoal >= 1)
    return <FormatterReturn<O, F>>toFormat({ mode: "rgb", r: 1, g: 1, b: 1 });
  if (luminanceGoal <= 0)
    return <FormatterReturn<O, F>>toFormat({ mode: "rgb", r: 0, g: 0, b: 0 });

  let res = toOklch(color);
  let resLuminance = wcagLuminance(toFormat(res));

  let factor = resLuminance < luminanceGoal ? 1 : -1;
  let minStep = resLuminance < luminanceGoal ? res.l : 0;
  let maxStep = resLuminance < luminanceGoal ? 1 : res.l;

  aim ??= resLuminance < luminanceGoal ? "above" : "below";

  do {
    res.l += (factor * (maxStep - minStep)) / 2;
    resLuminance = wcagLuminance(toFormat(res));

    if (resLuminance < luminanceGoal) {
      minStep = res.l;
      factor = 1;
    }
    if (resLuminance > luminanceGoal) {
      maxStep = res.l;
      factor = -1;
    }
  } while (maxStep - minStep > 0.0002);

  res.l = aim === "above" ? maxStep : minStep;

  return <FormatterReturn<O, F>>toFormat(res);
}

export function inLuminance(luminance: number) {
  return luminance >= 0 && luminance <= 1;
}

export function calcLuminanceGoals(
  reference: Color | string | number,
  minContrast: number
) {
  if (typeof reference === "string") reference = parse(reference)!;
  if (reference === undefined) throw Error("invalid reference argument");

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
  if (colorA === undefined) throw Error("invalid colorA argument");

  if (typeof colorB === "string") colorB = parse(colorB)!;
  if (colorB === undefined) throw Error("invalid colorB argument");

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

export function isDark(color: ColorEntry) {
  const { r, g, b } = toRgb(color)!;

  const yiq = ((r * 299 + g * 587 + b * 114) * 255) / 1000;

  return yiq < 128;
}
