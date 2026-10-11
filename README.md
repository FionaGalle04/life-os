# LIFE-OS ✦

Ein persönliches Life OS im warmen Soft-Academia-Design. Der erste nutzbare Bereich ist das Trainingsjournal für Gym, Radfahren, Laufen und Schwimmen. Kalender, Studium, Projekte, Finanzen und Fokus sind weiterhin als geplant markiert.

## Schon benutzbar

- Trainings anlegen, bearbeiten, löschen und als Vorlage wiederverwenden.
- Gym: mehrere Übungen und Sätze mit Gewicht, Wiederholungen, RIR und Satznotizen. Leere zusätzliche Sätze werden nicht gespeichert; 0 kg steht für Körpergewicht.
- Ausdauer: Datum, Dauer, Distanz in km, optionale Höhenmeter, Belastung und Notizen. Für 500 m Schwimmen 0,5 km eintragen.
- Entwürfe bleiben beim Schließen, Navigieren und Neuladen erhalten. Das Ersetzen oder Verwerfen benötigt eine Bestätigung.
- Sportfilter, Kennzahlen und Pausentimer mit Pause/Fortsetzen.
- JSON-Export und Import als Datensicherung. Beim Import bleiben vorhandene IDs unverändert; doppelte Einträge werden vermieden.
- Lokale Speicherung ohne Konto; installierbare PWA mit Offline-App-Hülle nach dem ersten erfolgreichen Online-Aufruf.
- Optionaler Supabase-Sync mit getrennten Kontocaches und dauerhaft gespeicherter Warteschlange für Änderungen und Löschungen. Der Status meldet erst nach erfolgreicher Übertragung „synchronisiert“.

Es werden keine fiktiven Beispieltrainings als echte Einheiten gezählt. Vorhandene echte Daten aus dem ursprünglichen lokalen Speicher werden weitergelesen. Beschädigte Speicherstände werden nicht automatisch überschrieben. Browserdaten können durch Löschen des Gerätespeichers verloren gehen; nutze den Export regelmäßig.

## Lokal starten

Node.js 22.13 oder neuer und npm:

```sh
npm ci
npm run dev
```

Die lokale URL wird von Vite ausgegeben. Zum Prüfen des Produktionsbuilds:

```sh
npm run check
npm run preview
```

Browserprüfungen (Chromium, Desktop und iPhone-ähnliche Bildschirmgröße):

```sh
npx playwright install chromium
npm run test:e2e
```

Bei bereits installiertem Chromium kann `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` gesetzt werden. Die mobile Emulation ersetzt keinen Test auf einem echten iPhone.

## Auf dem Handy installieren

Die veröffentlichte HTTPS-Adresse zunächst online öffnen und vollständig laden lassen. Auf dem iPhone in Safari: Teilen → Zum Home-Bildschirm. Auf Desktop/Android die Installationsfunktion des Browsers verwenden. Die App-Dateien werden offline bereitgehalten; Daten bleiben im jeweiligen Browserprofil. Cloud-Anmeldung und Synchronisierung benötigen eine Verbindung.

## Optionalen Cloud-Sync einrichten

1. Das Supabase-Projekt verwenden und die Dateien in `supabase/migrations/` mit der registrierten Migrationshistorie abgleichen. Bereits angewandte Tabellenmigrationen nicht erneut ausführen. Die Tabelle `workout_sessions` benötigt aktivierte RLS und die enthaltenen Nutzerzugriffsregeln.
2. Lokal `.env.example` nach `.env.local` kopieren und `VITE_SUPABASE_URL` sowie `VITE_SUPABASE_PUBLISHABLE_KEY` setzen. Keine Service-Role-Schlüssel in den Client geben.
3. Für GitHub Pages dieselben Namen als Repository-Actions-Secrets einrichten. Supabase Auth muss die genaue veröffentlichte URL als Site-/Redirect-URL erlauben.
4. Neu bauen und deployen. Die Werte werden beim Vite-Build eingebunden; eine spätere Änderung von Hosting-Variablen allein ändert den fertigen statischen Build nicht.
5. Über „Geräte-Sync“ anmelden. Bereits vorhandene anonyme Trainings werden nur nach Klick auf „lokale Trainings in dieses Konto übernehmen“ hinzugefügt. Nach Abmeldung sind ausschließlich anonyme Trainings sichtbar.
6. Auf zwei Geräten Anlegen, Bearbeiten und Löschen prüfen. Bei Rückkehr in die App, wiederhergestellter Verbindung oder „Jetzt abgleichen“ werden offene Änderungen übertragen und der Cloudstand neu geladen.

Bei gleichzeitiger Bearbeitung derselben Einheit auf zwei Geräten gilt die zuletzt übertragene Änderung. Es gibt noch keine Konfliktauflösung oder Echtzeitübertragung. Anonyme Daten verschiedener Hosting-Adressen sind getrennt; zur Übernahme zwischen Adressen Export/Import verwenden.

## Deployment und Prüfstand

Die Pages-Konfiguration verwendet `/life-os/`. Für Hosting am Domain-Wurzelpfad mit `LIFE_OS_BASE_PATH=/ npm run build` bauen. GitHub Pages liefert die statischen Dateien; Supabase ist der optionale Backenddienst. Der Deploy-Workflow baut `main`; ein lokaler Branch oder Draft-PR ist nicht automatisch live.

Automatisierte Prüfungen decken Validierung, lokales Wiederladen, gescheiterte Schreibvorgänge, Offline-Warteschlange, Kontowechsel während laufender Anfragen und veraltete Caches nach Cloud-Löschungen ab. Browserprüfungen erfassen Erstellen/Bearbeiten/Löschen, Entwurfsrettung, alle Ausdauersportarten, Export/Import, schmale Layouts, Timer und Offline-Neuladen. Live-Supabase, E-Mail-Zustellung und echte iPhone-Installation müssen in der eingerichteten Umgebung separat geprüft werden.

## Produktentscheidungen und weitere Arbeit

Palette und Typografie bleiben gemäß [Design System](docs/DESIGN_SYSTEM.md). Kein Habit-Tracker. Kalender-/iCloud-, Strava- und Spotify-Verbindungen bleiben spätere, ausdrücklich autorisierte Integrationen. Vollständige Anforderungen: [Product Spec](docs/PRODUCT_SPEC.md); weitere Schritte: [Implementation Plan](docs/IMPLEMENTATION_PLAN.md). Vor Änderungen [CLAUDE.md](CLAUDE.md) lesen.
