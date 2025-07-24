module.exports = {
  apps: [
    {
      name: 'nest_admin_server',
      namespace: 'nest_admin_server',
      max_memory_restart: '1024M',
      user: 'www',
      exec_mode: 'fork',
      cwd: '/www/wwwroot/nest-admin-server',
      script: 'dist/main.js',
      args: '',
      watch: false,
      out_file: '/www/wwwlogs/pm2/nest_admin_server/out.log',
      error_file: '/www/wwwlogs/pm2/nest_admin_server/err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      env: {
        // 环境变量
        NODE_ENV: 'production',
      },
    },
  ],
};
