# Lightroom Analytics Browser App

Een krachtige, privacy-vriendelijke browserapplicatie voor het analyseren van Adobe Lightroom catalogi (.lrcat). Geheel lokaal, supersnel en met prachtige visualisaties.

## 🌟 Kenmerken

- **100% Lokaal & Privacy**: Je data verlaat nooit je browser. De verwerking gebeurt volledig aan de client-zijde via SQLite WASM.
- **Uitgebreide Statistieken**:
  - **Dashboard**: Totaaloverzicht van foto's, picks en maandelijkse activiteit.
  - **Verkennen**: Verdeling per camera en lens met interactieve grafieken.
  - **EXIF Analyse**: Gedetailleerde histogrammen voor brandpuntsafstand, sluitertijd (in fracties), diafragma (f-stops) en ISO.
  - **Correlaties**: Scatterplots om de relatie tussen Diafragma, Sluitertijd en ISO te ontdekken.
  - **Hit Rates**: Analyseer welke brandpuntsafstanden de meeste 'picks' opleveren.
  - **Kwaliteit & Bewerking**: Inzicht in waarderingen en de gemiddelde hoeveelheid bewerkingen per lens/camera.
- **Geavanceerde Filters**: Filter de gehele applicatie op datum (maand), camera en specifieke lenzen.
- **Lens Mapping**: Groepeer verschillende lens-namen (bijv. van verschillende camera-mounts) onder één noemer voor een zuiverder overzicht.
- **Cross-Platform**: Werkt op Windows, macOS en Linux (omdat het volledig in de browser draait).
- **PWA Ready**: Kan geïnstalleerd worden als een desktop-applicatie en werkt offline.

## 🚀 Distributie & Gebruiksgemak

Om de installatie zo eenvoudig mogelijk te houden, raden we de volgende twee methoden aan:

### 1. Online Hosting (Nul Stappen)
De eenvoudigste manier om deze app te gebruiken is door de `dist` map op een webserver te plaatsen (bijv. GitHub Pages of Vercel).
- **Instructie**: Klik op de link en gebruik de app direct. Er is *geen* installatie nodig op de computer van de eindgebruiker.

### 2. Als Desktop Applicatie (PWA)
Zodra de app online staat (of lokaal draait), kun je deze "Installeren" via je browser (klik op het installatie-icoontje in de adresbalk).
- **Voordeel**: De app verschijnt in je applicatielijst, krijgt een eigen icoon en werkt **volledig offline** zonder dat je Node.js of de terminal nodig hebt.

### 3. Portable Versie (Lokale ZIP)
Je kunt een ZIP-bestand maken van de `dist` map. Om deze zonder Node.js te starten, kun je een simpel launcher-script toevoegen:
- **Mac/Linux**: Gebruik `python3 -m http.server 8080`.
- **Windows**: Gebruik een kleine portable webserver (zoals `http-server`).

## 📖 Gebruik

1.  **Import**: Klik op het Dashboard op "Import .lrcat" en selecteer je Lightroom catalogus bestand.
    *   *Opmerking: Grotere catalogi kunnen enkele seconden duren om te initialiseren.*
2.  **Navigatie**: Gebruik de bovenste navigatiebalk om tussen de verschillende analyses te wisselen.
3.  **Filters**: Gebruik de filterbalk bovenin om in te zoomen op specifieke periodes of gear.
4.  **Lens Config**: Als je lenzen hebt met inconsistente namen, gebruik dan de "Lens Config" pagina om ze te groeperen.

## 🛠️ Technologie Stack

- **Framework**: React 19 (Vite)
- **Database**: @sqlite.org/sqlite-wasm
- **Grafieken**: Chart.js & react-chartjs-2
- **Styling**: Tailwind CSS (met custom Glassmorphism design)
- **Iconen**: Lucide React
- **Animaties**: Framer Motion

## 📄 Licentie

Dit project is ontwikkeld voor persoonlijk gebruik en educatieve doeleinden.
