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
 * React component for a select input.
 *
 * @component
 * @param {Array} props.data - Array of objects with `label` and `value` properties for selectable options.
 * @param {string} props.value - Currently selected value (custom or from options).
 * @param {(value: string) => unknown} props.onChange - Callback on value change. If allowNone is true, the value will be "" if the user selects "None".
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {boolean} [props.allowNone] - If true, a "None" option will be displayed when the input is empty.
 */
export default function SelectOption(props: {
  data: { label: string; value: string }[];
  value: string | null;
  onChange: (value: string) => unknown;
  placeholder?: string;
  allowNone?: boolean;
}) {
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
    () => props.data.find((x) => x.value === props.value)?.label ?? "",
    [props.data, props.value],
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
        if (val === "$null") {
          // the user has selected nothing
          props.onChange("");
        } else {
          // the user has selected an existing option
          props.onChange(val);
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
          {!props.allowNone && options.length === 0 && (
            <ComboboxOption disabled value={"$null"} className="!opacity-100">
              Invalid Search
            </ComboboxOption>
          )}
          {props.allowNone && (!search || search.trim().length === 0) && (
            <ComboboxOption value={"$null"}>None</ComboboxOption>
          )}
          {options}
        </ComboboxOptions>
      </ComboboxDropdown>
    </Combobox>
  );
}
