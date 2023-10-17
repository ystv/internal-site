"use client";

import {
  Stack,
  InputWrapper,
  SegmentedControl,
  Switch,
  RadioGroup,
  Group,
  Radio,
} from "@mantine/core";
import {
  ReactNode,
  experimental_useOptimistic as useOptimistic,
  useTransition,
} from "react";
import { changePreference } from "./actions";
import { notifications } from "@mantine/notifications";

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

function SegmentedPreference<K extends "timeFormat">(
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
        <InputWrapper label={label}>
          <SegmentedControl
            value={value}
            onChange={onChange}
            data={props.values}
            disabled={disabled}
          />
        </InputWrapper>
      )}
    />
  );
}

function RadioGroupPreference<K extends "icalFilter">(
  props: PrefWrapperPassthroughProps<K> & {
    label: string;
    values: Array<{ value: ReqPrefs[K]; label: string }>;
  },
) {
  const { values, label, ...rest } = props;
  return (
    <PrefWrapper
      {...rest}
      renderField={({ value, onChange, disabled }) => (
        <RadioGroup value={value} onChange={onChange} label={label}>
          {values.map((v) => (
            <Radio
              key={v.value}
              value={v.value}
              label={v.label}
              disabled={disabled}
            />
          ))}
        </RadioGroup>
      )}
    />
  );
}

export function UserPreferences(props: { value: ReqPrefs; userID: number }) {
  return (
    <Stack>
      <SegmentedPreference
        label="Time Format"
        field="timeFormat"
        values={["12hr", "24hr"]}
        prefs={props.value}
        userID={props.userID}
      />
      <RadioGroupPreference
        label="Which events to display in external calendar feed?"
        field="icalFilter"
        values={[
          { label: "Only My Events", value: "only-mine" },
          { label: "All Events", value: "all" },
        ]}
        prefs={props.value}
        userID={props.userID}
      />
    </Stack>
  );
}
