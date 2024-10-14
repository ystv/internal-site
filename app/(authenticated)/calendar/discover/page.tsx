import { DiscoverView } from "@/app/(authenticated)/calendar/discover/DiscoverView";
import { PageInfo } from "@/components/helpers/PageInfo";
import {
  getAllCrewPositions,
  type CrewPositionType,
} from "@/features/calendar";
import { listVacantEvents } from "@/features/calendar/events";

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

  // We want to only enable roles that are available in our selector
  const availableRoles = new Set<number>();

  // create a memory efficient list of available roles
  for (const event of vacantRoles) {
    for (const signupSheet of event.signup_sheets) {
      for (const crew of signupSheet.crews) {
        availableRoles.add(crew.position_id);
      }
    }
  }

  // check if each role is available
  for (const crewPosition of crewPositions) {
    crewPosition.available = availableRoles.has(crewPosition.position_id);
  }

  // send unavailable roles to the bottom of the selector list
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
    <>
      <PageInfo title="Discover Roles" />
      <DiscoverView
        vacantRoles={vacantRoles}
        crewPositions={crewPositions}
        position={position}
      />
    </>
  );
}

export interface CrewPositionsTypeWithAvailability extends CrewPositionType {
  available?: boolean;
}
