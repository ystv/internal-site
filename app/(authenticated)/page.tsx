import { getCurrentUser } from "@/lib/auth/server";
import { YouTubeEmbed } from "./youtubeEmbed";
import { Suspense } from "react";
import * as News from "@/features/news";
import * as YouTube from "@/features/youtube";
import * as Calendar from "@/features/calendar";
import { getUserName } from "@/components/UserHelpers";
import { DateTime } from "@/components/DateTimeHelpers";
import { Button, Paper, ScrollArea } from "@mantine/core";
import { isSameDay } from "date-fns";
import { TbArticle } from "react-icons/tb";
import { PermissionGate } from "@/components/UserContext";
import Link from "next/link";

async function YouTubeTile() {
  if (!YouTube.isEnabled()) {
    return null;
  }
  const video = await YouTube.getLatestUpload();
  if (!video) {
    return null;
  }
  return (
    <div>
      <h2>Latest Upload</h2>
      <div className="aspect-video w-full">
        <YouTubeEmbed
          id={video.id!.videoId!}
          title={video.snippet?.title ?? ""}
          poster="hqdefault"
        />
      </div>
    </div>
  );
}

async function NewsRow() {
  const newsItem = await News.getLatestNewsItem();
  if (!newsItem) {
    return null;
  }
  return (
    <div>
      <h2>Latest News</h2>
      <Paper shadow="md" withBorder className="p-2">
        <h3>{newsItem.title}</h3>
        {newsItem.content.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
        <small>
          Posted by {getUserName(newsItem.author)},{" "}
          <DateTime val={newsItem.time.toISOString()} format="datetime" />
        </small>
      </Paper>
    </div>
  );
}

async function ProductionsNeedingCrew() {
  const prods = await Calendar.listVacantEvents({});
  if (!prods.events.length) {
    return null;
  }
  return (
    <div>
      <h2>{prods.events.length} productions need crew</h2>
      <ScrollArea h={300}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {prods.events.map((event) => (
            <Paper
              key={event.event_id}
              shadow="sm"
              radius="md"
              withBorder
              className="flex flex-col p-4"
            >
              <h3 className="m-0">{event.name}</h3>
              <p className="m-0 mb-2 text-sm">
                <strong>
                  <DateTime
                    val={event.start_date.toISOString()}
                    format="datetime"
                  />
                  {" - "}
                  {isSameDay(event.start_date, event.end_date) ? (
                    <DateTime
                      val={event.end_date.toISOString()}
                      format="time"
                    />
                  ) : (
                    <DateTime
                      val={event.end_date.toISOString()}
                      format="datetime"
                    />
                  )}
                </strong>
              </p>
              {event.signup_sheets
                .filter((sheet) => sheet.crews.length > 0)
                .map((sheet) => (
                  <div key={sheet.signup_id}>
                    <h3 className="m-0 text-lg">{sheet.title}</h3>
                    <p className="m-0 text-xs">
                      <DateTime
                        val={sheet.arrival_time.toISOString()}
                        format="datetime"
                      />{" "}
                      -{" "}
                      {isSameDay(sheet.arrival_time, sheet.end_time) ? (
                        <DateTime
                          val={sheet.end_time.toISOString()}
                          format="time"
                        />
                      ) : (
                        <DateTime
                          val={sheet.end_time.toISOString()}
                          format="datetime"
                        />
                      )}
                    </p>
                    {sheet.crews.map((crew) => (
                      <div key={crew.crew_id}>
                        <li className="ml-6 text-base">
                          {crew.positions.name}
                        </li>
                      </div>
                    ))}
                  </div>
                ))}
              <div className="mt-auto flex grow items-end justify-end">
                <Button
                  component={Link}
                  href={`/calendar/${event.event_id}`}
                  leftSection={<TbArticle />}
                >
                  Event Details
                </Button>
              </div>
            </Paper>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default async function HomePage() {
  const me = await getCurrentUser();
  return (
    <div>
      <h1>Welcome back, {me.first_name}!</h1>
      <div className="mt-2 space-x-2">
        <Button component={Link} href="/calendar" size="md">
          Calendar
        </Button>
        {/* TODO not implemented yet */}
        {/* <PermissionGate required="News.Admin">
          <Button component={Link} href="/news" size="md">
            News
          </Button>
        </PermissionGate> */}
        <PermissionGate required="ManageQuotes">
          <Button component={Link} href="/quotes" size="md">
            Quotes
          </Button>
        </PermissionGate>
      </div>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <NewsRow />
        </Suspense>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<div>Loading...</div>}>
          <ProductionsNeedingCrew />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <YouTubeTile />
        </Suspense>
      </div>
    </div>
  );
}
