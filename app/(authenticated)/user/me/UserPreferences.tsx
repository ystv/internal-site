"use client";

import {
  Divider,
  Group,
  InputLabel,
  InputWrapper,
  SegmentedControl,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { type ReactNode, useOptimistic, useTransition } from "react";

import { changePreference } from "./actions";

type ReqPrefs = Required<PrismaJson.UserPreferences>;

interface PrefWrapperPassthroughProps<K extends keyof ReqPrefs> {
  prefs: ReqPrefs;
  field: K;
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
      // onChange: (nv: ReqPrefs[K]) => unknown;
      onChange: (nv: string) => unknown;
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
    onChange: (str_nv) => {
      const nv = str_nv as unknown as ReqPrefs[K];
      startTransition(async () => {
        setOptimistic(nv);
        await changePreference(props.field, nv);
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

export function UserPreferences(props: { value: ReqPrefs }) {
  return (
    <Stack>
      <SegmentedPreference
        label="Time Format"
        field="timeFormat"
        values={["12hr", "24hr"]}
        prefs={props.value}
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
      />
    </Stack>
  );
}
