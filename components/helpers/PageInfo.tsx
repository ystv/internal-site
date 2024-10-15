"use client";

export function PageInfo(props: { title?: string }) {
  return (
    <title>{`${props.title ? props.title + " | " : ""}YSTV Calendar`}</title>
  );
}
