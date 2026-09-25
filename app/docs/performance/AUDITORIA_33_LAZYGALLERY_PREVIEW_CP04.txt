import { lazy } from "react";

export const LazyClubGallery = lazy(() => import("../ClubGallery.jsx"));

export const lazyGalleryAudit33 = {
  section: "club-gallery",
  label: "Galería del club",
  status: "prepared",
  critical: false,
  protectedAreas: [
    "reservas",
    "cancelacion",
    "reprogramacion",
    "auth",
    "worker",
    "make",
    "airtable",
    "supabase",
    "stripe",
    "endpoints",
    "secrets"
  ]
};
