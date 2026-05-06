module.exports = {
  apps: [{
    name: "showcase",
    script: "./server/index.js",
    watch: true,
    ignore_watch: ["node_modules", "data", "client", "client/dist"],
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
