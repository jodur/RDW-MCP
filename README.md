# RDW MCP Server

[![npm version](https://badge.fury.io/js/rdw-mcp-server.svg)](https://badge.fury.io/js/rdw-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for querying Dutch RDW (Rijksdienst voor het Wegverkeer) vehicle registration data. This server provides tools to look up vehicle information, fuel/emissions data, and search vehicles by brand and model using the official RDW open data API.

## Quick Start

1. **Install globally:**
   ```bash
   npm install -g rdw-mcp-server
   ```

2. **Test the installation:**
   ```bash
   rdw-mcp
   ```
   (Press Ctrl+C to stop)

3. **Add to Claude Desktop** (see Configuration section below)

4. **Start asking questions like:**
   - "Look up license plate 12-ABC-3"
   - "Show me BMW vehicles"

## Features

- **License Plate Lookup**: Get comprehensive vehicle information by Dutch license plate (kenteken)
- **Fuel & Emissions Data**: Retrieve detailed fuel type, emissions, and environmental specifications
- **Vehicle Search**: Search for vehicles by brand and optionally model name
- **Real-time Data**: Access up-to-date information from official RDW databases
- **Enhanced Data**: Detailed vehicle specifications including technical, financial, and inspection data

## Installation

### Global Installation (Recommended for CLI usage)

```bash
npm install -g rdw-mcp-server
```

After global installation, you can run the server directly:

```bash
rdw-mcp
```

### Local Installation (For development or custom usage)

```bash
npm install rdw-mcp-server
```

Then run with:

```bash
npx rdw-mcp-server
```

### From Source (Development)

```bash
git clone https://github.com/yourusername/rdw-mcp-server.git
cd rdw-mcp-server
npm install
npm run build
npm start
```

## Usage

### As a Global Command

After global installation, start the MCP server:

```bash
rdw-mcp
```

The server will start and listen on stdio for MCP protocol messages.

### In MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

**If installed globally:**
```json
{
  "servers": {
    "rdw": {
      "command": "rdw-mcp"
    }
  }
}
```

**If installed locally:**
```json
{
  "servers": {
    "rdw": {
      "command": "npx",
      "args": ["rdw-mcp-server"]
    }
  }
}
```

### Direct Node.js Usage

```bash
npx rdw-mcp-server
```

### Development Mode

For development with auto-rebuild:

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

## Requirements

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Internet connection**: Required for accessing RDW API

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

All data is retrieved in real-time from official government sources and is publicly available.

## Privacy & Data Usage

- **No Data Storage**: This server does not store any vehicle data locally
- **Real-time Queries**: All requests are forwarded directly to RDW APIs
- **Public Data Only**: Only publicly available registration data is accessed
- **No Authentication**: No personal or sensitive data is required or processed

## Rate Limiting

The RDW API may impose rate limits. If you encounter rate limiting:
- Wait a few seconds between requests
- Avoid making bulk requests in quick succession
- Consider implementing delays in your application logic

## Example Queries

Once connected to an MCP client like Claude Desktop, you can ask questions like:

**License Plate Lookups:**
- "Look up license plate 12-ABC-3"
- "What information is available for kenteken XYZ-123?"
- "Tell me about the vehicle with plate 1-ABC-23"

**Emissions and Fuel Data:**
- "What are the emissions data for kenteken ABC-12-D?"
- "Show me fuel consumption for license plate XYZ-456"
- "What's the environmental category of vehicle 12-ABC-3?"

**Vehicle Search:**
- "Show me BMW vehicles registered in the Netherlands"
- "Find Volkswagen Golf models in the database"
- "Search for MERCEDES vehicles"
- "List Toyota Corolla vehicles"

**Combined Queries:**
- "Find BMW X5 vehicles and show their emissions data"
- "Search for electric vehicles by Tesla"

## Technical Details

- **Language**: TypeScript
- **Runtime**: Node.js
- **Protocol**: Model Context Protocol (MCP)
- **Transport**: Standard I/O (stdio)
- **Validation**: Zod schemas for input validation
- **API**: RESTful calls to RDW open data endpoints

## Error Handling

The server includes comprehensive error handling for:
- Invalid license plates (wrong format or non-existent)
- Network connectivity issues
- API rate limiting and timeouts
- Missing or malformed data from RDW API
- Invalid search parameters

## Troubleshooting

### Common Issues

**Server not starting:**
- Ensure Node.js version is 18.0.0 or higher: `node --version`
- Try reinstalling: `npm uninstall -g rdw-mcp-server && npm install -g rdw-mcp-server`

**No data returned:**
- Check your internet connection
- Verify the license plate format (Dutch plates: XX-XXX-X, XXX-XX-X, etc.)
- Some older vehicles may not have complete data in the RDW database

**Claude Desktop connection issues:**
- Ensure the absolute path in your configuration is correct
- Check that the build directory exists: `ls build/` or `dir build\`
- Restart Claude Desktop after configuration changes

### Getting Help

If you encounter issues:
1. Check the console output for error messages
2. Verify your license plate format matches Dutch standards
3. Test with known valid license plates
4. Ensure you have an active internet connection

## License

MIT

## Contributing

Contributions are welcome! This MCP server can be extended with additional RDW datasets or functionality.

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/rdw-mcp-server.git
   cd rdw-mcp-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build and test:**
   ```bash
   npm run build
   npm start
   ```

### Available RDW Datasets

The RDW provides many more datasets that could be integrated:
- APK (MOT) inspection results
- Vehicle recalls
- Taxi and bus registrations
- Vehicle ownership changes
- Technical defects data

### Code Style

- Use TypeScript with strict typing
- Follow existing code patterns
- Add JSDoc comments for all functions
- Use Zod for input validation
- Include proper error handling

## Changelog

### Version 1.0.2
- Comprehensive README improvements for npm users
- Enhanced installation and usage instructions
- Added troubleshooting and privacy sections
- Improved example queries and development setup
- Fixed package.json references to removed test files

### Version 1.0.1
- Enhanced vehicle data output
- Improved license plate normalization
- Added comprehensive error handling
- Enhanced documentation

### Version 1.0.0
- Initial release
- Basic license plate lookup
- Fuel and emissions data
- Vehicle search by brand/model

## Disclaimer

This server uses public RDW data and is not affiliated with the official RDW organization. Always verify critical vehicle information through official channels.
