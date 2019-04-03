const {resolve} = require('path');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const serverPort = 8033;

const config = {
    stats: {
        maxModules: 0
    },
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',

    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://0.0.0.0:' + serverPort,
        'webpack/hot/only-dev-server',
        './main.js',
        './assets/scss/main.scss',
    ],

    output: {
        filename: 'bundle.js',
        path: resolve(__dirname, 'dist'),
        publicPath: '',
    },

    context: resolve(__dirname, 'app'),

    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        // host: '54.93.252.93',
        host: '0.0.0.0',
        hot: true,
        contentBase: resolve(__dirname, 'build'),
        historyApiFallback: true,
        publicPath: '/',
        port: serverPort
    },

    resolve: {
        extensions: ['.js', '.jsx'],
        // alias: {
        //     three$: 'three/build/three.min.js',
        //     'three/.*$': 'three',
        //     // don't need to register alias for every module
        // },
    },

    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.jsx?$/,
                exclude: /node_modules/,
                // loader: "eslint-loader"
            },
            {
                test: /\.jsx?$/,
                loaders: [
                    'babel-loader',
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            query: {
                                sourceMap: false,
                            },
                        },
                    ],
                    publicPath: '../'
                })),
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            mimetype: 'image/png',
                            name: 'images/[name].[ext]',
                        }
                    }
                ],
            },
            {
                test: /\.eot(\?v=\d+.\d+.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'fonts/[name].[ext]'
                        }
                    }
                ],
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            mimetype: 'application/font-woff',
                            name: 'fonts/[name].[ext]',
                        }
                    }
                ],
            },
            {
                test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            mimetype: 'application/octet-stream',
                            name: 'fonts/[name].[ext]',
                        }
                    }
                ],
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            mimetype: 'image/svg+xml',
                            name: 'images/[name].[ext]',
                        }
                    }
                ],
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            THREE: 'three-full',
            // ...
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.LoaderOptionsPlugin({
            test: /\.jsx?$/,
            // options: {
            //   eslint: {
            //     configFile: resolve(__dirname, '.eslintrc'),
            //     cache: false,
            //   }
            // },
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new ExtractTextPlugin({filename: './styles/style.css', disable: false, allChunks: true}),
        new CopyWebpackPlugin([{from: 'vendors', to: 'vendors'}]),
        // new OpenBrowserPlugin({url: 'http://localhost:8080/project/viz360/admin_panel'}),
        new webpack.HotModuleReplacementPlugin(),
    ]
};

module.exports = config;
