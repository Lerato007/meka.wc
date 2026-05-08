module.exports = {
  devServer: {
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
      },
    },
  },
};