import * as Minio from "minio";

import { env } from "../env";
import invariant from "../invariant";

export const isMinioEnabled = env.MINIO_ENABLED === "true";

export const getMinioClient = () => {
  invariant(isMinioEnabled, "minioClient accessed but minio is disabled");

  return new Minio.Client({
    endPoint: env.MINIO_ENDPOINT!,
    useSSL: env.MINIO_USE_SSL == "true" ? true : false,
    accessKey: env.MINIO_ACCESS_KEY!,
    secretKey: env.MINIO_SECRET_KEY!,
  });
};
