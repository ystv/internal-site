import { getCurrentUser } from "@/lib/auth/server";
import { YouTubeEmbed } from "./youtubeEmbed";
import { Suspense } from "react";
import * as News from "@/features/news";
import * as YouTube from "@/features/youtube";
import * as Calendar from "@/features/calendar";
import { getUserName } from "@/components/UserHelpers";
import { DateTime } from "@/components/DateTimeHelpers";
import { Button, Paper, ScrollArea, Title, Text } from "@mantine/core";
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
      <Title order={2}>Latest Upload</Title>
      <div className="my-10 aspect-video w-full">
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
    <Paper shadow="md" withBorder className="p-3">
      <Title order={3}>{newsItem.title}</Title>
      {newsItem.content.split("\n").map((line, idx) => (
        <Text key={idx}>{line}</Text>
      ))}
      <small>
        Posted by {getUserName(newsItem.author)},{" "}
        <DateTime val={newsItem.time.toISOString()} format="datetime" />
      </small>
    </Paper>
  );
}

async function ProductionsNeedingCrew() {
  const prods = await Calendar.listVacantEvents({});
  if (!prods.events.length) {
    return null;
  }
  return (
    <div>
      <Title order={2}>{prods.events.length} productions need crew</Title>
      <ScrollArea h={500} className="mt-10">
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
      <Title order={1} className="my-10">
        Welcome back, {me.first_name}!
      </Title>
      <div className="my-5">
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
