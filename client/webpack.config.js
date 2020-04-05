const path = require('path');

module.exports = (env) => {
  const isProduction = env === 'production';

  return {
    entry: {
      main: './src/app.js',
    },
    output: {
      path: path.join(__dirname, 'docs', 'assets'),
      publicPath: '/assets/',
      filename: 'bundle.js',
      chunkFilename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'docs'),
      publicPath: '/assets/',
      port: 3000,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          secure: false,
          changeOrigin: true,
        },
      },
    },
  };
};
