const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  watch: true,
  entry: {
    content: './src/scripts/content/content.mjs',
    options: './src/scripts/options/options.js',
    popup: './src/scripts/popup/popup.js',
    background: './src/scripts/background/background.js'
  },
  mode: "development",
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(s[ac]|c)ss$/i,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/, // Exclude node_modules for better performance
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './manifest.json' },
        { from: './src/images/', to: 'images' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: "./src/scripts/options/index.html",
      filename: "options.html",
      chunks: ['options']
    }),
    new HtmlWebpackPlugin({
      template: "./src/scripts/popup/index.html",
      filename: "popup.html",
      chunks: ['popup']
    })
  ],
  devtool: 'inline-source-map' // Helpful for debugging in development mode
};
