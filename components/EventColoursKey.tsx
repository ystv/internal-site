import { EventColours } from "@/features/calendar/types";

export default function EventColoursKey() {
  return (
    <div className="mt-2 flex flex-wrap items-start space-x-2">
      {Object.entries(EventColours).map(([type, colour]) => (
        <div key={type} className="flex items-center">
          <div
            className="bg-[${colour}] mr-2 h-5 w-5 rounded"
            style={{ backgroundColor: colour }}
          />
          <span className="capitalize">{type}</span>
        </div>
      ))}
    </div>
  );
}
