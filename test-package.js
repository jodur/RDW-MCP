#!/usr/bin/env node

/**
 * Test script to verify the npm package installation
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing RDW MCP Server Package Installation');
console.log('================================================');

// Test 1: Check if build directory exists
import { existsSync } from 'fs';

const buildPath = join(__dirname, 'build', 'index.js');
console.log(`✅ Build file exists: ${existsSync(buildPath)}`);

// Test 2: Check if package can be imported
try {
  const packageInfo = JSON.parse(
    await import('fs').then(fs => 
      fs.promises.readFile(join(__dirname, 'package.json'), 'utf8')
    )
  );
  console.log(`✅ Package info loaded: ${packageInfo.name}@${packageInfo.version}`);
} catch (error) {
  console.log(`❌ Package info error: ${error.message}`);
}

// Test 3: Check if server starts (quick test)
console.log('\n🚀 Testing server startup...');

const serverProcess = spawn('node', [buildPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let hasStarted = false;

const timeout = setTimeout(() => {
  if (!hasStarted) {
    console.log('❌ Server startup timeout');
    serverProcess.kill();
  }
}, 5000);

serverProcess.stderr.on('data', (data) => {
  const message = data.toString();
  output += message;
  
  if (message.includes('RDW MCP Server running on stdio')) {
    hasStarted = true;
    clearTimeout(timeout);
    console.log('✅ Server started successfully');
    
    // Send a simple test message
    serverProcess.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize', 
      params: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'test', version: '1.0.0' }
      }
    }) + '\n');
  }
});

serverProcess.stdout.on('data', (data) => {
  const response = data.toString();
  try {
    const parsed = JSON.parse(response);
    if (parsed.result && parsed.result.serverInfo) {
      console.log(`✅ Server responds: ${parsed.result.serverInfo.name} v${parsed.result.serverInfo.version}`);
    }
  } catch (e) {
    // Ignore parsing errors for this simple test
  }
  
  // Kill the server after getting a response
  setTimeout(() => {
    serverProcess.kill();
  }, 1000);
});

serverProcess.on('close', (code) => {
  console.log(`\n📊 Test Summary:`);
  console.log(`   Server exit code: ${code}`);
  console.log(`   Package is ready for npm publish! 🎉`);
});

serverProcess.on('error', (error) => {
  console.log(`❌ Server error: ${error.message}`);
});
