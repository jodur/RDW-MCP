#!/usr/bin/env node

/**
 * RDW MCP Server
 * 
 * Model Context Protocol server for querying Dutch RDW (Rijksdienst voor het Wegverkeer) 
 * vehicle registration data. Provides tools for license plate lookups, vehicle information 
 * retrieval, and technical specifications.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// RDW API Configuration
const RDW_API_BASE = "https://opendata.rdw.nl/resource";
const USER_AGENT = "RDW-MCP-Server/1.0";

/**
 * Create server instance with RDW capabilities
 */
const server = new McpServer({
  name: "rdw-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

/**
 * Helper function for making RDW API requests
 */
async function makeRDWRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
  const url = new URL(`${RDW_API_BASE}/${endpoint}.json`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers = {
    "User-Agent": USER_AGENT,
    "Accept": "application/json",
  };

  try {
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making RDW request:", error);
    return null;
  }
}

/**
 * Type definitions for RDW API responses
 */
interface VehicleBaseInfo {
  kenteken?: string;
  voertuigsoort?: string;
  merk?: string;
  handelsbenaming?: string;
  type_goedkeuring_nummer?: string;
  variant?: string;
  uitvoering?: string;
  kleur?: string;
  eerste_kleur?: string;
  tweede_kleur?: string;
  aantal_zitplaatsen?: string;
  aantal_staanplaatsen?: string;
  datum_eerste_toelating?: string;
  datum_eerste_tenaamstelling_in_nederland?: string;
  vervaldatum_apk?: string;
  dt_laatste_update_in_rdw?: string;
}

interface VehicleFuelInfo {
  kenteken?: string;
  brandstof_volgnummer?: string;
  brandstof_omschrijving?: string;
  emissiecode_omschrijving?: string;
  uitlaatemissieniveau?: string;
  co2_emissieklasse?: string;
  nettomaximumvermogen?: string;
  geluidsniveau_rijdend?: string;
  geluidsniveau_stationair?: string;
  roetuitstoot?: string;
}

/**
 * Format vehicle information for display
 */
function formatVehicleInfo(vehicle: VehicleBaseInfo): string {
  const info = [
    `License Plate: ${vehicle.kenteken || "Unknown"}`,
    `Vehicle Type: ${vehicle.voertuigsoort || "Unknown"}`,
    `Brand: ${vehicle.merk || "Unknown"}`,
    `Model: ${vehicle.handelsbenaming || "Unknown"}`,
    `Color: ${vehicle.eerste_kleur || "Unknown"}${vehicle.tweede_kleur ? ` / ${vehicle.tweede_kleur}` : ""}`,
    `Seats: ${vehicle.aantal_zitplaatsen || "Unknown"}`,
    `First Registration: ${vehicle.datum_eerste_toelating || "Unknown"}`,
    `APK Expiry: ${vehicle.vervaldatum_apk || "Unknown"}`,
  ];
  
  return info.join("\n");
}

/**
 * Format fuel/emissions information for display
 */
function formatFuelInfo(fuelData: VehicleFuelInfo[]): string {
  if (!fuelData || fuelData.length === 0) {
    return "No fuel information available";
  }

  return fuelData.map((fuel, index) => {
    const info = [
      `Fuel Type ${index + 1}: ${fuel.brandstof_omschrijving || "Unknown"}`,
      `Emission Level: ${fuel.uitlaatemissieniveau || "Unknown"}`,
      `CO2 Class: ${fuel.co2_emissieklasse || "Unknown"}`,
      `Max Power: ${fuel.nettomaximumvermogen || "Unknown"} kW`,
      `Sound Level (Driving): ${fuel.geluidsniveau_rijdend || "Unknown"} dB`,
      `Sound Level (Idle): ${fuel.geluidsniveau_stationair || "Unknown"} dB`,
    ];
    return info.join("\n");
  }).join("\n---\n");
}

/**
 * Register RDW tools
 */

// Tool 1: License plate lookup
server.tool(
  "rdw-license-plate-lookup",
  "Look up Dutch vehicle information by license plate",
  {
    kenteken: z.string().min(1).describe("Dutch license plate (kenteken) to look up"),
  },
  async ({ kenteken }) => {
    // Clean up the license plate (remove spaces, convert to uppercase)
    const cleanKenteken = kenteken.replace(/\s+/g, "").toUpperCase();
    
    try {
      // Get basic vehicle information
      const vehicleData = await makeRDWRequest<VehicleBaseInfo[]>("m9d7-ebf2", {
        kenteken: cleanKenteken,
      });

      if (!vehicleData || vehicleData.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No vehicle found for license plate: ${cleanKenteken}`,
            },
          ],
        };
      }

      const vehicle = vehicleData[0];
      const formattedInfo = formatVehicleInfo(vehicle);

      return {
        content: [
          {
            type: "text",
            text: `Vehicle Information for ${cleanKenteken}:\n\n${formattedInfo}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving vehicle information: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Tool 2: Fuel and emissions data
server.tool(
  "rdw-fuel-emissions",
  "Get fuel type and emissions data for a Dutch vehicle",
  {
    kenteken: z.string().min(1).describe("Dutch license plate (kenteken) to look up"),
  },
  async ({ kenteken }) => {
    const cleanKenteken = kenteken.replace(/\s+/g, "").toUpperCase();
    
    try {
      // Get fuel and emissions information
      const fuelData = await makeRDWRequest<VehicleFuelInfo[]>("8ys7-d773", {
        kenteken: cleanKenteken,
      });

      if (!fuelData || fuelData.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No fuel/emissions data found for license plate: ${cleanKenteken}`,
            },
          ],
        };
      }

      const formattedFuelInfo = formatFuelInfo(fuelData);

      return {
        content: [
          {
            type: "text",
            text: `Fuel & Emissions Data for ${cleanKenteken}:\n\n${formattedFuelInfo}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving fuel/emissions data: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      };
    }
  },
);

// Tool 3: Vehicle search by brand and model
server.tool(
  "rdw-vehicle-search",
  "Search for Dutch vehicles by brand and optionally model",
  {
    brand: z.string().min(1).describe("Vehicle brand (e.g., 'VOLKSWAGEN', 'BMW')"),
    model: z.string().optional().describe("Optional: Vehicle model/trade name"),
    limit: z.number().min(1).max(100).default(10).describe("Maximum number of results (1-100, default 10)"),
  },
  async ({ brand, model, limit }) => {
    try {
      const params: Record<string, string> = {
        merk: brand.toUpperCase(),
        "$limit": limit.toString(),
      };

      if (model) {
        params.handelsbenaming = model.toUpperCase();
      }

      const vehicleData = await makeRDWRequest<VehicleBaseInfo[]>("m9d7-ebf2", params);

      if (!vehicleData || vehicleData.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No vehicles found for brand: ${brand}${model ? ` and model: ${model}` : ""}`,
            },
          ],
        };
      }

      const formattedResults = vehicleData.map((vehicle, index) => 
        `${index + 1}. ${formatVehicleInfo(vehicle)}`
      ).join("\n\n---\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${vehicleData.length} vehicle(s) for ${brand}${model ? ` ${model}` : ""}:\n\n${formattedResults}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching vehicles: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      };
    }
  },
);

/**
 * Main function to run the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("RDW MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
