#!/usr/bin/env node

// Test script for RDW MCP Server
// Run with: node test-mcp.js

import { spawn } from 'child_process';

async function testMCPServer() {
  const child = spawn('node', ['build/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let responses = [];

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      if (line.startsWith('{')) {
        try {
          responses.push(JSON.parse(line));
        } catch (e) {
          console.log('Non-JSON output:', line);
        }
      }
    });
  });

  child.stderr.on('data', (data) => {
    console.log('Server log:', data.toString());
  });

  // Send initialization
  const initMessage = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: { roots: { listChanged: true }, sampling: {} },
      clientInfo: { name: "test-client", version: "1.0.0" }
    }
  };

  console.log('🔧 Initializing MCP server...');
  child.stdin.write(JSON.stringify(initMessage) + '\n');

  // Wait a bit for initialization
  await new Promise(resolve => setTimeout(resolve, 1000));

  // List tools
  const listToolsMessage = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list"
  };

  console.log('📋 Listing available tools...');
  child.stdin.write(JSON.stringify(listToolsMessage) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test license plate lookup
  const lookupMessage = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "rdw-license-plate-lookup",
      arguments: { kenteken: "N500FV" }  // Test with a real Dutch plate format
    }
  };

  console.log('🔍 Testing license plate lookup...');
  child.stdin.write(JSON.stringify(lookupMessage) + '\n');

  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test vehicle search
  const searchMessage = {
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "rdw-vehicle-search",
      arguments: { brand: "BMW", limit: 3 }
    }
  };

  console.log('🚗 Testing vehicle search...');
  child.stdin.write(JSON.stringify(searchMessage) + '\n');

  // Wait for final response
  await new Promise(resolve => setTimeout(resolve, 3000));

  child.stdin.end();

  // Print all responses
  console.log('\n📊 Test Results:');
  responses.forEach((response, index) => {
    console.log(`\nResponse ${index + 1}:`, JSON.stringify(response, null, 2));
  });

  child.kill();
}

testMCPServer().catch(console.error);
