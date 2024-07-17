"use client";

import {
  Stack,
  InputWrapper,
  SegmentedControl,
  Group,
  Divider,
  InputLabel,
} from "@mantine/core";
import {
  ReactNode,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { changePreference, fetchPreferences } from "./actions";
import { notifications } from "@mantine/notifications";
import { useWebsocket } from "@/components/WebsocketProvider";

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
  const [preferences, setPreferences] = useState(props.value);

  const { socket, isConnected, transport } = useWebsocket();

  useEffect(() => {
    async function onMeUpdate(value: any) {
      notifications.show({
        message: "You've been updated!",
      });

      const updatedPreferences = await fetchPreferences(props.userID);

      console.log(updatedPreferences);

      if (updatedPreferences !== null && updatedPreferences !== preferences) {
        setPreferences(updatedPreferences);
      }
    }

    socket.on("userUpdate:me", onMeUpdate);

    return () => {
      socket.off("userUpdate:me", onMeUpdate);
    };
  }, []);

  return (
    <Stack>
      <SegmentedPreference
        label="Time Format"
        field="timeFormat"
        values={["12hr", "24hr"]}
        prefs={preferences}
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
        prefs={preferences}
        userID={props.userID}
      />
    </Stack>
  );
}
