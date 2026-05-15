#!/usr/bin/env node
const { exec, spawn } = require('node:child_process');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const waitArgIndex = argv.indexOf('--wait');
const waitSecs = waitArgIndex !== -1 ? Number(argv[waitArgIndex + 1] || 10) : 10;
const port = Number(process.env.PORT || 4173);

function log(...args) { console.log('[serve-safe]', ...args); }

function findPidOnPort(port, cb) {
  if (os.platform() === 'win32') {
    exec(`netstat -ano -p tcp`, (err, stdout) => {
      if (err) return cb(null);
      const lines = stdout.split(/\r?\n/);
      for (const l of lines) {
        if (l.includes(`:${port}`)) {
          const parts = l.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) return cb(Number(pid));
        }
      }
      cb(null);
    });
  } else {
    // unix-like
    exec(`lsof -i :${port} -t 2>/dev/null`, (err, stdout) => {
      if (err || !stdout) return cb(null);
      const pid = Number(stdout.trim().split(/\r?\n/)[0]);
      cb(isNaN(pid) ? null : pid);
    });
  }
}

function killPid(pid, cb) {
  if (!pid) return cb();
  if (os.platform() === 'win32') {
    exec(`taskkill /PID ${pid} /F`, (err) => cb());
  } else {
    try { process.kill(pid, 'SIGKILL'); } catch(e){};
    cb();
  }
}

function waitForHttp(url, timeoutSec) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(res.statusCode);
      });
      req.on('error', () => {
        if ((Date.now() - start) / 1000 > timeoutSec) return reject(new Error('timeout'));
        setTimeout(poll, 500);
      });
    })();
  });
}

async function main() {
  log(`port=${port} dryRun=${dryRun} wait=${waitSecs}s`);
  findPidOnPort(port, async (pid) => {
    if (pid) {
      log(`found existing process pid=${pid} on port ${port}`);
      if (dryRun) { log('dry-run: would kill', pid); return; }
      await new Promise((res) => killPid(pid, res));
      log(`killed pid ${pid}`);
    } else {
      log(`no process found on port ${port}`);
    }

    if (dryRun) {
      log('dry-run complete');
      process.exit(0);
    }

    // Start server
    const nodeBin = process.execPath;
    const serverFile = path.join(__dirname, '..', 'server.cjs');
    log('starting server:', nodeBin, serverFile);
    const child = spawn(nodeBin, [serverFile], { stdio: 'inherit' });

    // Wait for health
    const url = `http://127.0.0.1:${port}/`;
    try {
      await waitForHttp(url, waitSecs);
      log(`server responded at ${url}`);
      process.exit(0);
    } catch (err) {
      log(`server did not respond within ${waitSecs}s`);
      process.exit(2);
    }
  });
}

main().catch((err) => { console.error(err); process.exit(1); });
