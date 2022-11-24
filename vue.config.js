const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:13221",
        changeOrigin: true,
        ws: false,
        pathRewrite: {
          "^/api": ""
        },
        "secure": false
      },
      "/servicerapi": {
        target: "http://127.0.0.1:13222",
        changeOrigin: true,
        ws: false,
        pathRewrite: {
          "^/servicerapi": ""
        },
        "secure": false
      },
      "/grpcservicer": {
        target: "http://127.0.0.1:22222",
        changeOrigin: true,
        pathRewrite: {
          "^/grpcservicer": ""
        },
        "secure": false
      }
    }
  }
})
