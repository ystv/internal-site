export const AttendStatuses = [
  "attending",
  "not_attending",
  "maybe_attending",
  "invited",
  "unknown",
] as const;

export const AttendStatusLabels: {
  [K in (typeof AttendStatuses)[number]]: string;
} = {
  attending: "Attending",
  not_attending: "Not Attending",
  maybe_attending: "Maybe Attending",
  invited: "Invited",
  unknown: "No Response",
};
