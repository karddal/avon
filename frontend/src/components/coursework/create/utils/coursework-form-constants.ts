export const DEFAULT_COLOUR = "#abcdef";

export const PRESET_COLOURS = [
  "#ff6467",
  "#e17100",
  "#05df72",
  "#51a2ff",
  "#c27aff",
  "#fb64b6",
] as const;

export const FORM_STEPS = ["details", "colour", "summary"] as const;
export type FormStep = (typeof FORM_STEPS)[number];
