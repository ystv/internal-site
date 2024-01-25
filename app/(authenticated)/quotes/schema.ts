import { z } from "zod";
import { zfd } from "zod-form-data";

export const AddQuoteSchema = z.object({
  text: z.string().nonempty(),
  context: z.string().optional().default(""),
});

export const EditQuoteSchema = AddQuoteSchema.extend({
  quote_id: z.coerce.number().int(),
});
