const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const postcssPresetEnv = require('postcss-preset-env');

const mode = process.env.NODE_ENV || 'development';
const devMode = mode === 'development';
const target = devMode ? 'web' : 'browserslist';
const devtool = devMode ? 'eval-source-map' : undefined;

module.exports = {
    mode,
    target,
    devtool,
    entry: path.resolve(__dirname, 'src', 'index.ts'),
    module: {
        rules: [
            {
                test: /\.ts$/i,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')],
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.(c|sa|sc)ss$/i,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [postcssPresetEnv],
                            },
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.woff2?$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name].[ext]',
                },
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/inline',
            },
        ],
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        open: true,
        hot: true,
        client: {
            overlay: {
                errors: true,
                warnings: false,
                runtimeErrors: true,
            },
        },
        // devMiddleware: {
        //     index: true,
        //     mimeTypes: { phtml: 'text/html' },
        //     writeToDisk: true,
        // },
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: '[name].[contenthash].js',
        clean: true,
        path: path.resolve(__dirname, 'public'),
        assetModuleFilename: 'assets/[name][ext]',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src', 'index.html'),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
        new CopyPlugin({
            patterns: [
                { from: path.resolve(__dirname, './src/assets/'), to: path.resolve(__dirname, './public/assets') },
            ],
        }),
    ],
};
