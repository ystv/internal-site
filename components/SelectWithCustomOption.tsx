import invariant from "@/lib/invariant";
import {
  Combobox,
  ComboboxChevron,
  ComboboxDropdown,
  ComboboxOption,
  ComboboxOptions,
  ComboboxTarget,
  InputBase,
  useCombobox,
} from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * React component for a select input with custom options.
 *
 * Its behaviour depends on the value of `props.isCustomValue`:
 * * If false, `props.value` is assumed to be the `value` field of one of the `props.data` elements, and the corresponding `label` is displayed.
 * * If true, `props.value` is assumed to be a custom value, and is displayed as-is. It is assumed that the parent component will handle storing it on the server.
 *
 * @component
 * @param {Array} props.data - Array of objects with `label` and `value` properties for selectable options.
 * @param {string} props.value - Currently selected value (custom or from options).
 * @param {boolean} props.isCustomValue - Flag indicating if the selected value is custom.
 * @param {(value: string, isCustom: boolean) => unknown} props.onChange - Callback on value change. If allowNone is true, the value will be "" if the user selects "None".
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {boolean} [props.allowNone] - If true, a "None" option will be displayed when the input is empty.
 */
export default function SelectWithCustomOption(props: {
  data: { label: string; value: string }[];
  value: string | null;
  isCustomValue: boolean;
  onChange: (value: string, isCustom: boolean) => unknown;
  placeholder?: string;
  allowNone?: boolean;
}) {
  if (props.isCustomValue) {
    invariant(props.value !== null, "value is null but isCustomValue is true");
  }

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // This is the value typed by the user.
  // null means that they haven't typed anything, they've just selected a value,
  // or they've just closed the dropdown - either way, they're not searching.
  // empty-string means they've cleared the input (a valid state).
  const [search, setSearch] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      // if search is empty, this will implicitly return all items
      search
        ? props.data.filter((x) =>
            x.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
          )
        : props.data,
    [props.data, search],
  );

  const selected = useMemo(
    () =>
      props.isCustomValue
        ? props.value
        : props.data.find((x) => x.value === props.value)?.label ?? "",
    [props.data, props.value, props.isCustomValue],
  );

  const options = filtered.map((item) => (
    <ComboboxOption key={item.value} value={item.value}>
      {item.label}
    </ComboboxOption>
  ));

  useEffect(() => {
    if (search === null || !combobox.dropdownOpened) {
      // we're not searching, so we don't need to do anything
      return;
    }
    combobox.selectFirstOption();
  }, [combobox, search]);

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        if (val === "$create") {
          // we want to create a new field with the given input
          // though note that we don't actually create it until the form as a whole
          // is submitted, instead we hang on to it (or rather, we have the parent
          // component hang on to it and pass it back to us along with isCustomValue=true)
          invariant(search !== null, "selected $create but search is null");
          props.onChange(search, true);
        } else if (val === "$null") {
          // the user has selected nothing
          props.onChange("", false);
        } else {
          // the user has selected an existing option
          props.onChange(val, false);
        }
        setSearch(null);
        combobox.closeDropdown();
      }}
    >
      <ComboboxTarget>
        <InputBase
          ref={inputRef}
          rightSection={<ComboboxChevron />}
          value={search === null ? selected || "" : search}
          onChange={(e) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(e.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => {
            combobox.openDropdown();
            inputRef.current?.select();
          }}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(selected ? selected : null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              combobox.clickSelectedOption();
            }
          }}
          placeholder={props.placeholder}
          rightSectionPointerEvents="none"
        />
      </ComboboxTarget>
      <ComboboxDropdown>
        <ComboboxOptions className="max-h-64 overflow-scroll">
          {props.allowNone && (!search || search.trim().length === 0) && (
            <ComboboxOption value={"$null"}>None</ComboboxOption>
          )}
          {options}
          {/* show the "create custom" option if the user has typed something, and it doesn't match an existing item *exactly* */}
          {/* (they may want to create a new item that's a substring of a pre-existing one - see WEB-99) */}
          {(search?.trim().length ?? 0) > 0 &&
            !filtered.some((x) => x.label === search?.trim()) && (
              <ComboboxOption value="$create">
                &apos;{search}&apos;
              </ComboboxOption>
            )}
        </ComboboxOptions>
      </ComboboxDropdown>
    </Combobox>
  );
}
