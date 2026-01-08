module.exports = {
  apps: [
    {
      name: 'kyatflow-backend',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env', // Load environment variables from .env file
      env: {
        NODE_ENV: 'production',
        PORT: 9800,
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'dist'],
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};

