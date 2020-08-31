const { writeFile } = require("fs").promises;
const config = require("postcss")([require("tailwindcss")]);
(async () => {
	writeFile(
		"./test.css",
		(await config.process("@tailwind utilities;", { from: undefined })).css
	);
})();
