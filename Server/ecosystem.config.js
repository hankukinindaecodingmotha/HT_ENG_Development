module.exports = {
  apps: [{
    name: 'hteng-server',
    script: 'server.js',
    instances: 'max', // CPU 코어 수만큼 인스턴스 생성
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // 로그 설정
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 모니터링 설정
    min_uptime: '10s',
    max_restarts: 10,
    
    // 메모리 제한
    max_memory_restart: '1G',
    
    // 자동 재시작 설정
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    
    // 환경변수
    env_file: '.env'
  }]
};
