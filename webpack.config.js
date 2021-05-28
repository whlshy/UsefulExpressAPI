/* webpack.config.js ： Webpack 的設定檔 */
const path = require('path');
// const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const clientConfig = {
    mode: 'production',
    target: 'node',
    entry: {
        'app': './index.js',
        // vendor: Object.keys(json.dependencies)
    },
    node: {
        __dirname: false,
        __filename: true,
    },
    // 設定要不要先轉譯這個位置
    output: {
        path: path.join(__dirname, 'dist'),
        // 獲取絕對路徑的方法
        filename: '[name].bundle.js',
        clean: true,
    },
    // externals: [nodeExternals()],
    // // 這個是擴展，太複雜本系列不會帶到，請到webpack官網查看
    // resolve: {
    //     extensions: ['.ts', '.js']         // 補足 import 檔案的結尾
    // },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: path.join(__dirname, 'public'), to: path.join(__dirname, 'dist/public') },
                { from: path.join(__dirname, 'web.config'), to: path.join(__dirname, 'dist') },
            ]
            // 指定來源與目的地
        }),
    ],
    optimization: {
        minimizer: [
            // 壓縮JS
            new TerserPlugin({
                test: /\.js(x)?(\?.*)?$/i,
                exclude: /node_modules/,
                terserOptions: {
                    compress: {
                        warnings: false, // 當刪除沒有用處的代碼時，顯示警告
                        drop_console: true // 刪除console.*函數
                    },
                    output: {
                        beautify: false, // 是否美化輸出代碼
                        comments: false // 保留所有註釋
                    }
                }
            }),
        ]
    },
    //   devtool: 'source-map',
}
module.exports = [clientConfig];