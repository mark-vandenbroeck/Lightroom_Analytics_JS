import { useState, createContext, useContext, useEffect } from 'react';

const translations = {
  // Navigation
  "nav_dashboard": {"en": "Dashboard", "nl": "Overzicht"},
  "nav_explore": {"en": "Explore", "nl": "Verken"},
  "nav_exif": {"en": "EXIF Analytics", "nl": "EXIF Analyse"},
  "nav_correlations": {"en": "Correlations", "nl": "Correlaties"},
  "nav_hitrates": {"en": "Hit Rates", "nl": "Hit Rates"},
  "nav_quality": {"en": "Quality & Edits", "nl": "Kwaliteit & Edits"},
  "nav_lensprofiles": {"en": "Lens Profiles", "nl": "Lens Profielen"},
  "nav_lensconfig": {"en": "Lens Config", "nl": "Lens Config"},

  // Dashboard / Welcome
  "dash_welcome": {"en": "Welcome to Lightroom Analytics", "nl": "Welkom bij Lightroom Analytics"},
  "dash_intro": {"en": "Unlock deep insights from your photography catalog. Import your .lrcat file to get started.", "nl": "Krijg diepe inzichten in je fotografie. Importeer je .lrcat bestand om te beginnen."},
  "dash_import_btn": {"en": "Select .lrcat File", "nl": "Selecteer .lrcat Bestand"},
  "dash_import_loading": {"en": "Processing catalog...", "nl": "Catalogus verwerken..."},
  "dash_update": {"en": "Import Catalog", "nl": "Catalogus importeren"},
  "dash_summary": {"en": "Overview of your photographic activity", "nl": "Overzicht van je fotografische activiteit"},
  "dash_activity": {"en": "Monthly Activity", "nl": "Maandelijkse Activiteit"},
  
  // Filters
  "filters_title": {"en": "Data Filters", "nl": "Data Filters"},
  "filters_from": {"en": "From Month", "nl": "Vanaf"},
  "filters_to": {"en": "To Month", "nl": "Tot"},
  "filters_apply": {"en": "Apply Filters", "nl": "Filters Toepassen"},
  
  // Explore
  "explore_title": {"en": "Gear Exploration", "nl": "Gear Verkenning"},
  "explore_desc": {"en": "Analyze the distribution of your cameras and lenses.", "nl": "Analyseer de verdeling van je camera's en lenzen."},
  "explore_empty": {"en": "No gear data found", "nl": "Geen gear data gevonden"},
  "explore_empty_desc": {"en": "Import a catalog to see your gear distribution.", "nl": "Importeer een catalogus om je gear verdeling te zien."},
  "explore_camera_share": {"en": "Camera Share", "nl": "Camera Verdeling"},
  "explore_lens_share": {"en": "Lens Share", "nl": "Lens Verdeling"},
  "explore_top_lenses": {"en": "Most Used Lenses", "nl": "Meest Gebruikte Lenzen"},
  "filter_all_cameras": {"en": "All Cameras", "nl": "Alle Camera's"},
  "filter_all_lenses": {"en": "All Lenses", "nl": "Alle Lenzen"},
  "filter_camera": {"en": "Camera", "nl": "Camera"},
  "filter_lens": {"en": "Lens", "nl": "Lens"},
  
  // EXIF
  "exif_title": {"en": "EXIF Analytics", "nl": "EXIF Analyse"},
  "exif_focal": {"en": "Focal Length Usage", "nl": "Brandpuntsafstand Gebruik"},
  "exif_aperture": {"en": "Aperture Preferences", "nl": "Diafragma Voorkeuren"},
  "exif_shutter": {"en": "Shutter Speed Distribution", "nl": "Sluitertijd Verdeling"},
  "exif_iso": {"en": "ISO Distribution", "nl": "ISO Verdeling"},

  // Scatter / Correlations
  "scatter_title": {"en": "Settings Correlations", "nl": "Instellingen Correlaties"},
  "scatter_desc": {"en": "Examine how your camera settings relate to each other.", "nl": "Bekijk hoe je camera-instellingen met elkaar samenhangen."},
  "scatter_aperture_shutter": {"en": "Aperture vs Shutter Speed", "nl": "Diafragma vs Sluitertijd"},
  "scatter_iso_shutter": {"en": "ISO vs Shutter Speed", "nl": "ISO vs Sluitertijd"},
  "scatter_aperture_iso": {"en": "Aperture vs ISO", "nl": "Diafragma vs ISO"},
  "axis_aperture": {"en": "Aperture (f)", "nl": "Diafragma (f)"},
  "axis_shutter": {"en": "Shutter Speed (s)", "nl": "Sluitertijd (s)"},
  "axis_iso": {"en": "ISO", "nl": "ISO"},

  // Hit Rates
  "hit_title": {"en": "Hit Rates", "nl": "Hit Rates"},
  "hit_desc": {"en": "Find your 'sweet spots' by analyzing pick rates per focal length.", "nl": "Vind je 'sweet spots' door pick rates per brandpuntsafstand te analyseren."},
  "hit_focal": {"en": "Pick Rate per Focal Length", "nl": "Pick Rate per Brandpuntsafstand"},

  // Edits
  "edits_title": {"en": "Quality & Edits", "nl": "Kwaliteit & Bewerkingen"},
  "edits_desc": {"en": "Analyze your ratings and editing intensity.", "nl": "Analyseer je ratings en intensiteit van bewerken."},
  "edits_stars": {"en": "Rating Distribution", "nl": "Rating Verdeling"},
  "edits_lens": {"en": "Avg. Edits per Lens", "nl": "Gem. Bewerkingen per Lens"},
  "edits_camera": {"en": "Avg. Edits per Camera", "nl": "Gem. Bewerkingen per Camera"},

  // Lens Profile
  "lens_title": {"en": "Lens Profile", "nl": "Lens Profiel"},
  "lens_desc": {"en": "Deep dive into the focal length usage of a specific lens.", "nl": "Diepe duik in het gebruik van een specifieke lens."},
  "lens_select_label": {"en": "Select Lens", "nl": "Selecteer Lens"},
  "lens_focal": {"en": "Focal Length Distribution", "nl": "Brandpuntsafstand Verdeling"},
  "lensprof_select": {"en": "Choose a lens", "nl": "Kies een lens"},
  "lensprof_hitrate": {"en": "Hit Rate", "nl": "Hit Rate"},

  // Config
  "config_title": {"en": "Lens Mappings", "nl": "Lenzen Koppelen"},
  "config_desc": {"en": "Group different variations of the same lens into a single display name.", "nl": "Groepeer verschillende variaties van dezelfde lens onder één weergavenaam."},
  "config_save": {"en": "Save Mappings", "nl": "Koppelingen Opslaan"},
  "config_success": {"en": "Mappings saved successfully!", "nl": "Koppelingen succesvol opgeslagen!"},
  "config_col_original": {"en": "Original Lens Name", "nl": "Originele Lensnaam"},
  "config_col_photos": {"en": "Photos", "nl": "Foto's"},
  "config_col_group": {"en": "Display Group Name", "nl": "Weergavenaam Groep"},
  "dash_metric_total": {"en": "Total Photos", "nl": "Totaal Foto's"},
  "dash_metric_picks": {"en": "Picks", "nl": "Geselecteerd"},
  "dash_metric_months": {"en": "Months Active", "nl": "Maanden Actief"},
  "dash_metric_avg": {"en": "Avg / Month", "nl": "Gem. / Maand"},
  "label_photos": {"en": "Photos", "nl": "Foto's"},
  "label_picks": {"en": "Picks", "nl": "Geselecteerd"}
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key) => {
    if (!translations[key]) return key;
    return translations[key][lang] || translations[key]['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
