export const EventTypes = [
  "show",
  "meeting",
  "workshop",
  "social",
  "public",
  "other",
] as const;
export type EventType = (typeof EventTypes)[number];

export function hasRSVP(type: EventType): boolean {
  return type !== "show";
}

enum Colours {
  Blue = "#0074E0",
  Green = "#218721",
  Orange = "#DB6F0A",
  Pink = "#D82C7F",
  Purple = "#800080",
}

export const EventColours: Record<EventType, string> = {
  show: Colours.Blue, // Blue
  meeting: Colours.Green,
  workshop: Colours.Orange,
  social: Colours.Purple,
  public: Colours.Blue,
  other: Colours.Pink,
};
