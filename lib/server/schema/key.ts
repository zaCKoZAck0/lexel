import { z } from "zod";
import { getProviderInfo } from "@/lib/providers";

// Match the Prisma ApiKeys model schema
export const keySchema = z.object({
    provider: z.string().min(1, "Provider is required"),
    key: z.string().min(1, "API key is required"),
    default: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
    const info = getProviderInfo(data.provider)
    if (!info) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['provider'], message: 'Unknown provider' })
        return
    }
    if (info.keyPattern && !info.keyPattern.test(data.key.trim())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['key'], message: 'Key format does not match expected pattern for ' + info.name })
    }
})