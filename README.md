PostCSS `color-mod()` Polyfill
==============================

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

[PostCSS](https://github.com/postcss/postcss) plugin for [`color-mod()`](https://drafts.csswg.org/css-color/#modifying-colors) current draft.

> :warning: **Attention!** :warning:
>
> The specification is a draft and very in flux.
> Also I honestly made this project to see if custom properties cascade can be polyfilled.

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
