import { ActionIcon, TextInput, Tooltip } from "@mantine/core";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

export function SearchBar(props: {
  default: string | undefined;
  onChange: (query: string | undefined) => void;
  delay?: number;
  label?: string;
  description?: string;
  withClear?: boolean;
}) {
  const [searchQueryState, setSearchQueryState] = useState<string>(
    props.default ?? "",
  );

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      props.onChange(searchQueryState);
    }, props.delay ?? 500);
    return () => clearTimeout(delayInputTimeoutId);
  }, [searchQueryState, props.delay]);

  const isSearchEmpty = searchQueryState == "";

  return (
    <TextInput
      label={props.label ?? "Search"}
      description={props.description}
      rightSection={
        props.withClear && (
          <Tooltip label={"Clear search"} disabled={isSearchEmpty}>
            <ActionIcon variant="subtle" color="red" disabled={isSearchEmpty}>
              <IoClose onClick={() => setSearchQueryState("")} />
            </ActionIcon>
          </Tooltip>
        )
      }
      onChange={async (event) => {
        setSearchQueryState(event.currentTarget.value);
      }}
      value={searchQueryState}
    />
  );
}
