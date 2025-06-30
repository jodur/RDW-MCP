# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an MCP (Model Context Protocol) server project for Dutch RDW vehicle registration data.

## Project Guidelines

- This server provides tools to query Dutch vehicle registration database using RDW open data API
- Use TypeScript with strict typing throughout the project
- Follow MCP SDK patterns and best practices
- Implement proper error handling for API calls
- Use Zod for input validation and schema definitions
- Structure the code with proper separation of concerns
- Add comprehensive JSDoc comments for all functions and types

## Key Features

- License plate lookup functionality
- Vehicle information retrieval (brand, model, fuel type, etc.)
- Technical specifications access
- Emissions and environmental data
- APK (MOT) inspection data
- Filtering and search capabilities

## API Information

The server integrates with RDW (Rijksdienst voor het Wegverkeer) open data APIs:
- Base URL: https://opendata.rdw.nl/resource/
- Returns JSON data with vehicle registration information
- No authentication required for open data endpoints

## References

- MCP SDK Documentation: https://github.com/modelcontextprotocol/create-python-server
- More info and examples at https://modelcontextprotocol.io/llms-full.txt
- RDW Open Data: https://opendata.rdw.nl/
