// Combined 'require' statements
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const frontConfig = {
	  target: "web",
	  entry: {
	    app: ["./index.js"]
	  },
	  output: {
	    path: path.resolve(__dirname, "./dist"),
	    filename: "reasondb.js",
	  },
	  devServer: {
	    host: '0.0.0.0', // Required for docker
	    publicPath: '/javascript/',
	    contentBase: path.resolve(__dirname, "./"),
	    watchContentBase: true,
	    compress: true,
	    port: 3000
	  },
	  devtool: 'inline-source-map'
}
const backConfig = {
		target: "node",
	  entry: {
	    app: ["./index.js"] // should change contents to point to dist/reasondb.node.js, should put index.js in src
	  },
	  output: {
	    path: path.resolve(__dirname, "./dist"),
	    filename: "reasondb-node.js"
	  },
	  externals: [nodeExternals()],
}
// Combined 'module.exports'
module.exports = [ frontConfig, backConfig ];