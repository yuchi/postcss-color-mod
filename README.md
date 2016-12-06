PostCSS `color-mod()` Polyfill
==============================

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

[PostCSS](https://github.com/postcss/postcss) plugin for [`color-mod()`][color-mod] current draft.

> :warning: **Attention!** :warning:
>
> The specification is a draft and very in flux.
> Also I honestly made this project to see if custom properties cascade can be polyfilled.

The `color-mod()` function let colors to be modified by applying _adjusters_ in a fashion very similar to how _transforms_ are applied. If you are curious I suggest to have a look at the [current draft][color-mod].

If you are thinking «we can do that already in SCSS/Less/Stylus!» Well, yes and no. If you apply `color-mod` to constant colors then you get nothing more than a standard preprocessor can give you. **But** if you know what CSS Custom Properties (a.k.a. CSS Variables) are then you need to know that `color-mod` works with them too, at runtime.

This plugin is an experiment to both personally test the spec and to try to polyfill the dynamic behaviour of `color-mod` in browsers that support CSS Custom Properties natively.

[color-mod]: https://drafts.csswg.org/css-color/#modifying-colors

## Example

```css
/* Input */

.btn {
  color: color-mod(red saturation(50%) lightness(+ 10%));
  /*               ─┬─ ─┬───────────── ─┬──────────────             */
  /*                │   │               ╰─ _add_ 0.1 of lightness   */
  /*                │   ╰─ _set_ the saturation to 0.5              */
  /*                ╰─ start from red (_base color_)                */
}
```

```css
/* Output */

.btn {
  background: #cc6666;
}
```

## Support for CSS Custom Properties

To support custom properties (since we can’t know all the values before hand!) we need to somehow bring the computation to the browser too.

The idea is to build a JS library to include in the client along-side the stylesheet. Something similar to what [css modules](https://github.com/css-modules/postcss-modules) need to do in order for namespaced names to get mapped in JavaScript code.

The final usage will be somewhat similar to this:

```js
// you import the library
import applyProperties from 'color-mod-polyfill';
// you import your definitions
import { customPropertiesDefinitions } from './path/to/my.css';

// and later with an element…
applyProperties(document.body, customPropertiesDefinitions, {
  tint: '#f00'
});
```

This will work because this css:

```css
.btn {
  background: color-mod(var(--tint) lightness(- 10%));
}
```

will be converted to:

```css
.btn {
  background: var(--1oszj_tint_l_m_10p);
}
```

and:

```json
{
  "triggers": {
    "--tint": [ "--1oszj_tint_l_m_10p" ]
  },
  "definitions": {
    "--1oszj_tint_l_m_10p": {
      "base": "--tint",
      "adjusters": [
        {
          "type": "lightness", "value": "10%", "operator": "-"
        }
      ]
    }
  }
}
```

All of this should give us the required information to calculate dependencies at runtime.

## To do (a lot)

- [x] Minimal support for constant adjusting
- [ ] Spec compliant parsing of values
- [ ] Minimal support for all adjusters
- [ ] Perfect spec compliant support for all adjusters
- [ ] Define a road for multiple variables dependencies (`blend()`)
- [x] Identification with unique ids for runtime-dependent expressions
- [ ] Definition creation and aggregation
- [ ] Check with css-modules compatibility (do they support scoped custom properties?)
