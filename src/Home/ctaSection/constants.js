import { PROGRAM_IMAGES } from "../../config"; // adjust if your config lives elsewhere

export const BRANDS = [
  { tag: "Blossom", name: "Prenatal Care", image: PROGRAM_IMAGES[0] },
  { tag: "Queen", name: "Postnatal Care", image: PROGRAM_IMAGES[1] },
  { tag: "Pro", name: "No Health Conditions", image: PROGRAM_IMAGES[4] },
  { tag: "Elite", name: "With Health Conditions", image: PROGRAM_IMAGES[2] },
  { tag: "Tone Up", name: "Body Toning Program", image: PROGRAM_IMAGES[3] },
];

export const STATS = [
  { prefix: "", value: 1, suffix: "lakh+", label: "Lives Transformed" },
  { prefix: "", value: 98, suffix: "%", label: "Success Rate" },
  { prefix: "", value: 70, suffix: "+", label: "Countries Served" },
  { prefix: "", value: 40, suffix: "K+", label: "Members Community" },
  { prefix: "", value: 400, suffix: "+", label: "Team Members" },
];

// Helix geometry
export const CARD_COUNT = 15; // cards on the helix (cycles through BRANDS)
export const R = 290; // radius of the cylinder
export const PITCH = 110; // vertical px travelled per radian
export const GAP_PX = 55 + 10; // original vertical spacing (55px) + 10px
export const STEP = GAP_PX / PITCH; // angle between neighbouring cards (rad)
export const CARD_W = 155;
export const CARD_H = 265;