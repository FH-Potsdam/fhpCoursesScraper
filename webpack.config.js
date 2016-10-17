const { resolve } = require('path');
const { readdirSync } = require('fs');
const nodeModules = {};

readdirSync(resolve(__dirname, 'node_modules'))
	.filter(x => ['.bin'].indexOf(x) === -1)
	.forEach(mod => { nodeModules[mod] = `commonjs ${mod}`; });

module.exports = () => ({
	entry: './src/index.js',
	target: 'node',
	output: {
		path: resolve(__dirname, 'dist'),
		publicPath: resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	externals: nodeModules,
	module: {
		loaders: [
			{ test: /\.js$/,
				loaders: [
					'babel-loader'
				]
			}
		]
	},
	plugins: []
});
