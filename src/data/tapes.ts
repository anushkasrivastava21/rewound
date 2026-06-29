export interface TapeTooltip {
  title: string;
  plays: string;
  creator: string;
  tags: string[];
}

export type MemoryType = "steamy-window" | "shadow-puppets" | "bubble-wrap" | "cloud-watching" | "dandelion" | "paper-boats" | "etch-a-sketch";

export interface TapeData {
  id: string;
  label: string;
  color: string;
  format: string;
  region: string;
  era: string;
  memoryType: MemoryType;
  tooltip?: TapeTooltip;
}

export const TAPES: TapeData[] = [
  {
    id: "steamy-window",
    label: "Steamy Window",
    color: "#1a1a1a",
    format: "V-120",
    region: "Tokyo",
    era: "90s",
    memoryType: "steamy-window",
    tooltip: { title: "Steamy Window", plays: "1,402", creator: "@sato_vhs", tags: ["#NEON", "#RAIN"] },
  },
  {
    id: "bubble-wrap",
    label: "Bubble Wrap",
    color: "#1a1a1a",
    format: "V-120",
    region: "Paris",
    era: "90s",
    memoryType: "bubble-wrap",
    tooltip: { title: "Bubble Wrap", plays: "1,671", creator: "@paris_analog", tags: ["#URBAN", "#METRO"] },
  },
  {
    id: "cloud-watching",
    label: "Cloud Watching",
    color: "#1a1a1a",
    format: "V-120",
    region: "L.A.",
    era: "80s",
    memoryType: "cloud-watching",
    tooltip: { title: "Cloud Watching", plays: "203", creator: "@home_vids", tags: ["#FAMILY"] },
  },
  {
    id: "dandelion",
    label: "Dandelion",
    color: "#2d3a2d",
    format: "E-240",
    region: "L.A.",
    era: "00s",
    memoryType: "dandelion",
    tooltip: { title: "Dandelion", plays: "347", creator: "@trail_cam", tags: ["#NATURE"] },
  },
  {
    id: "paper-boats",
    label: "Paper Boats",
    color: "#0c1a26",
    format: "E-180",
    region: "L.A.",
    era: "90s",
    memoryType: "paper-boats",
    tooltip: { title: "Paper Boats", plays: "894", creator: "@analog_amy", tags: ["#NOSTALGIA"] },
  },
  {
    id: "shadow-puppets",
    label: "Shadow Puppets",
    color: "#3a2d1a",
    format: "V-120",
    region: "Tokyo",
    era: "90s",
    memoryType: "shadow-puppets",
    tooltip: { title: "Shadow Puppets", plays: "2,108", creator: "@puppet_master", tags: ["#SHADOW", "#PLAY"] },
  },
  {
    id: "etch-a-sketch",
    label: "Etch-A-Sketch",
    color: "#401212",
    format: "T-60",
    region: "L.A.",
    era: "90s",
    memoryType: "etch-a-sketch",
    tooltip: { title: "Etch-A-Sketch", plays: "612", creator: "@retro_rick", tags: ["#MUSIC", "#GARAGE"] },
  }
];
