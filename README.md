# Design Token Attributes

A monorepo of tools to manage attributes and metadata for design tokens.

## The problem Design Token Attributes aims to solve

At Adobe, our [design token](https://www.designtokens.org/glossary/#design-token) management system ([Spectrum Tokens](https://github.com/adobe/spectrum-tokens)) can contain meta data like flagging `deprecated` data, but that meta data is not translated to the different implementations like CSS custom properties.

As a real example, in the token system, design data could look like this (this is a simplified example of renamed token):

```json
{
  "background-color-hover": {
    "value": "rgb(213, 213, 213)"
  },
  "hover-background-color": {
    "value": "{background-color-hover}",
    "deprecated": true,
    "deprecated_comment": "this value is no longer supported, use `background-color-hover`"
  }
}
```

When this gets converted to CSS custom properties we would lose that metadata:

```css
:root {
  --background-color-hover: rgb(213, 213, 213);
  --hover-background-color: var(--background-color-hover);
}
```

Because the deprecated metadata is lost, any product/project relying on these custom properties wouldn't easily know they should update from the old property name to the new one.

## Proposed solution: Design Token Attributes

To help keep the context of this data, we are considering adding context comments similar to [SassDoc](http://sassdoc.com/annotations/#deprecated).

The same data above could be better represented as this:

```css
:root {
  --background-color-hover: rgb(213, 213, 213);
  /* @deprecated */
  --hover-background-color: var(--background-color-hover);
}
```

This could then be parsed using a PostCSS plugin [postcss-attributes](packages/postcss-attributes/) which gathers the definitions with attribute comments in a format that could be used by other PostCSS plugins or a Stylelint plugin [stylelint-attributes](packages/stylelint-attributes/).

## Plans

This is an early proof of concept. If it turns out to be useful, I will work on turning it into a more complete solution with full documentation on supported attributes that can be added to CSS custom property definitions and maybe CSS classes?
