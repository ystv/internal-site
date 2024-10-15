"use client";

import SelectWithCustomOption from "@/components/forms/SelectWithCustomOption";
import { useSlackChannels } from "@/components/slack/SlackChannelsProvider";
import { InputError } from "@mantine/core";
import { useForceUpdate } from "@mantine/hooks";
import { use, useMemo } from "react";
import { useController, useFormContext } from "react-hook-form";

export function SlackChannelField(props: { parentName: string }) {
  const ctx = useFormContext();
  const slackChannels = useSlackChannels();
  const vals = use(slackChannels);
  const forceUpdate = useForceUpdate();
  const selectController = useController({
    name: `${props.parentName}_id`,
  });
  const customController = useController({
    name: `${props.parentName}_new_name`,
  });

  const [value, isCustom] = useMemo<[string | null, boolean]>(() => {
    if (customController.field.value?.trim().length > 0) {
      return [customController.field.value, true];
    }
    if (typeof selectController.field.value === "string") {
      return [selectController.field.value, false];
    }
    if (selectController.field.value === null) {
      return [null, false];
    }
    return [selectController.field.value, false];
  }, [selectController.field.value, customController.field.value]);

  const channelNameRegexp = new RegExp(/^[a-zA-Z0-9-]{1,80}$/);

  const isCustomValid = channelNameRegexp.test(customController.field.value);

  return (
    <>
      {ctx.formState.errors[props.parentName] && (
        <span className="block font-semibold text-red-500">
          {(ctx.formState.errors.slack_channel?.message as string) ?? ""}
        </span>
      )}
      <input type="hidden" name={`${props.parentName}_id`} value={""} />
      <input type="hidden" name={`${props.parentName}_new_name`} value={""} />
      <SelectWithCustomOption
        data={
          vals.map((v) => ({
            label: v.name!,
            value: v.id!,
          }))!
        }
        value={value}
        isCustomValue={isCustom}
        allowNone
        onChange={(newV, isNew) => {
          forceUpdate();
          if (isNew) {
            selectController.field.onChange("");
            customController.field.onChange(newV);
          } else {
            selectController.field.onChange(newV);
            customController.field.onChange(null);
          }
        }}
        placeholder="Select a channel, or type a name to create one"
      />
      {!isCustomValid && customController.field.value != "" && (
        <InputError className="!mt-1">
          Channel names can’t contain spaces or punctuation. Use dashes to
          separate words.
        </InputError>
      )}
    </>
  );
}
