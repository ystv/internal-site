import {
  ActionIcon,
  Button,
  Group,
  InputLabel,
  NativeSelect,
  Text,
} from "@mantine/core";
import { useSearchParams } from "next/navigation";
import {
  FaAnglesLeft,
  FaAngleLeft,
  FaAnglesRight,
  FaAngleRight,
} from "react-icons/fa6";

/**
 * This relies on the "page" search param to be avaliable
 */
export function PageControls(props: {
  setPage: (page: number) => void;
  totalPages: number;
  currentPage: number;
}) {
  return (
    <Group>
      <ActionIcon
        onClick={() => props.setPage(1)}
        disabled={props.currentPage == 1}
      >
        <FaAnglesLeft />
      </ActionIcon>
      <ActionIcon
        onClick={() => props.setPage(props.currentPage - 1)}
        disabled={props.currentPage == 1}
      >
        <FaAngleLeft />
      </ActionIcon>
      <Text>
        Page {props.currentPage} of {props.totalPages}
      </Text>
      <ActionIcon
        onClick={() => props.setPage(props.currentPage + 1)}
        disabled={props.currentPage == props.totalPages}
      >
        <FaAngleRight />
      </ActionIcon>
      <ActionIcon
        onClick={() => props.setPage(props.totalPages)}
        disabled={props.currentPage == props.totalPages}
      >
        <FaAnglesRight />
      </ActionIcon>
    </Group>
  );
}

export function CountControls(props: {
  values: string[];
  current: string;
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
        value={props.values.includes(props.current) ? props.current : "custom"}
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
        {!props.values.includes(props.current) && (
          <option value={"custom"} hidden>
            {props.current}
          </option>
        )}
      </NativeSelect>
    </Group>
  );
}
