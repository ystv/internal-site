import {
  Group,
  InputLabel,
  NativeSelect,
  Pagination,
  Text,
} from "@mantine/core";

export function PageControls(props: {
  setPage: (page: number) => void;
  totalPages: number;
  currentPage: number;
}) {
  return (
    <Pagination
      withEdges
      siblings={1}
      boundaries={0}
      onChange={props.setPage}
      total={props.totalPages}
      value={props.currentPage}
    />
  );
}

export function CountControls(props: {
  values: string[];
  current: string | number;
  setCount: (count: number) => void;
  currentRange?: string | undefined;
  total?: number | undefined;
}) {
  return (
    <Group>
      {props.currentRange != undefined && (
        <>
          <Text>
            Showing {props.currentRange}{" "}
            {props.total != undefined && <>of {props.total}</>}
          </Text>
        </>
      )}
      <InputLabel ml={"auto"}>Show</InputLabel>
      <NativeSelect
        value={
          props.values.includes(`${props.current}`) ? props.current : "custom"
        }
        onChange={async (event) => {
          const newCount = Number(event.currentTarget.value);
          props.setCount(newCount);
        }}
      >
        {props.values.map((selectValue) => {
          return (
            <option value={selectValue} key={selectValue}>
              {selectValue}
            </option>
          );
        })}
        {/* Allows custom count values to be entered 
              without showing them in the list */}
        {!props.values.includes(`${props.current}`) && (
          <option value={"custom"} hidden>
            {props.current}
          </option>
        )}
      </NativeSelect>
    </Group>
  );
}
