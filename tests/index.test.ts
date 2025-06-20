import assert from "node:assert";
import { describe, it } from "node:test";
import { FormatterReturn } from "~/format";
import { SetLuminanceOptions } from "~/luminance";
import {
  ColorEntry,
  ColorOutput,
  generateContrastedColors,
  setLuminance,
} from "../dist";

describe(`${generateContrastedColors.name} function`, () => {
  const tests = <const>[
    [
      {
        mainColor: "rgb(195, 165, 111)",
        output: "rgb",
        secondaryColor: "aliceblue",
        priority: "secondary",
      },
      ["rgb(107, 80, 25)", "rgb(240, 248, 255)"],
    ],
    [
      {
        mainColor: "rgb(195, 165, 111)",
        output: "rgb",
        secondaryColor: "aliceblue",
        priority: "main",
      },
      ["rgb(195, 165, 111)", "rgb(26, 31, 36)"],
    ],
    [
      {
        mainColor: "rgb(195, 165, 111)",
        output: "oklch",
        format: "object",
        secondaryColor: "aliceblue",
        priority: "both",
      },
      [
        {
          mode: "oklch",
          l: 0.46600800295261063,
          c: 0.0794454372438439,
          h: 81.64234808269421,
        },
        { mode: "oklch", l: 0.999999993473546, c: 0 },
      ],
    ],
  ];

  for (const [params, result] of tests) {
    it(`should return ${JSON.stringify(result)} for options = ${JSON.stringify(
      params,
      null,
      1
    )}`, () => {
      assert.deepStrictEqual(generateContrastedColors(params), result);
    });
  }
});

describe(`${setLuminance.name} function`, () => {
  const tests: [
    [ColorEntry, number, SetLuminanceOptions<ColorOutput, "css" | "object">?],
    FormatterReturn<ColorOutput, "css" | "object">
  ][] = <const>[
    [["royalblue", 0.5], "rgb(158, 187, 255)"],
    [
      ["royalblue", 0.3, { output: "oklch" }],
      "oklch(0.6759038392358254 0.1703109011963002 266.39959456769907)",
    ],
  ];

  for (const [params, result] of tests) {
    it(`should return ${JSON.stringify(result)} for args = ${JSON.stringify(
      params,
      null,
      1
    )}`, () => {
      assert.deepStrictEqual(setLuminance(...params), result);
    });
  }
});
