# RDW MCP Server

[![npm version](https://badge.fury.io/js/rdw-mcp-server.svg)](https://badge.fury.io/js/rdw-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for querying Dutch RDW (Rijksdienst voor het Wegverkeer) vehicle registration data. This server provides tools to look up vehicle information, fuel/emissions data, and search vehicles by brand and model using the official RDW open data API.

## Features

- **License Plate Lookup**: Get comprehensive vehicle information by Dutch license plate (kenteken)
- **Fuel & Emissions Data**: Retrieve detailed fuel type, emissions, and environmental specifications
- **Vehicle Search**: Search for vehicles by brand and optionally model name
- **Real-time Data**: Access up-to-date information from official RDW databases
- **Enhanced Data**: Detailed vehicle specifications including technical, financial, and inspection data

## Installation

### Global Installation (Recommended)

```bash
npm install -g rdw-mcp-server
```

After installation, you can run the server directly:

```bash
rdw-mcp
```

### Local Installation

```bash
npm install rdw-mcp-server
```

### Development Installation

```bash
git clone <your-repo-url>
cd rdw-mcp-server
npm install
npm run build
```

## Usage

### As a Global Command

After global installation:

```bash
rdw-mcp
```

### In MCP Client Configuration

Add to your MCP client configuration:

```json
{
  "servers": {
    "rdw": {
      "command": "rdw-mcp"
    }
  }
}
```

### Direct Node.js Usage

```bash
npx rdw-mcp-server
```

### Development

```bash
npm run dev
```

## Available Tools

### 1. `rdw-license-plate-lookup`
Look up vehicle information by Dutch license plate.

**Parameters:**
- `kenteken` (string): Dutch license plate to look up

**Example:** Look up license plate "12-ABC-3"

### 2. `rdw-fuel-emissions`
Get fuel type and emissions data for a vehicle.

**Parameters:**
- `kenteken` (string): Dutch license plate to look up

**Example:** Get emissions data for "12-ABC-3"

### 3. `rdw-vehicle-search`
Search for vehicles by brand and optionally model.

**Parameters:**
- `brand` (string): Vehicle brand (e.g., "VOLKSWAGEN", "BMW")
- `model` (string, optional): Vehicle model/trade name
- `limit` (number, optional): Maximum results (1-100, default 10)

**Example:** Search for BMW vehicles

## Configuration for Claude Desktop

To use this MCP server with Claude Desktop, add the following to your `claude_desktop_config.json`:

### Windows
```json
{
  "mcpServers": {
    "rdw": {
      "command": "node",
      "args": ["C:\\ABSOLUTE\\PATH\\TO\\rdw-mcp\\build\\index.js"]
    }
  }
}
```

### macOS/Linux
```json
{
  "mcpServers": {
    "rdw": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/rdw-mcp/build/index.js"]
    }
  }
}
```

## Data Sources

This server uses the official RDW (Dutch vehicle authority) open data APIs:

- **Base API**: `https://opendata.rdw.nl/resource/`
- **Vehicle Registration**: Dataset `m9d7-ebf2` for basic vehicle information
- **Fuel & Emissions**: Dataset `8ys7-d773` for fuel and emissions data

## Example Queries

Once connected to Claude Desktop, you can ask questions like:

- "Look up license plate 12-ABC-3"
- "What are the emissions data for kenteken XYZ-123?"
- "Show me BMW vehicles registered in the Netherlands"
- "Find Volkswagen Golf models in the database"

## Technical Details

- **Language**: TypeScript
- **Runtime**: Node.js
- **Protocol**: Model Context Protocol (MCP)
- **Transport**: Standard I/O (stdio)
- **Validation**: Zod schemas for input validation
- **API**: RESTful calls to RDW open data endpoints

## Error Handling

The server includes comprehensive error handling for:
- Invalid license plates
- Network connectivity issues
- API rate limiting
- Missing or malformed data

## License

ISC

## Contributing

This is an example MCP server for educational purposes. Feel free to extend it with additional RDW datasets or functionality.

## Disclaimer

This server uses public RDW data and is not affiliated with the official RDW organization. Always verify critical vehicle information through official channels.
