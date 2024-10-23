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

export const EventColours: Record<EventType, string> = {
  show: "#1E90FF", // Blue
  meeting: "#32CD32", // Green
  workshop: "#FFA500", // Orange
  social: "#800080", // Purple
  public: "#1E90FF", // Blue
  other: "#FFC0CB", // Pink
};
