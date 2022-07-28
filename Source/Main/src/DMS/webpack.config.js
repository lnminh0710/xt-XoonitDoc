const path = require("path");

module.exports = {
	// Fix for: https://github.com/recharts/recharts/issues/1463
	node: {
		fs: "empty",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: [
					path.resolve(__dirname, 'src', 'public/assets/lib'),
					path.resolve(__dirname, 'node_modules')
				]
			}
		]
	}
};
