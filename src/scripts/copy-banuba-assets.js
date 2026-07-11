#!/usr/bin/env node
/**
 * Copy Banuba SDK assets to iOS build with proper MIME type configuration
 * This script runs after Vite build and before Capacitor sync
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BANUBA_SRC = path.join(__dirname, '..', 'public', 'banuba');
const BANUBA_DEST = path.join(__dirname, '..', 'dist', 'banuba');
const IOS_WWW = path.join(__dirname, '..', 'ios', 'App', 'www', 'banuba');

console.log('🎭 Banuba Asset Copier');
console.log('═══════════════════════════════════════');

// Check source exists
if (!fs.existsSync(BANUBA_SRC)) {
  console.error('❌ Banuba source folder not found:', BANUBA_SRC);
  process.exit(1);
}

// Read source files
const files = fs.readdirSync(BANUBA_SRC);
console.log('📦 Found', files.length, 'Banuba files:');
files.forEach(f => console.log('   •', f));

// Copy to dist
if (!fs.existsSync(BANUBA_DEST)) {
  fs.mkdirSync(BANUBA_DEST, { recursive: true });
}

files.forEach(file => {
  const src = path.join(BANUBA_SRC, file);
  const dest = path.join(BANUBA_DEST, file);
  fs.copyFileSync(src, dest);
  console.log('✅ Copied to dist:', file);
});

// Copy to iOS www
if (fs.existsSync(path.join(__dirname, '..', 'ios', 'App', 'www'))) {
  if (!fs.existsSync(IOS_WWW)) {
    fs.mkdirSync(IOS_WWW, { recursive: true });
  }
  
  files.forEach(file => {
    const src = path.join(BANUBA_SRC, file);
    const dest = path.join(IOS_WWW, file);
    fs.copyFileSync(src, dest);
    console.log('✅ Copied to iOS:', file);
  });
} else {
  console.log('⚠️ iOS www folder not found - run "npx cap copy" first');
}

// Create MIME type configuration file for iOS
const mimeConfig = {
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.js': 'application/javascript',
  '.esm.js': 'application/javascript',
  '.d.ts': 'text/typescript'
};

const mimePath = path.join(BANUBA_DEST, 'mime-types.json');
fs.writeFileSync(mimePath, JSON.stringify(mimeConfig, null, 2));
console.log('✅ Created MIME type config');

console.log('═══════════════════════════════════════');
console.log('🎉 Banuba assets copied successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Run: npx cap copy ios');
console.log('2. Open Xcode and verify banuba/ folder is in www/');
console.log('3. Check that .wasm files have Content-Type: application/wasm');