"use client";

import { Stack, InputWrapper, SegmentedControl } from "@mantine/core";
import {
  experimental_useOptimistic as useOptimistic,
  useTransition,
} from "react";
import { changePreference } from "./actions";
import { notifications } from "@mantine/notifications";

type ReqPrefs = Required<PrismaJson.UserPreferences>;

function SelectPreference<K extends keyof ReqPrefs>(props: {
  prefs: ReqPrefs;
  userID: number;
  field: K;
  values: ReqPrefs[K][] | Array<{ value: ReqPrefs[K]; label: string }>;
  format: "segmented";
}) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    props.prefs[props.field],
    (_, nv: ReqPrefs[K]) => nv,
  );
  return (
    <InputWrapper label="Time Format">
      <SegmentedControl
        value={optimistic}
        onChange={(v) => {
          setOptimistic(v as "12hr" | "24hr");
          startTransition(async () => {
            await changePreference(props.userID, props.field, v as ReqPrefs[K]);
            notifications.show({
              message: "Preferences saved!",
            });
          });
        }}
        data={props.values}
        disabled={isPending}
      />
    </InputWrapper>
  );
}

export function UserPreferences(props: { value: ReqPrefs; userID: number }) {
  return (
    <Stack>
      <SelectPreference
        field="timeFormat"
        values={["12hr", "24hr"]}
        prefs={props.value}
        userID={props.userID}
        format="segmented"
      />
    </Stack>
  );
}
