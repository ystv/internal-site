import { listVacantEvents } from "@/features/calendar/events";
import { CrewPositionType, getAllCrewPositions } from "@/features/calendar";
import { DiscoverView } from "@/app/(authenticated)/calendar/discover/DiscoverView";

export default async function CalendarDiscoverPage({
  searchParams,
}: {
  searchParams: { position?: string };
}) {
  const position = searchParams.position
    ? parseInt(searchParams.position, 10)
    : undefined;
  const vacantRoles = (await listVacantEvents({})).events;
  const crewPositions = (await getAllCrewPositions(
    false,
  )) as CrewPositionsTypeWithAvailability[];

  const availableRoles = new Set<number>();

  for (const event of vacantRoles) {
    for (const signupSheet of event.signup_sheets) {
      for (const crew of signupSheet.crews) {
        availableRoles.add(crew.position_id);
      }
    }
  }

  for (const crewPosition of crewPositions) {
    crewPosition.available = availableRoles.has(crewPosition.position_id);
  }

  crewPositions.sort((a, b) => {
    if (a.available && !b.available) {
      return -1;
    } else if (!a.available && b.available) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <DiscoverView
      vacantRoles={vacantRoles}
      crewPositions={crewPositions}
      position={position}
    />
  );
}

export interface CrewPositionsTypeWithAvailability extends CrewPositionType {
  available?: boolean;
}
