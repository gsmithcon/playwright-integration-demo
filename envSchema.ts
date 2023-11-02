import { z } from "zod";

export const envSchema = z.object({
  JIRA_KEY: z.string(),
  JIRA_URL: z.string(),
  PROJECT_KEY: z.string(),
  PROJECT_NAME: z.string(),
  VERSION: z.string().optional().nullable(),
  XRAY_CLIENT_ID: z.string(),
  XRAY_CLIENT_SECRET: z.string(),
  REPORT_TO_JIRA: z.boolean().optional().nullable(),
});
