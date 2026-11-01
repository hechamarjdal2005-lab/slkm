import { cache } from "react";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./supabase/env";
import { createClient as createServerSupabaseClient } from "./supabase/server";
import { authorizedAdminClient } from "./supabase/admin";
import type {
  Agency,
  BlogPost,
  ContactMessage,
  CorporateQuote,
  ParcelRate,
  Route,
  RouteWithAgencies,
  SiteSettings,
} from "./types";

let publicClient: SupabaseClient | null = null;

function getPublicClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  if (!publicClient) {
    publicClient = createSupabaseClient(env.url, env.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: init?.signal ?? AbortSignal.timeout(12000) }) },
    });
  }
  return publicClient;
}

function report(context: string, error: { message: string } | null) {
  if (error) console.error(`[supabase:${context}] ${error.message}`);
}

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const supabase = getPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  report("site_settings", error);
  return (data as SiteSettings | null) ?? null;
});

export const getAgencies = cache(async (includeInactive = false): Promise<Agency[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  let query = supabase.from("agencies").select("*").order("sort_order").order("city_fr", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  report("agencies", error);
  return (data as Agency[] | null) ?? [];
});

export const getRoutes = cache(async (): Promise<RouteWithAgencies[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const [routeResult, agencies] = await Promise.all([
    supabase.from("routes").select("*").eq("is_active", true).order("sort_order").order("departure_time", { ascending: true }),
    getAgencies(),
  ]);
  report("routes", routeResult.error);
  const byId = new Map(agencies.map((agency) => [agency.id, agency]));
  return ((routeResult.data as Route[] | null) ?? [])
    .map((route) => ({
      ...route,
      from_agency: byId.get(route.from_agency_id) ?? null,
      to_agency: byId.get(route.to_agency_id) ?? null,
    }))
    .filter((route) => route.from_agency && route.to_agency);
});

export const getParcelRates = cache(async (): Promise<ParcelRate[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("parcel_rates")
    .select("*")
    .order("max_weight_kg", { ascending: true });
  report("parcel_rates", error);
  return (data as ParcelRate[] | null) ?? [];
});

export const getBlogPosts = cache(async (limit?: number): Promise<BlogPost[]> => {
  const supabase = getPublicClient();
  if (!supabase) return [];
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  report("blog_posts", error);
  return (data as BlogPost[] | null) ?? [];
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const supabase = getPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  report("blog_post", error);
  return (data as BlogPost | null) ?? null;
});

async function adminClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  try {
    return await authorizedAdminClient();
  } catch (error) {
    report("admin_client", error as Error);
    return null;
  }
}

export interface AdminSnapshot {
  error?: string;
  agencies: Agency[];
  routes: Route[];
  rates: ParcelRate[];
  quotes: CorporateQuote[];
  posts: BlogPost[];
  messages: ContactMessage[];
  settings: SiteSettings | null;
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const supabase = await adminClient();
  if (!supabase) {
    return { agencies: [], routes: [], rates: [], quotes: [], posts: [], messages: [], settings: null };
  }

  const [agencies, routes, rates, quotes, posts, messages, settings] = await Promise.all([
    supabase.from("agencies").select("*").order("city_fr"),
    supabase.from("routes").select("*").order("created_at", { ascending: false }),
    supabase.from("parcel_rates").select("*").order("max_weight_kg"),
    supabase.from("corporate_quotes").select("*").order("created_at", { ascending: false }),
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  report("admin_agencies", agencies.error);
  report("admin_routes", routes.error);
  report("admin_rates", rates.error);
  report("admin_quotes", quotes.error);
  report("admin_posts", posts.error);
  report("admin_messages", messages.error);
  report("admin_settings", settings.error);

  return {
    error: [agencies, routes, rates, quotes, posts, messages, settings].some(result => result.error) ? "Certaines données n’ont pas pu être chargées. Vérifiez les migrations et les permissions Supabase avant de modifier le site." : undefined,
    agencies: (agencies.data as Agency[] | null) ?? [],
    routes: (routes.data as Route[] | null) ?? [],
    rates: (rates.data as ParcelRate[] | null) ?? [],
    quotes: (quotes.data as CorporateQuote[] | null) ?? [],
    posts: (posts.data as BlogPost[] | null) ?? [],
    messages: (messages.data as ContactMessage[] | null) ?? [],
    settings: (settings.data as SiteSettings | null) ?? null,
  };
}

export async function getAdminEntity<T>(table: string, id: string): Promise<T | null> {
  const supabase = await adminClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  report(`admin_${table}_entity`, error);
  return (data as T | null) ?? null;
}
