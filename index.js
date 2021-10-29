const plugin = require("tailwindcss/plugin");
const { map, fromPairs, find, isPlainObject, get } = require("lodash");

const parser = require("postcss-selector-parser");

const escapeClassName = (className) => {
	const node = parser.className();
	node.value = className;
	return get(node, "raws.value", node.value);
};

const stripUnit = (string) => string.match(/[\d.]+/)[0];

const asClass = (name) => `.${escapeClassName(name)}`;

const nameClass = (classPrefix, key) => {
	if (key === "DEFAULT") {
		return asClass(classPrefix);
	}

	if (key === "-") {
		return asClass(`-${classPrefix}`);
	}

	if (key.startsWith("-")) {
		return asClass(`-${classPrefix}${key}`);
	}

	return asClass(`${classPrefix}-${key}`);
};

const offsetFromLineHeight = (value) => {
	const valueStripped = stripUnit(value);

	return valueStripped === value
		? (Number(value) - 1) / -2 + "em"
		: `calc( (${value} - 1em) / -2)`;
};

const fontMetricsList = require("./metrics.json");

module.exports = plugin(
	({ addUtilities, e, theme, variants }) => {
		addUtilities({
			".trim-start": {
				"margin-top":
					"calc( var(--leading-offset,-.25em) + var(--font-offset-start,0em) )",
			},
			".trim-end": {
				"margin-bottom":
					"calc( var(--leading-offset,-.25em) + var(--font-offset-end,0em) )",
			},
			".trim-both": {
				"margin-top":
					"calc( var(--leading-offset,-.25em) + var(--font-offset-start,0em) )",
				"margin-bottom":
					"calc( var(--leading-offset,-.25em) + var(--font-offset-end,0em) )",
			},
		});

		const fontFamilyUtilities = fromPairs(
			map(theme("fontFamily"), (value, modifier) => {
				const preferedFont = Array.isArray(value) ? value[0] : value;
				const fontFamily = Array.isArray(value) ? value.join(", ") : value;

				const fontMetrics =
					theme("fontMetrics." + preferedFont) ||
					find(fontMetricsList, {
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

				const ajust = unitsPerEm / capHeight + "";

				return [
					`.${e(`font-${modifier}`)}`,
					{
						"font-family": fontFamily,
						"--font-offset-start": offsetStart,
						"--font-offset-end": offsetEnd,
						"--font-adjust": ajust,
					},
				];
			})
		);

		addUtilities(fontFamilyUtilities, variants("fontFamily"));

		const numericFontSizeUtilities = fromPairs(
			map(theme("spacing"), (value, modifier) => {
				return [
					nameClass("text", modifier),
					{
						"font-size": `calc(${value} * var(--font-adjust,1))`,
					},
				];
			})
		);

		addUtilities(numericFontSizeUtilities, variants("fontSize"));

		const fontSizeUtilities = fromPairs(
			map(theme("fontSize"), (value, modifier) => {
				const [fontSize, options] = Array.isArray(value) ? value : [value];
				const { lineHeight, letterSpacing } = isPlainObject(options)
					? options
					: {
							lineHeight: options,
					  };

				return [
					nameClass("text", modifier),
					{
						"font-size": fontSize,
						...(lineHeight === undefined
							? {}
							: {
									"line-height": lineHeight,
									"--leading-offset": offsetFromLineHeight(lineHeight),
							  }),
						...(letterSpacing === undefined
							? {}
							: {
									"letter-spacing": letterSpacing,
							  }),
					},
				];
			})
		);

		addUtilities(fontSizeUtilities, variants("fontSize"));

		const lineHeightUtilities = fromPairs(
			map(theme("lineHeight"), (value, modifier) => {
				return [
					`.${e(`leading-${modifier}`)}`,
					{
						"line-height": value,
						"--leading-offset": offsetFromLineHeight(value),
					},
				];
			})
		);

		addUtilities(lineHeightUtilities, variants("lineHeight"));
	},
	{
		corePlugins: {
			fontFamily: false,
			fontSize: false,
			lineHeight: false,
		},
	}
);
