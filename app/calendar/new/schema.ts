import { zfd } from "zod-form-data";
import { z } from "zod";

export const schema = zfd.formData({
  name: z.string().nonempty(),
});
