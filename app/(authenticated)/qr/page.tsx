"use client";

import {
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Stack,
  TextInput,
} from "@mantine/core";
import { useSearchParams } from "next/navigation";
import QRCodeStyling, { type Options } from "qr-code-styling";
import { useEffect, useRef, useState } from "react";

import Logo from "@/app/_assets/logo-new.png";
import { usePublicURL } from "@/components/PublicURLContext";

export default function QRCodeGeneratorPage() {
  const searchParams = useSearchParams();

  const link = searchParams.get("link");

  const [options, setOptions] = useState<Options>({
    width: 300,
    height: 300,
    type: "svg",
    data: link ?? "https://welcome.ystv.co.uk",
    image: Logo.src,
    margin: 10,
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "Q",
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.5,
      margin: 4,
      crossOrigin: "anonymous",
      saveAsBlob: true,
    },
    dotsOptions: {
      color: "#222222",
    },
  });

  const publicURL = usePublicURL();

  const [qrCode, setQrCode] = useState<QRCodeStyling>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQrCode(new QRCodeStyling(options));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ref.current) {
      qrCode?.append(ref.current);
    }
  }, [qrCode, ref]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode?.update(options);
  }, [qrCode, options]);

  return (
    <Card withBorder>
      <Group>
        <Box
          pos={"relative"}
          style={{ width: "100%", maxWidth: 300, height: "auto" }}
        >
          <LoadingOverlay
            style={{ width: "100%", maxWidth: 300, height: "auto" }}
            zIndex={4}
          />
          <div
            ref={ref}
            style={{ width: "100%", maxWidth: 300, height: "auto", zIndex: 5 }}
          />
        </Box>
        <Stack>
          <TextInput
            label="Link"
            placeholder="https://welcome.ystv.co.uk"
            value={options.data}
            onChange={(e) =>
              setOptions({ ...options, data: e.currentTarget.value })
            }
          />
          <Button
            onClick={() => {
              qrCode?.download({
                extension: "png",
                name:
                  "qr-" +
                  new URL(options.data ?? publicURL).hostname.replaceAll(
                    ".",
                    "-",
                  ),
              });
            }}
          >
            Download PNG
          </Button>
        </Stack>
      </Group>
    </Card>
  );
}
