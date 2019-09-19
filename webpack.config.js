const path = require('path')

module.exports = {
  entry: {
    polyfills: './build/src/polyfills.js',
    main: './build/src/MasterPage.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx']
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
