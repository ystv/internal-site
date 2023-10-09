import { listVacantEvents } from "@/features/calendar/events";
import { getAllNonCustomCrewPositions } from "@/features/calendar";
import { DiscoverView } from "@/app/(authenticated)/calendar/discover/DiscoverView";

export default async function CalendarDiscoverPage({
  searchParams,
}: {
  searchParams: { position?: string };
}) {
  const position = searchParams.position
    ? parseInt(searchParams.position, 10)
    : undefined;
  const vacantRoles = await listVacantEvents(position);
  const crewPositions = await getAllNonCustomCrewPositions();
  return (
    <DiscoverView
      vacantRoles={vacantRoles}
      crewPositions={crewPositions}
      position={position}
    />
  );
}
