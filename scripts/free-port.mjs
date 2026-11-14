#!/usr/bin/env node
// 启动前释放端口：找到监听进程并结束，最多等待 10s 确认端口空闲
import { execSync } from 'node:child_process';

const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error('用法: node scripts/free-port.mjs <port>');
  process.exit(1);
}

const isWin = process.platform === 'win32';
const probeTool = isWin ? 'netstat' : 'lsof';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let probeBroken = false;

function pidsOnPort(p) {
  try {
    if (isWin) {
      const out = execSync('netstat -ano', { encoding: 'utf8' });
      const pids = new Set();
      for (const line of out.split(/\r?\n/)) {
        const m = line.trim().match(/^TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)$/);
        if (m && Number(m[1]) === p) pids.add(m[2]);
      }
      return [...pids];
    }
    const out = execSync(`lsof -ti tcp:${p}`, { encoding: 'utf8' });
    return [...new Set(out.split(/\s+/).filter(Boolean))];
  } catch (err) {
    // 未安装工具时命令会失败；端口无占用时 lsof 也会返回非 0
    if (err && err.status === null) probeBroken = true;
    return [];
  }
}

function killPid(pid) {
  try {
    if (isWin) execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    else process.kill(Number(pid), 'SIGKILL');
  } catch {
    // 进程可能已自行退出
  }
}

const initial = pidsOnPort(port);
for (const pid of initial) {
  console.log(`端口 ${port} 被 PID ${pid} 占用，正在结束…`);
  killPid(pid);
}

for (let waited = 0; waited < 10000 && pidsOnPort(port).length; waited += 300) {
  await sleep(300);
}

const remaining = pidsOnPort(port);
if (remaining.length) {
  console.error(`端口 ${port} 仍被 PID ${remaining.join(', ')} 占用，请手动结束后重试。`);
  process.exit(1);
}

if (probeBroken) {
  console.warn(`提示：未找到 ${probeTool} 命令，跳过端口 ${port} 的占用检测`);
} else if (initial.length) {
  console.log(`端口 ${port} 已释放`);
}