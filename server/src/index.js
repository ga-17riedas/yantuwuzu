const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const { initDb } = require('./db');
const { seedIfNeeded } = require('./seed');
const { attachUser } = require('./middleware/auth');
const handlers = require('./handlers');

function freePort(port) {
  let out = '';
  try {
    out = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
  } catch {
    return;
  }
  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    if (!/LISTENING|侦听/i.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    const local = parts[1] || '';
    const pid = Number(parts[parts.length - 1]);
    if (!pid || pid === process.pid) continue;
    if (local === `${port}` || local.endsWith(`:${port}`)) pids.add(pid);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`已结束占用 ${port} 端口的旧进程 PID ${pid}`);
    } catch {
      /* ignore */
    }
  }
  if (pids.size) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  }
}

initDb();
const seedResult = seedIfNeeded(config.forceSeed);
console.log(seedResult.seeded ? '已导入种子数据' : '数据库已存在，跳过导入', seedResult);

if (!fs.existsSync(path.join(__dirname, '..', '.env')) && fs.existsSync(path.join(__dirname, '..', '.env.example'))) {
  fs.copyFileSync(path.join(__dirname, '..', '.env.example'), path.join(__dirname, '..', '.env'));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(attachUser);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'yantuwuzu-server' });
});

app.post('/fn/:name', async (req, res) => {
  const name = req.params.name;
  const handler = handlers[name];
  if (!handler) {
    return res.status(404).json({ success: false, errorMessage: `未知接口: ${name}` });
  }
  try {
    const result = await handler(req.body || {}, {
      openid: req.user && req.user.openid,
      req
    });
    res.json(result);
  } catch (err) {
    console.error(`接口 ${name} 执行失败:`, err);
    res.status(500).json({ success: false, errorMessage: err.message || '服务器错误' });
  }
});

freePort(config.port);

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`研途无阻本地后端已启动: http://127.0.0.1:${config.port}`);
  console.log('微信开发者工具请勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${config.port} 仍被占用。请关掉其它占用该端口的程序后再试。`);
    console.error('也可以先在浏览器打开 http://127.0.0.1:3000/health 看后端是否已经在运行。');
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});
