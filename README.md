# contrast-ts

> Contrasted colors generator, can also set luminance of a specified color.

## Install

```shell
npm install contrast-ts
```

## Usage

### generateContrastedColors({ _options_ })

> _generateContrastedColors_ lets you generate an array of 2 colors with a minimum set **WCAG contrast**.
> <br>Main color needs to be specified. A secondary one can be specified as well but, while being the better choice, isn't necessary.

```js
import { generateContrastedColors } from "contrast-ts";

const contrastedColors = generateContrastedColors({
  mainColor: "royalblue",
  secondaryColor: "rgb(128 69 42)",
  minWcagContrast: 10,
  priority: "main",
  output: "rgb",
  format: "css",
});
// returns [ 'rgb(24, 51, 168)', 'rgb(255, 255, 255)' ]
```

#### _mainColor_ and _secondaryColor (optional)_ parameters :

They both accept as values:

- a **Color object** (https://culorijs.org/color-spaces/)
- a **named color** (https://drafts.csswg.org/css-color/#named-colors)
- a **CSS color** (https://drafts.csswg.org/css-color/#typedef-color)

#### _minWcagContrast (optional)_ parameter:

Represent the **minimum contrast goal** for the generated colors, accepts a number as a value, clamped between **0 and 21**. Default to **7**.

#### _priority (optional)_ parameter:

Accepts **"main"**, **"secondary"** and **"both"** as values. Can only be set if a **secondaryColor** has been inputed.

- **"main"**: will try to preserve **mainColor** by setting _secondaryColor_'s relative luminance first. If it's not enough, **mainColor**'s relative luminance is set to match the minimum contrast ratio.
- **"secondary"**: same as _"main"_ but for **secondaryColor**.
- **"both"**: decrease darkest color's relative luminance and raise the other one to meet the minimum contrast ratio.

#### _output (optional)_ parameter:

Accepts these values:
**"rgb" | "a98" | "hsl" | "hwb" | "lab" | "lch" | "lrgb" | "oklab" | "oklch" | "p3" | "prophoto" | "rec2020" | "xyz50" | "xyz65" | "hex"**

#### _format (optional)_ parameter:

Accepts **"css"** and **"object"** as values.

- **"css"**: returns a **CSS ready string** to be used as a **\<color\>**
- **"object"**: returns a **Color object** (https://culorijs.org/color-spaces/)

### setLuminance(_color_, _luminanceGoal_, { _options_ })

> _setLuminance_ lets you change the **WCAG relative luminance** of a color to a specified amount.

```js
import { setLuminance } from "contrast-ts";

const blueAt0dot5Luminance = setLuminance("rgb(0 0 255)", 0.5, {
  output: "rgb",
  format: "css",
});
// returns "rgb(154, 188, 255)"
```

#### _color_ parameter :

Accepts as values:

- a **Color object** (https://culorijs.org/color-spaces/)
- a **named color** (https://drafts.csswg.org/css-color/#named-colors)
- a **CSS color** (https://drafts.csswg.org/css-color/#typedef-color)

#### _luminanceGoal_ parameter:

Accepts a number representing the **WCAG relative luminance** goal for the new color, clamped between **0 and 1**.

#### _options (optional)_ parameter:

> #### _output (optional)_ parameter:
>
> Accepts these values:
> **"rgb" | "a98" | "hsl" | "hwb" | "lab" | "lch" | "lrgb" | "oklab" | "oklch" | "p3" | "prophoto" | "rec2020" | "xyz50" | "xyz65" | "hex"**
>
> #### _format (optional)_ parameter:
>
> Accepts **"css"** and **"object"** as values.
>
> - **"css"**: returns a **CSS ready string** to be used as a **\<color\>**
> - **"object"**: returns a **Color object** (https://culorijs.org/color-spaces/)
