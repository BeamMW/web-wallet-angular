const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.join(__dirname, 'src/index.ts'),
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        watchContentBase: true,
        publicPath: '/'
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(c|cpp)$/,
                loader: 'cpp-wasm-loader'
            },
            {
                test: /\.wasm$/,
                loader: "file-loader"
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            filename: 'index.html'
        })
    ],
    externals: {
      'fs': true,
      'path': true
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".c", ".cpp"]
    }
};