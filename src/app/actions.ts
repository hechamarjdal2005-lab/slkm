"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/action-state";
import type { Locale } from "@/lib/types";

function localized(locale: Locale, fr: string, ar: string, en: string) {
  return locale === "ar" ? ar : locale === "en" ? en : fr;
}

function readLocale(value: FormDataEntryValue | null): Locale {
  return value === "ar" || value === "en" ? value : "fr";
}

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function optional(value: FormDataEntryValue | null) {
  const result = text(value);
  return result || null;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function publicClient() {
  if (!getSupabaseEnv()) return null;
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function submitCorporateQuote(_state: ActionState, formData: FormData): Promise<ActionState> {
  const locale = readLocale(formData.get("locale"));
  const companyName = text(formData.get("company_name"));
  const contactPerson = text(formData.get("contact_person"));
  const phone = text(formData.get("phone"));
  const email = text(formData.get("email"));
  const serviceType = text(formData.get("service_type"));
  const passengerCount = Number(text(formData.get("passenger_count")));
  const originCity = text(formData.get("origin_city"));
  const destinationCity = text(formData.get("destination_city"));
  const details = optional(formData.get("details"));

  if (!companyName || !contactPerson || !phone || !email || !serviceType || !originCity || !destinationCity) {
    return { status: "error", message: localized(locale, "Veuillez remplir tous les champs obligatoires.", "يرجى ملء جميع الحقول الإلزامية.", "Please fill in all required fields.") };
  }
  if (!validEmail(email)) {
    return { status: "error", message: localized(locale, "Veuillez saisir une adresse e-mail valide.", "يرجى إدخال بريد إلكتروني صالح.", "Please enter a valid email address.") };
  }
  if (!Number.isFinite(passengerCount) || passengerCount < 1) {
    return { status: "error", message: localized(locale, "Le nombre de passagers doit être supérieur à zéro.", "يجب أن يكون عدد المسافرين أكبر من صفر.", "Passenger count must be greater than zero.") };
  }
  if (serviceType !== "personnel" && serviceType !== "tourisme") {
    return { status: "error", message: localized(locale, "Type de service invalide.", "نوع الخدمة غير صالح.", "Invalid service type.") };
  }

  const supabase = await publicClient();
  if (!supabase) {
    return { status: "error", message: localized(locale, "Le service de demande est momentanément indisponible.", "خدمة الطلب غير متاحة حالياً.", "The request service is temporarily unavailable.") };
  }

  const { error } = await supabase.from("corporate_quotes").insert({
    company_name: companyName,
    contact_person: contactPerson,
    phone,
    email,
    service_type: serviceType,
    passenger_count: passengerCount,
    origin_city: originCity,
    destination_city: destinationCity,
    details,
    status: "pending",
  });

  if (error) {
    console.error("[corporate_quote]", error.message);
    return { status: "error", message: localized(locale, "La demande n'a pas pu être envoyée. Réessayez ou contactez-nous par WhatsApp.", "تعذر إرسال الطلب. أعد المحاولة أو اتصل بنا عبر واتساب.", "Your request could not be sent. Try again or contact us on WhatsApp.") };
  }

  revalidatePath("/admin");
  return { status: "success", message: localized(locale, "Votre demande a bien été envoyée. Notre équipe B2B vous contacte sous 24 h ouvrées.", "تم إرسال طلبكم بنجاح. سيتواصل معكم فريق الشركات خلال 24 ساعة عمل.", "Your request has been sent. Our B2B team will contact you within one business day.") };
}

export async function submitContactMessage(_state: ActionState, formData: FormData): Promise<ActionState> {
  const locale = readLocale(formData.get("locale"));
  const fullName = text(formData.get("full_name"));
  const email = text(formData.get("email"));
  const phone = optional(formData.get("phone"));
  const subject = text(formData.get("subject"));
  const message = text(formData.get("message"));

  if (!fullName || !email || !subject || !message) {
    return { status: "error", message: localized(locale, "Veuillez remplir tous les champs obligatoires.", "يرجى ملء جميع الحقول الإلزامية.", "Please fill in all required fields.") };
  }
  if (!validEmail(email)) {
    return { status: "error", message: localized(locale, "Veuillez saisir une adresse e-mail valide.", "يرجى إدخال بريد إلكتروني صالح.", "Please enter a valid email address.") };
  }
  if (message.length < 10) {
    return { status: "error", message: localized(locale, "Votre message est trop court.", "رسالتكم قصيرة جداً.", "Your message is too short.") };
  }

  const supabase = await publicClient();
  if (!supabase) {
    return { status: "error", message: localized(locale, "Le formulaire est momentanément indisponible.", "النموذج غير متاح حالياً.", "The form is temporarily unavailable.") };
  }

  const { error } = await supabase.from("contact_messages").insert({
    full_name: fullName,
    email,
    phone,
    subject,
    message,
    status: "new",
  });

  if (error) {
    console.error("[contact_message]", error.message);
    return { status: "error", message: localized(locale, "Le message n'a pas pu être envoyé. Réessayez ou appelez-nous.", "تعذر إرسال الرسالة. أعد المحاولة أو اتصل بنا هاتفياً.", "Your message could not be sent. Try again or call us.") };
  }

  revalidatePath("/admin");
  return { status: "success", message: localized(locale, "Merci, votre message a bien été reçu. Nous vous répondons rapidement.", "شكراً، تم استلام رسالتكم وسنرد عليكم في أقرب وقت.", "Thank you, your message has been received. We will reply shortly.") };
}

function adminRedirect(tab: string, message?: string, success?: string): never {
  const params = new URLSearchParams({ tab });
  if (message) params.set("error", message);
  if (success) params.set("success", success);
  redirect(`/admin?${params.toString()}`);
}

async function adminClient() {
  if (!getSupabaseEnv()) adminRedirect("overview", "Supabase n'est pas configuré.");
  try {
    return await createClient();
  } catch {
    adminRedirect("overview", "Connexion Supabase impossible.");
  }
}

function fail(tab: string, message: string): never {
  adminRedirect(tab, message);
}

function refreshAdmin() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function upsertAgency(formData: FormData) {
  const supabase = await adminClient();
  const id = optional(formData.get("id"));
  const payload = {
    city_ar: text(formData.get("city_ar")),
    city_fr: text(formData.get("city_fr")),
    city_en: text(formData.get("city_en")),
    agency_name_ar: text(formData.get("agency_name_ar")),
    agency_name_fr: text(formData.get("agency_name_fr")),
    agency_name_en: text(formData.get("agency_name_en")),
    address_ar: text(formData.get("address_ar")),
    address_fr: text(formData.get("address_fr")),
    address_en: text(formData.get("address_en")),
    whatsapp_number: optional(formData.get("whatsapp_number")),
    phone_number: optional(formData.get("phone_number")),
    lat: optional(formData.get("lat")) ? Number(text(formData.get("lat"))) : null,
    lng: optional(formData.get("lng")) ? Number(text(formData.get("lng"))) : null,
    image_url: optional(formData.get("image_url")),
    is_active: formData.get("is_active") === "on",
  };

  if (!payload.city_fr || !payload.city_ar || !payload.city_en || !payload.agency_name_fr || !payload.agency_name_ar || !payload.agency_name_en) {
    fail("agencies", "Ville et nom d'agence requis dans les trois langues.");
  }
  if ((payload.lat === null) !== (payload.lng === null)) {
    fail("agencies", "Latitude et longitude doivent être renseignées ensemble.");
  }

  const result = id
    ? await supabase.from("agencies").update(payload).eq("id", id)
    : await supabase.from("agencies").insert(payload);
  if (result.error) fail("agencies", result.error.message);
  refreshAdmin();
  adminRedirect("agencies", undefined, id ? "Agence mise à jour." : "Agence créée.");
}

export async function deleteAgency(formData: FormData) {
  const supabase = await adminClient();
  const id = text(formData.get("id"));
  if (!id) fail("agencies", "Agence introuvable.");
  const { error } = await supabase.from("agencies").delete().eq("id", id);
  if (error) fail("agencies", error.message);
  refreshAdmin();
  adminRedirect("agencies", undefined, "Agence supprimée.");
}

export async function upsertRoute(formData: FormData) {
  const supabase = await adminClient();
  const id = optional(formData.get("id"));
  const days = formData.getAll("days_of_week").filter((value): value is string => typeof value === "string");
  const payload = {
    from_agency_id: text(formData.get("from_agency_id")),
    to_agency_id: text(formData.get("to_agency_id")),
    departure_time: text(formData.get("departure_time")),
    arrival_time: text(formData.get("arrival_time")),
    price_mad: Number(text(formData.get("price_mad"))),
    bus_type: text(formData.get("bus_type")) || "Comfort",
    days_of_week: days,
    is_tourist_route: formData.get("is_tourist_route") === "on",
    is_active: formData.get("is_active") === "on",
  };

  if (!payload.from_agency_id || !payload.to_agency_id || !payload.departure_time || !payload.arrival_time) {
    fail("routes", "Agences, heure de départ et heure d'arrivée sont requises.");
  }
  if (payload.from_agency_id === payload.to_agency_id) fail("routes", "Les agences de départ et d'arrivée doivent être différentes.");
  if (!Number.isFinite(payload.price_mad) || payload.price_mad < 0) fail("routes", "Le prix doit être positif.");
  if (!days.length) fail("routes", "Sélectionnez au moins un jour de circulation.");

  const result = id
    ? await supabase.from("routes").update(payload).eq("id", id)
    : await supabase.from("routes").insert(payload);
  if (result.error) fail("routes", result.error.message);
  refreshAdmin();
  adminRedirect("routes", undefined, id ? "Ligne mise à jour." : "Ligne créée.");
}

export async function deleteRoute(formData: FormData) {
  const supabase = await adminClient();
  const id = text(formData.get("id"));
  if (!id) fail("routes", "Ligne introuvable.");
  const { error } = await supabase.from("routes").delete().eq("id", id);
  if (error) fail("routes", error.message);
  refreshAdmin();
  adminRedirect("routes", undefined, "Ligne supprimée.");
}

export async function upsertParcelRate(formData: FormData) {
  const supabase = await adminClient();
  const id = optional(formData.get("id"));
  const payload = {
    category_ar: text(formData.get("category_ar")),
    category_fr: text(formData.get("category_fr")),
    category_en: text(formData.get("category_en")),
    max_weight_kg: Number(text(formData.get("max_weight_kg"))),
    base_price_mad: Number(text(formData.get("base_price_mad"))),
    description_ar: optional(formData.get("description_ar")),
    description_fr: optional(formData.get("description_fr")),
    description_en: optional(formData.get("description_en")),
  };

  if (!payload.category_fr || !payload.category_ar || !payload.category_en) fail("rates", "Les catégories sont requises dans les trois langues.");
  if (!Number.isFinite(payload.max_weight_kg) || payload.max_weight_kg <= 0) fail("rates", "Le poids maximum doit être supérieur à zéro.");
  if (!Number.isFinite(payload.base_price_mad) || payload.base_price_mad < 0) fail("rates", "Le tarif doit être positif.");

  const result = id
    ? await supabase.from("parcel_rates").update(payload).eq("id", id)
    : await supabase.from("parcel_rates").insert(payload);
  if (result.error) fail("rates", result.error.message);
  refreshAdmin();
  adminRedirect("rates", undefined, id ? "Tarif mis à jour." : "Tarif créé.");
}

export async function deleteParcelRate(formData: FormData) {
  const supabase = await adminClient();
  const id = text(formData.get("id"));
  if (!id) fail("rates", "Tarif introuvable.");
  const { error } = await supabase.from("parcel_rates").delete().eq("id", id);
  if (error) fail("rates", error.message);
  refreshAdmin();
  adminRedirect("rates", undefined, "Tarif supprimé.");
}

export async function upsertBlogPost(formData: FormData) {
  const supabase = await adminClient();
  const id = optional(formData.get("id"));
  const isPublished = formData.get("is_published") === "on";
  const publishedAtValue = text(formData.get("published_at"));
  const publishedDate = publishedAtValue ? new Date(publishedAtValue) : new Date();
  if (isPublished && Number.isNaN(publishedDate.getTime())) fail("blog", "La date de publication est invalide.");
  const payload = {
    slug: text(formData.get("slug")),
    title_ar: text(formData.get("title_ar")),
    title_fr: text(formData.get("title_fr")),
    title_en: text(formData.get("title_en")),
    excerpt_ar: optional(formData.get("excerpt_ar")),
    excerpt_fr: optional(formData.get("excerpt_fr")),
    excerpt_en: optional(formData.get("excerpt_en")),
    content_ar: text(formData.get("content_ar")),
    content_fr: text(formData.get("content_fr")),
    content_en: text(formData.get("content_en")),
    cover_image_url: optional(formData.get("cover_image_url")),
    is_published: isPublished,
    published_at: isPublished ? publishedDate.toISOString() : null,
  };

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) fail("blog", "Le slug doit contenir uniquement des minuscules, chiffres et tirets.");
  if (!payload.title_fr || !payload.title_ar || !payload.title_en) fail("blog", "Les titres sont requis dans les trois langues.");
  if (!payload.content_fr || !payload.content_ar || !payload.content_en) fail("blog", "Les contenus sont requis dans les trois langues.");

  const result = id
    ? await supabase.from("blog_posts").update(payload).eq("id", id)
    : await supabase.from("blog_posts").insert(payload);
  if (result.error) fail("blog", result.error.message);
  refreshAdmin();
  adminRedirect("blog", undefined, id ? "Article mis à jour." : "Article créé.");
}

export async function deleteBlogPost(formData: FormData) {
  const supabase = await adminClient();
  const id = text(formData.get("id"));
  if (!id) fail("blog", "Article introuvable.");
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) fail("blog", error.message);
  refreshAdmin();
  adminRedirect("blog", undefined, "Article supprimé.");
}

export async function updateQuoteStatus(formData: FormData) {
  const supabase = await adminClient();
  const id = text(formData.get("id"));
  const status = text(formData.get("status"));
  const allowed = ["pending", "contacted", "quoted", "confirmed", "completed", "cancelled"];
  if (!id || !allowed.includes(status)) fail("quotes", "Statut invalide.");
  const { error } = await supabase.from("corporate_quotes").update({ status }).eq("id", id);
  if (error) fail("quotes", error.message);
  refreshAdmin();
  adminRedirect("quotes", undefined, "Statut du devis mis à jour.");
}

export async function deleteQuote(formData: FormData) {
  const supabase = await adminClient();
  const id = text(formData.get("id"));
  if (!id) fail("quotes", "Demande introuvable.");
  const { error } = await supabase.from("corporate_quotes").delete().eq("id", id);
  if (error) fail("quotes", error.message);
  refreshAdmin();
  adminRedirect("quotes", undefined, "Demande supprimée.");
}

export async function updateContactStatus(formData: FormData) {
  const supabase = await adminClient();
  const id = text(formData.get("id"));
  const status = text(formData.get("status"));
  const allowed = ["new", "read", "replied", "archived"];
  if (!id || !allowed.includes(status)) fail("messages", "Statut de message invalide.");
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
  if (error) fail("messages", error.message);
  refreshAdmin();
  adminRedirect("messages", undefined, "Message mis à jour.");
}

export async function deleteContactMessage(formData: FormData) {
  const supabase = await adminClient();
  const id = text(formData.get("id"));
  if (!id) fail("messages", "Message introuvable.");
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) fail("messages", error.message);
  refreshAdmin();
  adminRedirect("messages", undefined, "Message supprimé.");
}

export async function signOutAdmin() {
  if (getSupabaseEnv()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[admin_signout]", error);
    }
  }
  revalidatePath("/admin");
  redirect("/admin/login");
}
