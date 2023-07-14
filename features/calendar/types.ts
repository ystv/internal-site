export const EventTypes = ["show", "meeting", "social", "other"] as const;
export type EventType = (typeof EventTypes)[number];
