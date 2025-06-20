import assert from "node:assert";
import { describe, it } from "node:test";
import { ColorEntry, ColorOutput } from "~/contrast";
import { FormatterReturn } from "~/format";
import { SetLuminanceOptions } from "~/luminance";
import { generateContrastedColors, setLuminance } from "../dist";

describe(`${generateContrastedColors.name} function`, () => {
  const tests = <const>[
    [
      {
        mainColor: "rgb(195, 165, 111)",
        output: "rgb",
        secondaryColor: "aliceblue",
        priority: "secondary",
      },
      ["rgb(127, 70, 0)", "rgb(240, 248, 255)"],
    ],
    [
      {
        mainColor: "rgb(195, 165, 111)",
        output: "rgb",
        secondaryColor: "aliceblue",
        priority: "main",
      },
      ["rgb(195, 165, 111)", "rgb(0, 29, 61)"],
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
          l: 0.4686595423141175,
          c: 0.1057714747562277,
          h: 64.2352042787947,
        },
        {
          mode: "oklch",
          l: 0.9999999859119187,
          c: 3.5594404092893915e-8,
          h: 106.37411396324427,
        },
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
    [["royalblue", 0.5], "rgb(168, 185, 255)"],
    [
      ["royalblue", 0.3, { output: "oklch" }],
      "oklch(0.6772522146443298 0.1480089674306779 271.88022367891097)",
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
