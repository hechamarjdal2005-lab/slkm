"use client";
import { createContext, useContext, type ReactNode } from "react";
import { fallbackPage, type CmsPageData } from "@/lib/cms";
const Context = createContext<Record<string, CmsPageData>>({});
export function PublicContentProvider({ pages, children }: { pages: Record<string, CmsPageData>; children: ReactNode }) { return <Context.Provider value={pages}>{children}</Context.Provider>; }
export function usePageCMS(slug: string) { return useContext(Context)[slug] ?? fallbackPage(slug); }
