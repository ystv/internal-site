"use client";

import {
  Stack,
  InputWrapper,
  SegmentedControl,
  Group,
  Divider,
  InputLabel,
  Center,
  VisuallyHidden,
} from "@mantine/core";
import {
  ReactNode,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { changePreference } from "./actions";
import { notifications } from "@mantine/notifications";
import { useWebsocket } from "@/components/WebsocketProvider";
import { useMantineColorScheme } from "@mantine/core";
import { LuLaptop, LuMoon, LuSun } from "react-icons/lu";

type ReqPrefs = Required<PrismaJson.UserPreferences>;

interface PrefWrapperPassthroughProps<K extends keyof ReqPrefs> {
  prefs: ReqPrefs;
  field: K;
  userID: number;
}

/**
 * Represents a higher-order component that wraps a preference field and provides
 * optimistic updates while asynchronously saving user preferences.
 *
 * This shouldn't be rendered directly. Instead it should be wrapped in a component that
 * passes a renderField to render the actual field. This component should pass through
 * all the props in PrefWrapperPassthroughProps.
 *
 * @template K - The key of the preference field to be wrapped.
 * @param {Function} props.renderField - A function that renders the field and manages its changes.
 */
function PrefWrapper<K extends keyof ReqPrefs>(
  props: PrefWrapperPassthroughProps<K> & {
    renderField: (_: {
      value: ReqPrefs[K];
      disabled: boolean;
      onChange: (nv: ReqPrefs[K]) => unknown;
    }) => ReactNode;
  },
) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic<ReqPrefs[K], ReqPrefs[K]>(
    props.prefs[props.field],
    (_, nv: ReqPrefs[K]) => nv,
  );
  return props.renderField({
    value: optimistic,
    disabled: isPending,
    onChange: (nv) => {
      setOptimistic(nv);
      startTransition(async () => {
        await changePreference(props.userID, props.field, nv);
        notifications.show({
          message: "Preferences saved!",
        });
      });
    },
  });
}

function SegmentedPreference<K extends "timeFormat" | "icalFilter">(
  props: PrefWrapperPassthroughProps<K> & {
    label: string;
    values: ReqPrefs[K][] | Array<{ value: ReqPrefs[K]; label: string }>;
  },
) {
  const { values, label, ...rest } = props;
  return (
    <PrefWrapper
      {...rest}
      renderField={({ value, onChange, disabled }) => (
        <InputWrapper>
          <Group>
            <InputLabel>{label}</InputLabel>
            <SegmentedControl
              value={value}
              onChange={onChange}
              data={props.values}
              disabled={disabled}
              className="ml-auto"
            />
          </Group>
        </InputWrapper>
      )}
    />
  );
}

export function UserPreferences(props: { value: ReqPrefs; userID: number }) {
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  return (
    <Stack>
      <InputWrapper>
        <Group>
          <InputLabel>Color Scheme</InputLabel>
          <SegmentedControl
            value={colorScheme}
            onChange={setColorScheme}
            className="ml-auto min-w-[10rem]"
            data={[
              {
                value: "light",
                label: (
                  <Center>
                    <LuSun className="scale-150" aria-label="light mode" />
                    <VisuallyHidden>Light Mode</VisuallyHidden>
                  </Center>
                ),
              },
              {
                value: "auto",
                label: (
                  <Center>
                    <LuLaptop className="scale-150" aria-label="auto mode" />
                    <VisuallyHidden>Auto Mode</VisuallyHidden>
                  </Center>
                ),
              },
              {
                value: "dark",
                label: (
                  <Center>
                    <LuMoon className="scale-150" aria-label="dark mode" />
                    <VisuallyHidden>Dark Mode</VisuallyHidden>
                  </Center>
                ),
              },
            ]}
          />
        </Group>
      </InputWrapper>
      <Divider className="border-[--mantine-color-dark-4]" />
      <SegmentedPreference
        label="Time Format"
        field="timeFormat"
        values={["12hr", "24hr"]}
        prefs={props.value}
        userID={props.userID}
      />
      <Divider className="border-[--mantine-color-dark-4]" />
      <SegmentedPreference
        label="Which events to display in external calendar feed?"
        field="icalFilter"
        values={[
          { label: "Only Mine", value: "only-mine" },
          { label: "All Events", value: "all" },
        ]}
        prefs={props.value}
        userID={props.userID}
      />
    </Stack>
  );
}
