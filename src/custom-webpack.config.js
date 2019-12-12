module.exports = {
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