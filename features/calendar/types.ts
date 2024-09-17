export const EventTypes = [
  "show",
  "meeting",
  "social",
  "public",
  "other",
] as const;
export type EventType = (typeof EventTypes)[number];

export function hasRSVP(type: EventType): boolean {
  return type !== "show";
}
