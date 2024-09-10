import * as z from "zod"
import { CompleteUser, UserModel } from "./index"

export const _NewsItemModel = z.object({
  id: z.number().int(),
  author_id: z.number().int(),
  time: z.date(),
  expires: z.date().nullish(),
  title: z.string(),
  content: z.string(),
})

export interface CompleteNewsItem extends z.infer<typeof _NewsItemModel> {
  author: CompleteUser
}

/**
 * NewsItemModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const NewsItemModel: z.ZodSchema<CompleteNewsItem> = z.lazy(() => _NewsItemModel.extend({
  author: UserModel,
}))
