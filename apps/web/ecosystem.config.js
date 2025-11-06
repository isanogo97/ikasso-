module.exports = {
  apps: [
    {
      name: 'ikasso-web',
      cwd: __dirname,
      script: 'node',
      args: '.next/standalone/apps/web/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}

