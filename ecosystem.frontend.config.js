module.exports = {
  apps: [
    {
      name: 'kyatflow-frontend',
      script: 'serve',
      args: '-s dist -l 3555',
      env: {
        NODE_ENV: 'production',
        PORT: 3555,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'dist'],
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};

