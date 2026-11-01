import "server-only";
import { cache } from "react";
import { createClient } from "./server";
export function isTrustedAdmin(user: { app_metadata?: Record<string, unknown> } | null | undefined) { return user?.app_metadata?.role === "admin"; }
export const authorizedAdminClient = cache(async () => {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !isTrustedAdmin(user)) throw new Error("Administrator role required.");
  return client;
});
