"use client";

import { Input, Loader, Textarea } from "@mantine/core";
import { debounce } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

export function SearchQuotes() {
  const router = useRouter();
  const pathName = usePathname();
  const params = useSearchParams();
  const searchParam = params.get("search") ?? "";
  const [value, setValue] = useState(searchParam);
  useEffect(() => {
    setValue(searchParam);
  }, [searchParam]);
  const doUpdate = useMemo(
    () =>
      debounce((value: string) => {
        router.replace(`${pathName}?search=${value}`);
      }, 350),
    [pathName, router],
  );
  return (
    <div>
      <b>Search</b>
      <Input
        type="text"
        autoComplete="search"
        value={value}
        onChange={(e) => {
          setValue(e.currentTarget.value);
          doUpdate(e.currentTarget.value);
        }}
      />
    </div>
  );
}
