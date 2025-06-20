"use strict";

export function clampNumber(number: number, min: number, max: number) {
  return number > max ? max : number < min ? min : number;
}
