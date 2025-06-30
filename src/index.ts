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
  // Additional vehicle details
  inrichting?: string;
  aantal_deuren?: string;
  aantal_wielen?: string;
  massa_ledig_voertuig?: string;
  massa_rijklaar?: string;
  maximum_massa_trekken_ongeremd?: string;
  maximum_massa_trekken_geremd?: string;
  maximum_trekken_massa_geremd?: string; // Correct RDW field name
  datum_tenaamstelling?: string;
  bruto_bpm?: string;
  zuinigheidslabel?: string;
  exportindicator?: string;
  openstaande_terugroepactie_indicator?: string;
  vervaldatum_tachograaf?: string;
  taxi_indicator?: string;
  maximum_massa_voertuig?: string;
  catalogusprijs?: string;
  wam_verzekerd?: string;
  aantal_cilinders?: string;
  cilinderinhoud?: string;
  massa_alt_aandr?: string;
  nettomaximumvermogen?: string;
  nominaal_continu_maximumvermogen?: string;
  // Additional RDW fields
  toegestane_maximum_massa_voertuig?: string;
  technische_max_massa_voertuig?: string;
  maximum_massa_samenstelling?: string;
  // Fields to fix Unknown values
  vermogen_massarijklaar?: string;
  typegoedkeuringsnummer?: string;
  jaar_laatste_registratie_tellerstand?: string;
  type?: string;
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
 * Format vehicle information for display (including fuel/emissions data)
 */
function formatVehicleInfo(vehicle: VehicleBaseInfo, fuelData?: VehicleFuelInfo[]): string {
  const basicInfo = [
    `License Plate: ${vehicle.kenteken || "Unknown"}`,
    `Vehicle Type: ${vehicle.voertuigsoort || "Unknown"}`,
    `Brand: ${vehicle.merk || "Unknown"}`,
    `Model: ${vehicle.handelsbenaming || "Unknown"}`,
    `Variant: ${vehicle.variant || "Unknown"}`,
    `Version: ${vehicle.uitvoering || "Unknown"}`,
  ];

  const appearance = [
    `Primary Color: ${vehicle.eerste_kleur || "Unknown"}`,
    ...(vehicle.tweede_kleur ? [`Secondary Color: ${vehicle.tweede_kleur}`] : []),
    `Body Type: ${vehicle.inrichting || "Unknown"}`,
    `Number of Doors: ${vehicle.aantal_deuren || "Unknown"}`,
    `Number of Wheels: ${vehicle.aantal_wielen || "Unknown"}`,
  ];

  const capacity = [
    `Seats: ${vehicle.aantal_zitplaatsen || "Unknown"}`,
    ...(vehicle.aantal_staanplaatsen ? [`Standing Places: ${vehicle.aantal_staanplaatsen}`] : []),
  ];

  const technical = [
    `Engine Cylinders: ${vehicle.aantal_cilinders || "Unknown"}`,
    `Engine Displacement: ${vehicle.cilinderinhoud ? `${vehicle.cilinderinhoud} cc` : "Unknown"}`,
    `Net Max Power: ${vehicle.nettomaximumvermogen ? `${vehicle.nettomaximumvermogen} kW` : "Unknown"}`,
    `Power/Mass Ratio: ${vehicle.vermogen_massarijklaar ? `${vehicle.vermogen_massarijklaar} kW/kg` : "Unknown"}`,
    ...(vehicle.nominaal_continu_maximumvermogen ? [`Nominal Continuous Max Power: ${vehicle.nominaal_continu_maximumvermogen} kW`] : []),
  ];

  const masses = [
    `Empty Weight (Massa ledig): ${vehicle.massa_ledig_voertuig ? `${vehicle.massa_ledig_voertuig} kg` : "Unknown"}`,
    `Curb Weight (Massa rijklaar): ${vehicle.massa_rijklaar ? `${vehicle.massa_rijklaar} kg` : "Unknown"}`,
    `Maximum Vehicle Mass: ${vehicle.toegestane_maximum_massa_voertuig || vehicle.maximum_massa_voertuig ? `${vehicle.toegestane_maximum_massa_voertuig || vehicle.maximum_massa_voertuig} kg` : "Unknown"}`,
    `Technical Max Mass: ${vehicle.technische_max_massa_voertuig ? `${vehicle.technische_max_massa_voertuig} kg` : "Unknown"}`,
    `Max Towing Unbraked (Ongeremd): ${vehicle.maximum_massa_trekken_ongeremd ? `${vehicle.maximum_massa_trekken_ongeremd} kg` : "Unknown"}`,
    `Max Towing Braked (Geremd): ${vehicle.maximum_trekken_massa_geremd || vehicle.maximum_massa_trekken_geremd ? `${vehicle.maximum_trekken_massa_geremd || vehicle.maximum_massa_trekken_geremd} kg` : "Unknown"}`,
    ...(vehicle.maximum_massa_samenstelling ? [`Max Combination Mass: ${vehicle.maximum_massa_samenstelling} kg`] : []),
    ...(vehicle.massa_alt_aandr ? [`Alternative Drive Mass: ${vehicle.massa_alt_aandr} kg`] : []),
  ];

  const registration = [
    `First Registration: ${vehicle.datum_eerste_toelating || "Unknown"}`,
    `First NL Registration: ${vehicle.datum_eerste_tenaamstelling_in_nederland || "Unknown"}`,
    ...(vehicle.datum_tenaamstelling ? [`Current Registration: ${vehicle.datum_tenaamstelling}`] : []),
    `Type Approval: ${vehicle.typegoedkeuringsnummer || vehicle.type_goedkeuring_nummer || "Unknown"}`,
    `Vehicle Type Code: ${vehicle.type || "Unknown"}`,
  ];

  const inspection = [
    `APK Expiry: ${vehicle.vervaldatum_apk || "Unknown"}`,
    ...(vehicle.vervaldatum_tachograaf ? [`Tachograph Expiry: ${vehicle.vervaldatum_tachograaf}`] : []),
  ];

  const financial = [
    ...(vehicle.catalogusprijs ? [`Catalog Price: €${vehicle.catalogusprijs}`] : []),
    ...(vehicle.bruto_bpm ? [`Gross BPM: €${vehicle.bruto_bpm}`] : []),
  ];

  const indicators = [
    ...(vehicle.zuinigheidslabel ? [`Fuel Efficiency Label: ${vehicle.zuinigheidslabel}`] : []),
    ...(vehicle.exportindicator ? [`Export Status: ${vehicle.exportindicator}`] : []),
    ...(vehicle.taxi_indicator ? [`Taxi: ${vehicle.taxi_indicator}`] : []),
    ...(vehicle.wam_verzekerd ? [`WAM Insured: ${vehicle.wam_verzekerd}`] : []),
    ...(vehicle.openstaande_terugroepactie_indicator ? [`Open Recall: ${vehicle.openstaande_terugroepactie_indicator}`] : []),
  ];

  // Format fuel and emissions data if available
  const fuelEmissions: string[] = [];
  if (fuelData && fuelData.length > 0) {
    fuelData.forEach((fuel, index) => {
      const fuelInfo = [
        `Fuel Type ${index + 1}: ${fuel.brandstof_omschrijving || "Unknown"}`,
        `Emission Code: ${fuel.emissiecode_omschrijving || "Unknown"}`,
        `Emission Level: ${fuel.uitlaatemissieniveau || "Unknown"}`,
        `CO2 Emission Class: ${fuel.co2_emissieklasse || "Unknown"}`,
        `Max Power: ${fuel.nettomaximumvermogen || "Unknown"} kW`,
        `Sound Level (Driving): ${fuel.geluidsniveau_rijdend || "Unknown"} dB`,
        `Sound Level (Idle): ${fuel.geluidsniveau_stationair || "Unknown"} dB`,
        `Soot Emission: ${fuel.roetuitstoot || "Unknown"}`,
      ];
      fuelEmissions.push(fuelInfo.join("\n"));
    });
  }

  const sections = [
    `BASIC INFORMATION:\n${basicInfo.join("\n")}`,
    `APPEARANCE:\n${appearance.join("\n")}`,
    `CAPACITY:\n${capacity.join("\n")}`,
    `TECHNICAL SPECIFICATIONS:\n${technical.join("\n")}`,
    `WEIGHTS & TOWING CAPACITY:\n${masses.join("\n")}`,
    `REGISTRATION:\n${registration.join("\n")}`,
    `INSPECTION:\n${inspection.join("\n")}`,
    ...(financial.length > 0 ? [`FINANCIAL:\n${financial.join("\n")}`] : []),
    ...(indicators.length > 0 ? [`STATUS INDICATORS:\n${indicators.join("\n")}`] : []),
    ...(fuelEmissions.length > 0 ? [`FUEL & EMISSIONS:\n${fuelEmissions.join("\n---\n")}`] : []),
    `Last Odometer Reading: ${vehicle.jaar_laatste_registratie_tellerstand || "Unknown"}`,
  ];
  
  return sections.join("\n\n");
}

/**
 * Register RDW tool
 */

// License plate lookup with complete vehicle and fuel/emissions data
server.tool(
  "rdw-license-plate-lookup",
  "Look up comprehensive Dutch vehicle information including fuel and emissions data by license plate",
  {
    kenteken: z.string().min(1).describe("Dutch license plate (kenteken) to look up"),
  },
  async ({ kenteken }) => {
    // Clean up the license plate (remove spaces and hyphens, convert to uppercase)
    const cleanKenteken = kenteken.replace(/[\s-]+/g, "").toUpperCase();
    
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
      
      // Get fuel/emissions data
      const fuelData = await makeRDWRequest<VehicleFuelInfo[]>("8ys7-d773", {
        kenteken: cleanKenteken,
      });
      
      // If fuel data is available, use the power from there for consistency
      if (fuelData && fuelData.length > 0 && fuelData[0].nettomaximumvermogen) {
        vehicle.nettomaximumvermogen = fuelData[0].nettomaximumvermogen;
      }
      
      const formattedInfo = formatVehicleInfo(vehicle, fuelData || undefined);

      return {
        content: [
          {
            type: "text",
            text: `Complete Vehicle Information for ${cleanKenteken}:\n\n${formattedInfo}`,
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
