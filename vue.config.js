module.exports = {
    chainWebpack: config => {
        // 让 babel 转码一些最新的 js API
        config.entry('main').add('babel-polyfill')
        config.module
            .rule('image')
            .test(/\.ico$/)
            .use('url-loader')
            .loader('url-loader')
    },
}