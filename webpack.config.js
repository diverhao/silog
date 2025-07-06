const webpack = require("webpack");
const path = require("path");

module.exports = {
	entry: "./src/client/App.tsx",
	output: {
		path: path.resolve(__dirname, "./dist/webpack"),
		filename: "bundle.js",
		publicPath: "/",
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
	},
	plugins: [new webpack.HotModuleReplacementPlugin()],

	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	// devServer: {
	// 	static: path.join(__dirname, "public"),
	// 	port: 3000,
	// 	historyApiFallback: true,
	// },
	// mode: "development",
	devServer: {
		// open: true,
		// hot update bundle file
		// hot: true,
		devMiddleware: {
			writeToDisk: true,
		},
		hot: false, // Disable Hot Module Replacement
		liveReload: false, // Disable Live Reloading
		webSocketServer: false,
	},
};
