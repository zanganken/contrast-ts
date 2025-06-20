"use strict";

import { modeLrgb, round, useMode } from "culori/fn";
import { inLuminance } from "~/luminance";

export const toLRgb = useMode(modeLrgb);

type LinearCoeff = 0.2126 | 0.7152 | 0.0722;
type LinearValue<T extends LinearCoeff> = {
  value: number;
  coeff: T;
};

/**
 * Calculate the linearGoal for linearValue, using otherLinearValues as a reference to reach luminanceGoal
 * @param linearValue linear value to check
 * @param otherLinearValues other linear values, used to determine the goal value of linearValue
 * @param luminanceGoal luminance goal we're aiming for
 * @returns linearGoal of linearValue based on otherLinearValues to reach luminanceGoal
 */
export function getLinearGoal<T extends LinearCoeff>(
  linearValue: LinearValue<T>,
  otherLinearValues: LinearValue<Exclude<LinearCoeff, T>>[],
  luminanceGoal: number
) {
  const { value } = linearValue;
  const [l1, l2] = otherLinearValues;

  return round(8)(
    value > 1
      ? 1
      : value < 0
      ? 0
      : value *
        ((luminanceGoal -
          (l1.value > 1 ? l1.coeff : 0) -
          (l2.value > 1 ? l2.coeff : 0)) /
          (luminanceGoal -
            (!inLuminance(l1.value) ? l1.coeff * l1.value : 0) -
            (!inLuminance(l2.value) ? l2.coeff * l2.value : 0)))
  );
}
