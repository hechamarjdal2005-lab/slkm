import type { ServiceOffer } from "./types";

export const DEFAULT_SERVICES: ServiceOffer[] = [
    {
      image_url: "/images/service-personnel.jpg",
      title_fr: "Transport du personnel",
      title_ar: "نقل الموظفين",
      title_en: "Staff transport",
      description_fr: "Navettes quotidiennes, ramassage à domicile ou points fixes, coordination avec vos horaires d'équipe.",
      description_ar: "رحلات يومية، جمع من المنازل أو نقاط محددة، وتنسيق مع مواعيد فرقكم.",
      description_en: "Daily shuttles, home or fixed-point pickups, coordinated with your team schedules.",
    },
    {
      image_url: "/images/service-tourism.jpg",
      title_fr: "Voyages touristiques",
      title_ar: "رحلات سياحية",
      title_en: "Tourism trips",
      description_fr: "Circuits pour agences, associations et groupes privés, avec chauffeurs expérimentés et autocars grand tourisme.",
      description_ar: "برامج للوكالات والجمعيات والمجموعات الخاصة، مع سائقين متمرسين وحافلات سياحية.",
      description_en: "Itineraries for agencies, associations and private groups, with experienced drivers and touring coaches.",
    },
    {
      image_url: "/images/service-school.jpg",
      title_fr: "Sorties scolaires",
      title_ar: "رحلات مدرسية",
      title_en: "School trips",
      description_fr: "Transport sécurisé pour écoles et centres de formation, avec encadrement et documents de voyage.",
      description_ar: "نقل آمن للمدارس ومراكز التكوين، مع مرافقة ووثائق السفر.",
      description_en: "Safe transport for schools and training centres, with supervision and travel documents.",
    },
  ];
