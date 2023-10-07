import { listVacantCrewRoles } from "@/features/calendar/events";
import { getAllNonCustomCrewPositions } from "@/features/calendar";
import { DiscoverView } from "@/app/(authenticated)/calendar/discover/DiscoverView";

export default async function CalendarDiscoverPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const role = searchParams.role ? parseInt(searchParams.role, 10) : undefined;
  const vacantRoles = await listVacantCrewRoles(role);
  const crewPositions = await getAllCrewPositions();
  const crewPositions = await getAllNonCustomCrewPositions();
  return (
    <DiscoverView vacantRoles={vacantRoles} crewPositions={crewPositions} />
  );
}
