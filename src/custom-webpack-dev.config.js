const ExtensionReloader = require('webpack-extension-reloader')
const config = require('./custom-webpack.config');

module.exports = {...config, 
    mode: 'development',
    entry: { background: 'src/background.js' },
    plugins: [new ExtensionReloader({
        reloadPage: true,
        entries: {
            background: 'background'
        }
    })],
    node: {
        fs: 'empty'
    },
    resolve: {
        extensions: ['.wasm']
    },
    externals: ["fs"],
    module: {
        rules: [{
            test: /\.wasm$/,
            type: 'javascript/auto',
            loaders: ['arraybuffer-loader'],
          }]
    }
}
