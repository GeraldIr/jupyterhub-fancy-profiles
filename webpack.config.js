const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "src", "index.jsx"),
  devtool: "source-map",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.(css)/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  output: {
    publicPath: "/hub/fancy-profiles/static/dist/",
    filename: "form.js",
    path: path.resolve(__dirname, "jupyterhub_fancy_profiles/static/dist/"),
  },
  resolve: {
    extensions: [".css", ".js", ".jsx"],
  },
};
