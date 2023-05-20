// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require("webpack");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { alias, configPaths, aliasJest } = require("react-app-rewire-alias");

const aliasMap = configPaths("./tsconfig.paths.json"); // or jsconfig.paths.json

module.exports.jest = aliasJest(aliasMap);

module.exports = function override(config) {
  //do stuff with the webpack config...

  config.resolve.fallback = {
    url: require.resolve("url"),
    assert: require.resolve("assert"),
    crypto: require.resolve("crypto-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify/browser"),
    buffer: require.resolve("buffer"),
    stream: require.resolve("stream-browserify"),
    fs: false,
  };
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );

  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });

  const r = alias(aliasMap)(config);

  return r;
};
