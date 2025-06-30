# Testing RDW MCP Server

## Method 1: MCP Inspector (Recommended)

Run this command to launch the MCP Inspector:
```bash
npx @modelcontextprotocol/inspector node build/index.js
```

This will open a web interface where you can:
- See all available tools
- Test each tool with sample inputs
- View responses in real-time

## Method 2: Manual JSON-RPC Testing

### Initialize the server:
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}' | node build/index.js
```

### List available tools:
```bash
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}' | node build/index.js
```

### Test license plate lookup:
```bash
echo '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "rdw-license-plate-lookup", "arguments": {"kenteken": "12-ABC-3"}}}' | node build/index.js
```

### Test fuel emissions:
```bash
echo '{"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "rdw-fuel-emissions", "arguments": {"kenteken": "12-ABC-3"}}}' | node build/index.js
```

### Test vehicle search:
```bash
echo '{"jsonrpc": "2.0", "id": 5, "method": "tools/call", "params": {"name": "rdw-vehicle-search", "arguments": {"brand": "BMW", "limit": 5}}}' | node build/index.js
```

## Method 3: Creating an HTTP Wrapper (Advanced)

If you specifically need HTTP/REST access for Postman, you could create a wrapper:

### Install Express
```bash
npm install express
npm install --save-dev @types/express
```

### Create HTTP wrapper (http-wrapper.ts)
```typescript
import express from 'express';
import { spawn } from 'child_process';

const app = express();
app.use(express.json());

async function callMCPTool(toolName: string, args: any) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['build/index.js']);
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', () => {
      try {
        const lines = output.trim().split('\n');
        const result = JSON.parse(lines[lines.length - 1]);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    // Send initialization
    child.stdin.write(JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: { roots: { listChanged: true }, sampling: {} },
        clientInfo: { name: "http-wrapper", version: "1.0.0" }
      }
    }) + '\n');
    
    // Send tool call
    child.stdin.write(JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: toolName, arguments: args }
    }) + '\n');
    
    child.stdin.end();
  });
}

app.post('/rdw/lookup/:kenteken', async (req, res) => {
  try {
    const result = await callMCPTool('rdw-license-plate-lookup', { 
      kenteken: req.params.kenteken 
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/rdw/emissions/:kenteken', async (req, res) => {
  try {
    const result = await callMCPTool('rdw-fuel-emissions', { 
      kenteken: req.params.kenteken 
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/rdw/search', async (req, res) => {
  try {
    const { brand, model, limit } = req.body;
    const result = await callMCPTool('rdw-vehicle-search', { 
      brand, model, limit 
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('HTTP wrapper running on http://localhost:3000');
});
```

## Method 4: Using Claude Desktop (Production Use)

Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "rdw": {
      "command": "node",
      "args": ["C:\\Users\\durjor01\\RDW-MCP\\build\\index.js"]
    }
  }
}
```

Then ask Claude questions like:
- "Look up Dutch license plate 12-ABC-3"
- "What are the emissions for kenteken XYZ-123?"
- "Search for BMW vehicles in the Dutch registry"

## Recommended Testing Workflow

1. **Start with MCP Inspector** - Best for development and testing
2. **Use Claude Desktop** - Best for real-world usage
3. **Manual JSON-RPC** - Good for CI/CD and automated testing
4. **HTTP Wrapper** - Only if you absolutely need REST API access
