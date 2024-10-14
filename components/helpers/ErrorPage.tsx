"use client";

import { Image, Stack } from "@mantine/core";
import React from "react";

const styles: Record<string, React.CSSProperties> = {
  error: {
    // https://github.com/sindresorhus/modern-normalize/blob/main/modern-normalize.css#L38-L52
    fontFamily:
      'system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
    height: "100vh",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  desc: {
    display: "inline-block",
  },

  h1: {
    display: "inline-block",
    margin: "0 20px 0 0",
    padding: "0 23px 0 0",
    fontSize: 24,
    fontWeight: 500,
    verticalAlign: "top",
    lineHeight: "49px",
  },

  h2: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "49px",
    margin: 0,
  },
};

export default function ErrorPage({
  code = 500,
  message = "Internal Server Error",
}: {
  code?: number;
  message?: string;
}) {
  return (
    <>
      <div style={styles.error}>
        <div>
          <style
            dangerouslySetInnerHTML={{
              __html: `body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}`,
            }}
          />
          <Stack>
            <div>
              <h1 className="next-error-h1" style={styles.h1}>
                {code}
              </h1>
              <div style={styles.desc}>
                <h2 style={styles.h2}>{message}</h2>
              </div>
            </div>
            <Image
              src={`https://http.cat/${code}`}
              alt={`An image depicting a cat with a HTTP status code ${code} and message`}
              width={200}
            />
          </Stack>
        </div>
      </div>
    </>
  );
}
