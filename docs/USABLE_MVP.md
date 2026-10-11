# Nutzbarer Fitness-MVP

Abnahmekriterien für diesen Änderungssatz:

1. Eine Gym-Einheit mit Übung und ausgefülltem Satz speichern, Seite neuladen und die Einheit unverändert wiederfinden.
2. Gewicht/Datum/Notizen nachträglich bearbeiten; es bleibt genau eine Einheit mit derselben ID.
3. Angefangene Eingaben nach Navigation oder Neuladen fortsetzen; ein abgebrochener Wechsel der Sportart erhält den Entwurf.
4. Radfahren, Laufen und Schwimmen mit Dauer/Distanz speichern und nach Sportart filtern.
5. Export herunterladen, gelöschte Einheit importieren und doppelte Importe verhindern. Ungültige Dateien verändern keine Daten.
6. Fehlerhafte Zahlen verhindern Speichern; Speicherfehler erhalten den Entwurf und melden keinen Erfolg.
7. Timer bleibt beim Pausieren sichtbar, kann fortgesetzt werden und verarbeitet Hintergrundzeit anhand einer absoluten Endzeit.
8. Bei 320 und 390 px ist das Gym-Formular ohne horizontales Scrollen bedienbar. Numerische Eingaben haben mindestens 44 px Höhe und 16 px Schrift.
9. Die einmal online geladene Produktions-App lädt offline neu; Offline-Änderungen bleiben lokal erhalten.
10. Der optionale Sync beendet einen erfolgreichen Vorgang, hält fehlgeschlagene Änderungen/Löschungen für einen erneuten Versuch vor und trennt laufende Vorgänge verschiedener Konten.

Automatisierte Nachweise stehen in `src/lib/*.test.ts`, `src/App.test.tsx` und `e2e/fitness.spec.ts`. Der Sync wird mit einem kontrollierten Remote-Adapter getestet. Dieser Nachweis ersetzt keine Live-Supabase-Prüfung.

Die vorhandenen Supabase-Migrationsdateien werden durch diesen Änderungssatz nicht umbenannt oder erneut angewandt. Ein Abgleich mit der tatsächlich registrierten Migrationshistorie braucht Zugriff auf das Projekt.

Weiterhin geplant: Kalender/Aufgaben, Studium, Projekte, Finanzen, Pomodoro, Fitnessziele und Fortschrittsdiagramme. Für diesen MVP stehen lokale Nutzung und verlässliche Trainingsaufzeichnungen im Vordergrund.
