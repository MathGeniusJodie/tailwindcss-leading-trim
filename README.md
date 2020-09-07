# tailwindcss-leading-trim

leading trim utility classes and polyfill for tailwindcss

<https://www.npmjs.com/package/tailwindcss-leading-trim>

## what is leading-trim?

<https://www.w3.org/TR/css-inline-3/#leading-trim>
<https://medium.com/microsoft-design/leading-trim-the-future-of-digital-typesetting-d082d84b202>

## config

in tailwind.config.js

```js
module.exports = {
	plugins: [require("tailwindcss-leading-trim")],
	theme: {
		fontFamily: {
			"source-sans": "Source Sans Pro",
		},
		fontMetrics: {
			"Source Sans Pro": {
				capHeight: 660,
				ascent: 984,
				descent: -273,
				unitsPerEm: 1000,
			},
		},
	},
};
```

font metrics are optional and will be automatically picked for fonts from google fonts

easy web-based tool to extract font metrics from any font: https://seek-oss.github.io/capsize/

## usage

this plugin adds 3 utility classes: `.trim-start`, `.trim-end` and `.trim-both`

**font size and leading must be explicitly set on the element or a parent element with a tailwind class**

## how the polyfill is implemented

leading and font-family classes have a custom property added

```css

.leading-normal {
  line-height: 1.5;
  --leading-offset: -0.25em
}

.font-source-sans {
  font-family: Source Sans Pro;
  --font-offset-start: -0.1955em;
  --font-offset-end: -0.1445em
}

```

and the trim classes apply a negative margin to the element based on the font family and leading

```css

.trim-both {
  margin-top: calc( var(--leading-offset) + var(--font-offset-start,0) );
  margin-bottom: calc( var(--leading-offset) + var(--font-offset-end,0) )
}

```

## future features?

- more verbose option that uses pseudo-elements so as not to mess with the margin of elements
- optional default values for when a leading and font family aren't explicitly set using utility classes
- more docs and tooling
- options for `text-edge` (edge-ex, edge-cap, others?)

issues and pull requests are welcome and encouraged!