#!/usr/bin/env node

/**
 * Universal Production Startup Script for FieldOps ERP Monorepo
 * Automatically detects whether Web (Next.js) or API (NestJS) was built
 * and starts the corresponding production server on the port assigned by host ($PORT).
 * Runs directly with Node - zero external package manager or shell PATH dependencies.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'apps', 'web');
const apiDir = path.join(rootDir, 'apps', 'api');
const webNextDir = path.join(webDir, '.next');
const apiDistFile = path.join(apiDir, 'dist', 'src', 'main.js');

const port = process.env.PORT || '3000';

console.log('----------------------------------------------------');
console.log('🚀 FieldOps ERP Unified Application Bootstrapper');
console.log('----------------------------------------------------');

function findNextCli() {
  const candidates = [
    path.join(webDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
    path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

let command = process.execPath; // Absolute path to current node binary
let args = [];
let targetCwd = rootDir;

// Determine target based on build artifacts and environment
if (process.env.APP_TYPE === 'api' || (!fs.existsSync(webNextDir) && fs.existsSync(apiDistFile))) {
  console.log('[Bootstrapper] Detected NestJS API build.');
  console.log(`[Bootstrapper] Starting API on port ${process.env.PORT || 4000}...`);
  command = process.execPath;
  args = [apiDistFile];
  targetCwd = apiDir;
} else {
  console.log('[Bootstrapper] Detected Next.js Web build.');
  console.log(`[Bootstrapper] Starting Web server on port ${port}...`);
  targetCwd = webDir;
  const nextCli = findNextCli();
  if (nextCli) {
    command = process.execPath;
    args = [nextCli, 'start'];
  } else {
    command = 'npx';
    args = ['next', 'start'];
  }
}

const child = spawn(command, args, {
  cwd: targetCwd,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(port),
  },
});

child.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`[Bootstrapper] Process exited with code ${code} signal ${signal}`);
  }
  process.exit(code || 0);
});

process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
