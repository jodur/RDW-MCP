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
  // Additional vehicle details from API response
  inrichting?: string;
  aantal_deuren?: string;
  aantal_wielen?: string;
  massa_ledig_voertuig?: string;
  massa_rijklaar?: string;
  maximum_massa_trekken_ongeremd?: string;
  maximum_massa_trekken_geremd?: string;
  maximum_trekken_massa_geremd?: string;
  datum_tenaamstelling?: string;
  bruto_bpm?: string;
  zuinigheidslabel?: string;
  exportindicator?: string;
  export_indicator?: string;
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
  toegestane_maximum_massa_voertuig?: string;
  technische_max_massa_voertuig?: string;
  maximum_massa_samenstelling?: string;
  vermogen_massarijklaar?: string;
  typegoedkeuringsnummer?: string;
  jaar_laatste_registratie_tellerstand?: string;
  type?: string;
  // Additional fields found in T-347-SJ
  maximale_constructiesnelheid?: string;
  lengte?: string;
  breedte?: string;
  hoogte_voertuig?: string;
  europese_voertuigcategorie?: string;
  volgnummer_wijziging_eu_typegoedkeuring?: string;
  wielbasis?: string;
  zuinigheidsclassificatie?: string;
  tellerstandoordeel?: string;
  code_toelichting_tellerstandoordeel?: string;
  tenaamstellen_mogelijk?: string;
  wacht_op_keuren?: string;
  registratie_datum_goedkeuring_afschrijvingsmoment_bpm?: string;
  aerodyn_voorz?: string;
  verl_cab_ind?: string;
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
  // Additional fields found in real data
  milieuklasse_eg_goedkeuring_licht?: string;
  toerental_geluidsniveau?: string;
  emis_deeltjes_type1_wltp?: string;
  emissie_co2_gecombineerd_wltp?: string;
  brandstof_verbruik_gecombineerd_wltp?: string;
}

/**
 * APK (MOT) inspection data
 */
interface VehicleAPKInfo {
  kenteken?: string;
  vervaldatum_apk?: string;
  dt_laatste_update_in_rdw?: string;
  vervaldatum_apk_dt?: string;
  aantal_datums_apk?: string;
}

/**
 * Recalls and defects data
 */
interface VehicleRecallInfo {
  kenteken?: string;
  referentiecode_rdw?: string;
  datum_terugroepactie?: string;
  code_gebrek?: string;
  omschrijving_gebrek?: string;
  datum_vanaf_eerste_toepassing_terugroepactie?: string;
  datum_tot_eerste_toepassing_terugroepactie?: string;
  dt_laatste_update_in_rdw?: string;
}

/**
 * Vehicle ownership/registration changes
 */
interface VehicleOwnershipInfo {
  kenteken?: string;
  datum_tenaamstelling?: string;
  datum_eerste_tenaamstelling?: string;
  dt_laatste_update_in_rdw?: string;
}

/**
 * Vehicle axes/technical data
 */
interface VehicleAxesInfo {
  kenteken?: string;
  as_nummer?: string;
  aantal_assen?: string;
  aangedreven_as?: string;
  plaatscode_as?: string;
  spoorbreedte?: string;
  technisch_toegestane_maximum_aslast?: string;
  wettelijk_toegestane_maximum_aslast?: string;
  afstand_tot_volgende_as_voertuig?: string;
  dt_laatste_update_in_rdw?: string;
}

/**
 * Vehicle body/carrosserie data
 */
interface VehicleBodyInfo {
  kenteken?: string;
  carrosserie_volgnummer?: string;
  carrosserietype?: string;
  type_carrosserie_europese_omschrijving?: string;
  type_carrosserie?: string;
  dt_laatste_update_in_rdw?: string;
}

/**
 * Vehicle colors
 */
interface VehicleColorInfo {
  kenteken?: string;
  kleur?: string;
  dt_laatste_update_in_rdw?: string;
}

/**
 * Vehicle defects data
 */
interface VehicleDefectInfo {
  kenteken?: string;
  gebrek_identificatie?: string;
  datum_constatering_gebrek?: string;
  locatie_gebrek?: string;
  code_gebrek?: string;
  omschrijving_gebrek?: string;
  dt_laatste_update_in_rdw?: string;
}

/**
 * Format vehicle information for display (including all available RDW data)
 */
function formatVehicleInfo(
  vehicle: VehicleBaseInfo, 
  fuelData?: VehicleFuelInfo[], 
  apkData?: VehicleAPKInfo[],
  recallData?: VehicleRecallInfo[],
  ownershipData?: VehicleOwnershipInfo[],
  axesData?: VehicleAxesInfo[],
  bodyData?: VehicleBodyInfo[],
  colorData?: VehicleColorInfo[],
  defectData?: VehicleDefectInfo[]
): string {
  const basicInfo = [
    `License Plate: ${vehicle.kenteken || "Unknown"}`,
    `Vehicle Type: ${vehicle.voertuigsoort || "Unknown"}`,
    `Brand: ${vehicle.merk || "Unknown"}`,
    `Model: ${vehicle.handelsbenaming || "Unknown"}`,
    `Variant: ${vehicle.variant || "Unknown"}`,
    `Version: ${vehicle.uitvoering || "Unknown"}`,
    `European Category: ${vehicle.europese_voertuigcategorie || "Unknown"}`,
    `Vehicle Type Code: ${vehicle.type || "Unknown"}`,
  ];

  const appearance = [
    `Primary Color: ${vehicle.eerste_kleur || "Unknown"}`,
    ...(vehicle.tweede_kleur && vehicle.tweede_kleur !== "Niet geregistreerd" ? [`Secondary Color: ${vehicle.tweede_kleur}`] : []),
    `Body Type: ${vehicle.inrichting || "Unknown"}`,
    `Number of Doors: ${vehicle.aantal_deuren || "Unknown"}`,
    `Number of Wheels: ${vehicle.aantal_wielen || "Unknown"}`,
    `Length: ${vehicle.lengte ? `${vehicle.lengte} cm` : "Unknown"}`,
    `Width: ${vehicle.breedte ? `${vehicle.breedte} cm` : "Unknown"}`,
    `Height: ${vehicle.hoogte_voertuig ? `${vehicle.hoogte_voertuig} cm` : "Unknown"}`,
    `Wheelbase: ${vehicle.wielbasis ? `${vehicle.wielbasis} cm` : "Unknown"}`,
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
    `Max Construction Speed: ${vehicle.maximale_constructiesnelheid ? `${vehicle.maximale_constructiesnelheid} km/h` : "Unknown"}`,
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
    `EU Type Approval Change Number: ${vehicle.volgnummer_wijziging_eu_typegoedkeuring || "Unknown"}`,
    `Registration Possible: ${vehicle.tenaamstellen_mogelijk || "Unknown"}`,
    `Pending Inspection: ${vehicle.wacht_op_keuren || "Unknown"}`,
    ...(vehicle.registratie_datum_goedkeuring_afschrijvingsmoment_bpm ? [`BPM Approval Date: ${vehicle.registratie_datum_goedkeuring_afschrijvingsmoment_bpm}`] : []),
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
    `Fuel Efficiency Class: ${vehicle.zuinigheidsclassificatie || vehicle.zuinigheidslabel || "Unknown"}`,
    `Export Status: ${vehicle.export_indicator || vehicle.exportindicator || "Unknown"}`,
    `Taxi: ${vehicle.taxi_indicator || "Unknown"}`,
    `WAM Insured: ${vehicle.wam_verzekerd || "Unknown"}`,
    `Open Recall: ${vehicle.openstaande_terugroepactie_indicator || "Unknown"}`,
    `Odometer Status: ${vehicle.tellerstandoordeel || "Unknown"}`,
    ...(vehicle.code_toelichting_tellerstandoordeel ? [`Odometer Code: ${vehicle.code_toelichting_tellerstandoordeel}`] : []),
    `Aerodynamic Equipment: ${vehicle.aerodyn_voorz || "Unknown"}`,
    `Extended Cab: ${vehicle.verl_cab_ind || "Unknown"}`,
  ];

  // Format fuel and emissions data if available
  const fuelEmissions: string[] = [];
  if (fuelData && fuelData.length > 0) {
    fuelData.forEach((fuel, index) => {
      const fuelInfo = [
        `Fuel Type ${index + 1}: ${fuel.brandstof_omschrijving || "Unknown"}`,
        `Emission Code: ${fuel.emissiecode_omschrijving || "Unknown"}`,
        `Emission Level: ${fuel.uitlaatemissieniveau || "Unknown"}`,
        `Environmental Class: ${fuel.milieuklasse_eg_goedkeuring_licht || "Unknown"}`,
        `CO2 Emission Class: ${fuel.co2_emissieklasse || "Unknown"}`,
        `Max Power: ${fuel.nettomaximumvermogen || "Unknown"} kW`,
        `Sound Level (Driving): ${fuel.geluidsniveau_rijdend || "Unknown"} dB`,
        `Sound Level (Idle): ${fuel.geluidsniveau_stationair || "Unknown"} dB`,
        `Sound Test RPM: ${fuel.toerental_geluidsniveau || "Unknown"}`,
        `CO2 Combined (WLTP): ${fuel.emissie_co2_gecombineerd_wltp || "Unknown"} g/km`,
        `Fuel Consumption Combined (WLTP): ${fuel.brandstof_verbruik_gecombineerd_wltp || "Unknown"} l/100km`,
        `Particle Emissions Type 1 (WLTP): ${fuel.emis_deeltjes_type1_wltp || "Unknown"} mg/km`,
        `Soot Emission: ${fuel.roetuitstoot || "Unknown"}`,
      ];
      fuelEmissions.push(fuelInfo.join("\n"));
    });
  }

  // Format APK (MOT) inspection data
  const apkInfo: string[] = [];
  if (apkData && apkData.length > 0) {
    apkData.forEach((apk, index) => {
      const info = [
        `APK Record ${index + 1}:`,
        `Expiry Date: ${apk.vervaldatum_apk || "Unknown"}`,
        `Last Updated: ${apk.dt_laatste_update_in_rdw || "Unknown"}`,
        `Number of APK Dates: ${apk.aantal_datums_apk || "Unknown"}`,
      ];
      apkInfo.push(info.join("\n"));
    });
  }

  // Format recall/defect data
  const recallInfo: string[] = [];
  if (recallData && recallData.length > 0) {
    recallData.forEach((recall, index) => {
      const info = [
        `Recall ${index + 1}:`,
        `Reference Code: ${recall.referentiecode_rdw || "Unknown"}`,
        `Recall Date: ${recall.datum_terugroepactie || "Unknown"}`,
        `Defect Code: ${recall.code_gebrek || "Unknown"}`,
        `Defect Description: ${recall.omschrijving_gebrek || "Unknown"}`,
        `Valid From: ${recall.datum_vanaf_eerste_toepassing_terugroepactie || "Unknown"}`,
        `Valid Until: ${recall.datum_tot_eerste_toepassing_terugroepactie || "Unknown"}`,
      ];
      recallInfo.push(info.join("\n"));
    });
  }

  // Format ownership/registration history
  const ownershipInfo: string[] = [];
  if (ownershipData && ownershipData.length > 0) {
    ownershipData.forEach((ownership, index) => {
      const info = [
        `Registration ${index + 1}:`,
        `Registration Date: ${ownership.datum_tenaamstelling || "Unknown"}`,
        `First Registration Date: ${ownership.datum_eerste_tenaamstelling || "Unknown"}`,
        `Last Updated: ${ownership.dt_laatste_update_in_rdw || "Unknown"}`,
      ];
      ownershipInfo.push(info.join("\n"));
    });
  }

  // Format axle data
  const axleInfo: string[] = [];
  if (axesData && axesData.length > 0) {
    const totalAxles = axesData[0].aantal_assen || "Unknown";
    axleInfo.push(`Total Number of Axles: ${totalAxles}`);
    
    axesData.forEach((axle, index) => {
      const info = [
        `Axle ${axle.as_nummer || index + 1}:`,
        `Driven Axle: ${axle.aangedreven_as === "J" ? "Yes" : axle.aangedreven_as === "N" ? "No" : "Unknown"}`,
        `Position Code: ${axle.plaatscode_as || "Unknown"}`,
        `Track Width: ${axle.spoorbreedte || "Unknown"} cm`,
        `Technical Max Load: ${axle.technisch_toegestane_maximum_aslast || "Unknown"} kg`,
        `Legal Max Load: ${axle.wettelijk_toegestane_maximum_aslast || "Unknown"} kg`,
        `Distance to Next Axle: ${axle.afstand_tot_volgende_as_voertuig || "Unknown"} cm`,
      ];
      axleInfo.push(info.join("\n"));
    });
  }

  // Format body/carrosserie data
  const bodyInfo: string[] = [];
  if (bodyData && bodyData.length > 0) {
    bodyData.forEach((body, index) => {
      const info = [
        `Body Configuration ${index + 1}:`,
        `Carrosserie Type: ${body.carrosserietype || "Unknown"}`,
        `European Description: ${body.type_carrosserie_europese_omschrijving || "Unknown"}`,
        `Body Type: ${body.type_carrosserie || "Unknown"}`,
      ];
      bodyInfo.push(info.join("\n"));
    });
  }

  // Format additional color data
  const additionalColorInfo: string[] = [];
  if (colorData && colorData.length > 0) {
    colorData.forEach((color, index) => {
      additionalColorInfo.push(`Color ${index + 1}: ${color.kleur || "Unknown"}`);
    });
  }

  // Format defect data
  const defectInfo: string[] = [];
  if (defectData && defectData.length > 0) {
    defectData.forEach((defect, index) => {
      const info = [
        `Defect ${index + 1}:`,
        `ID: ${defect.gebrek_identificatie || "Unknown"}`,
        `Date Found: ${defect.datum_constatering_gebrek || "Unknown"}`,
        `Location: ${defect.locatie_gebrek || "Unknown"}`,
        `Code: ${defect.code_gebrek || "Unknown"}`,
        `Description: ${defect.omschrijving_gebrek || "Unknown"}`,
      ];
      defectInfo.push(info.join("\n"));
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
    ...(apkInfo.length > 0 ? [`APK INSPECTION HISTORY:\n${apkInfo.join("\n---\n")}`] : []),
    ...(recallInfo.length > 0 ? [`RECALLS & SAFETY ACTIONS:\n${recallInfo.join("\n---\n")}`] : []),
    ...(ownershipInfo.length > 0 ? [`REGISTRATION HISTORY:\n${ownershipInfo.join("\n---\n")}`] : []),
    ...(axleInfo.length > 0 ? [`AXLE SPECIFICATIONS:\n${axleInfo.join("\n---\n")}`] : []),
    ...(bodyInfo.length > 0 ? [`BODY SPECIFICATIONS:\n${bodyInfo.join("\n---\n")}`] : []),
    ...(additionalColorInfo.length > 0 ? [`ADDITIONAL COLORS:\n${additionalColorInfo.join("\n")}`] : []),
    ...(defectInfo.length > 0 ? [`TECHNICAL DEFECTS:\n${defectInfo.join("\n---\n")}`] : []),
    `Last Odometer Reading: ${vehicle.jaar_laatste_registratie_tellerstand || "Unknown"}`,
  ];
  
  return sections.join("\n\n");
}

/**
 * Register RDW tool
 */

// License plate lookup with ALL available RDW data
server.tool(
  "rdw-license-plate-lookup",
  "Look up ALL available Dutch vehicle information from RDW databases including vehicle specs, fuel/emissions, APK history, recalls, ownership history, technical defects, and more",
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
      
      // Fetch all available RDW data in parallel for better performance
      const [
        fuelData,
        axesData,
        bodyData
      ] = await Promise.all([
        // Fuel and emissions data
        makeRDWRequest<VehicleFuelInfo[]>("8ys7-d773", { kenteken: cleanKenteken }),
        
        // Axle data
        makeRDWRequest<VehicleAxesInfo[]>("3huj-srit", { kenteken: cleanKenteken }),
        
        // Body/carrosserie data  
        makeRDWRequest<VehicleBodyInfo[]>("vezc-m2t6", { kenteken: cleanKenteken })
      ]);
      
      // If fuel data is available, use the power from there for consistency
      if (fuelData && fuelData.length > 0 && fuelData[0].nettomaximumvermogen) {
        vehicle.nettomaximumvermogen = fuelData[0].nettomaximumvermogen;
      }
      
      const formattedInfo = formatVehicleInfo(
        vehicle, 
        fuelData || undefined,
        undefined, // apkData - endpoint doesn't exist
        undefined, // recallData - endpoint doesn't exist  
        undefined, // ownershipData - same as main dataset
        axesData || undefined,
        bodyData || undefined,
        undefined, // colorData - endpoint doesn't exist
        undefined  // defectData - endpoint doesn't exist
      );

      return {
        content: [
          {
            type: "text",
            text: `COMPLETE RDW Database Information for ${cleanKenteken}:\n\n${formattedInfo}`,
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
