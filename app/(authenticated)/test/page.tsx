"use client";

import { Box, Grid } from "@mantine/core";

export default function TestPage() {
  return (
    <>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Box
            color="red"
            h={100}
            w={"auto"}
            style={{ backgroundColor: "#FFAA00" }}
          />
        </Grid.Col>
      </Grid>
    </>
  );
}
