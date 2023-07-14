export const AttendStatuses = [
  "attending",
  "not_attending",
  "maybe_attending",
  "invited",
  "unknown",
] as const;
export type AttendStatus = (typeof AttendStatuses)[number];

export const AttendStatusLabels: {
  [K in AttendStatus]: string;
} = {
  attending: "Attending",
  not_attending: "Not Attending",
  maybe_attending: "Maybe Attending",
  invited: "Invited",
  unknown: "No Response",
};
