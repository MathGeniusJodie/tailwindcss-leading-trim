const plugin = require("tailwindcss/plugin");
const { map, fromPairs, find } = require("lodash");

const stripUnit = (string) => string.match(/[\d.]+/)[0];

const fontMetricsList = require("./metrics.json");

module.exports = plugin(({ addUtilities, e, theme, variants }) => {
	addUtilities({
		".trim-start": {
			"margin-top": "calc( var(--leading-offset) + var(--font-offset-start) )",
		},
		".trim-end": {
			"margin-bottom": "calc( var(--leading-offset) + var(--font-offset-end) )",
		},
		".trim-both": {
			"margin-top": "calc( var(--leading-offset) + var(--font-offset-start) )",
			"margin-bottom": "calc( var(--leading-offset) + var(--font-offset-end) )",
		},
	});

	const fontFamilyUtilities = fromPairs(
		map(theme("fontFamily"), (value, modifier) => {
			const preferedFont = Array.isArray(value) ? value[0] : value;
			const fontFamily = Array.isArray(value) ? value.join(", ") : value;

			const fontMetrics = find(fontMetricsList, {
				familyName: preferedFont,
			});
			if (!fontMetrics) {
				console.log("can't find font metrics for font: " + preferedFont);
				return [
					`.${e(`font-${modifier}`)}`,
					{
						"font-family": fontFamily,
					},
				];
			}

			const { ascent, descent, unitsPerEm, capHeight } = fontMetrics;

			const foo = (ascent - descent - unitsPerEm) / 2;

			const offsetStart = (ascent - capHeight - foo) / -unitsPerEm + "em";
			const offsetEnd = (foo + descent) / unitsPerEm + "em";

			return [
				`.${e(`font-${modifier}`)}`,
				{
					"font-family": fontFamily,
					"--font-offset-start": offsetStart,
					"--font-offset-end": offsetEnd,
				},
			];
		})
	);

	addUtilities(fontFamilyUtilities, variants("fontFamily"));

	const lineHeightUtilities = fromPairs(
		map(theme("lineHeight"), (value, modifier) => {
			const valueStripped = stripUnit(value);

			const offset =
				valueStripped === value
					? (Number(value) - 1) / -2 + "em"
					: `calc( (${value} - 1em) / -2)`;
			return [
				`.${e(`leading-${modifier}`)}`,
				{
					"line-height": value,
					"--leading-offset": offset,
				},
			];
		})
	);

	addUtilities(lineHeightUtilities, variants("lineHeight"));
}, {});
