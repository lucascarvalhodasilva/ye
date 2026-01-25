# ⚙️ Einstellungen - Konfiguration & Backup

Das **Einstellungen-Modul** verwaltet die **App-Konfiguration**, **Steuersätze**, **Pendelstrecke** und bietet umfassende **Backup/Restore-Funktionen**.

---

## 📊 Überblick

Das Modul bietet:

- ✅ **Pendelstrecke** – Tägliche Strecke zum Bahnhof konfigurieren
- ✅ **Steuersätze** – Verpflegung, Kilometergeld, GWG-Grenze anpassen
- ✅ **Backup erstellen** – Alle Daten + Belege sichern
- ✅ **Wiederherstellen** – Backup importieren
- ✅ **Belege exportieren** – Alle Fotos als ZIP
- ✅ **Standardwerte** – Auf Werkseinstellungen zurücksetzen

---

## 🎯 Hauptfunktionen

### 1. Pendelstrecke konfigurieren

Für **tägliche Fahrten zum lokalen Bahnhof**.

#### Was ist die Pendelstrecke?

**Szenario:**  
Sie wohnen 5 km vom Bahnhof entfernt und fahren täglich mit dem Fahrrad hin, um Züge für Überführungen zu erreichen.

**Problem ohne Pendelstrecke:**  
Jede Fahrt manuell 2× 5 km = 10 km eintragen.

**Lösung mit Pendelstrecke:**  
Einmalig konfigurieren → Bei jeder Fahrt automatisch hinzufügen.

#### Konfiguration

```
┌─────────────────────────────────────────┐
│ Pendelstrecke                           │
├─────────────────────────────────────────┤
│ Verkehrsmittel:                         │
│                                         │
│ ✓ PKW        📏 5 km                    │
│ ○ Motorrad   📏 0 km                    │
│ ✓ Fahrrad    📏 5 km                    │
│ ○ Öffentlich € 0,00                    │
│                                         │
│ ℹ️ Diese Strecke wird bei Fahrten       │
│   automatisch hinzugefügt (optional)   │
│                                         │
│        [Speichern]                      │
└─────────────────────────────────────────┘
```

**Beispiel-Konfiguration:**
- ✓ Fahrrad: 5 km (Hin- & Rückweg zum Bahnhof)
- Optional: ✓ PKW: 5 km (bei schlechtem Wetter)

#### Nutzung in Fahrten-Modul

Bei Fahrt hinzufügen:
```
☐ Pendelstrecke hinzufügen

Aktiviert → Automatisch:
+ 10 km Fahrrad (2× 5 km)
+ Verpflegung/Kilometergeld entsprechend
```

**Vorteil:**
- Zeitersparnis
- Keine vergessenen Pendelstrecken
- Konsistente Erfassung

---

### 2. Steuersätze anpassen

**Wichtig:** Standardwerte sind **korrekt** nach deutschem Steuerrecht 2024+.

#### Wann anpassen?

**Nur in folgenden Fällen:**
1. **Gesetzesänderung** (z.B. neue Verpflegungssätze)
2. **Sonderregelungen** (z.B. andere Branche)
3. **Testumgebung** (zum Ausprobieren)

**Für normale Nutzung: NICHT ändern!**

#### Verfügbare Einstellungen

```
┌─────────────────────────────────────────┐
│ Steuersätze                             │
├─────────────────────────────────────────┤
│ Verpflegungspauschalen:                 │
│ 8+ Stunden:   [14,00] €                 │
│ 24 Stunden:   [28,00] €                 │
│                                         │
│ Kilometerpauschalen:                    │
│ PKW:          [0,30] € pro km           │
│ Motorrad:     [0,20] € pro km           │
│ Fahrrad:      [0,05] € pro km           │
│                                         │
│ GWG-Grenze:                             │
│ Grenzwert:    [952,00] €                │
│                                         │
│ ⚠️ Änderungen auf eigene               │
│    Verantwortung!                       │
│                                         │
│        [Speichern] [Zurücksetzen]       │
└─────────────────────────────────────────┘
```

#### Standard-Werte (Deutschland 2024+)

| Einstellung | Wert | Gesetzliche Grundlage |
|-------------|------|-----------------------|
| Verpflegung 8h | €14,00 | § 9 Abs. 4a EStG |
| Verpflegung 24h | €28,00 | § 9 Abs. 4a EStG |
| PKW | €0,30/km | § 9 Abs. 1 Nr. 4a EStG |
| Motorrad | €0,20/km | § 9 Abs. 1 Nr. 4a EStG |
| Fahrrad | €0,05/km | Pauschale |
| GWG-Grenze | €952 | § 6 Abs. 2 EStG |

**Tipp:** Nur ändern, wenn Sie **wirklich** wissen, was Sie tun!

#### Änderungen speichern

1. **Wert ändern** (z.B. Verpflegung auf €15)
2. **"Änderungen speichern"-Button** erscheint (grün)
3. **Tippen auf "Speichern"**
4. **Bestätigung:** "Gespeichert!" (kurze Nachricht)

**Zurücksetzen:**
- Button "Zurücksetzen" → Auf Standardwerte zurück

---

### 3. Backup erstellen

**Die wichtigste Funktion für Datensicherheit!**

#### Was wird gesichert?

**Vollständiges Backup enthält:**
- ✅ Alle Fahrten
- ✅ Alle Ausgaben
- ✅ Alle Arbeitsmittel
- ✅ Alle Belege (Fotos & PDFs)
- ✅ Einstellungen (Pendelstrecke, Steuersätze)
- ✅ Monatliche Spesen

**Dateiformat:** `.zip` (komprimiert)

#### Backup erstellen

```
┌─────────────────────────────────────────┐
│ Backup & Export                         │
├─────────────────────────────────────────┤
│ Backup erstellen                        │
│ Alle Daten und Belege sichern           │
│                                         │
│ Letztes Backup: 20.01.2026, 15:30 Uhr  │
│                                         │
│        [Backup erstellen]               │
└─────────────────────────────────────────┘
```

**Schritt-für-Schritt:**
1. **Tippen** auf "Backup erstellen"
2. **Warten** (je nach Datenmenge 5-30 Sekunden)
3. **Datei wird heruntergeladen:**
   - Dateiname: `fleet-steuer-backup-2026-01-25.zip`
   - Speicherort: Downloads-Ordner

4. **Backup sicher aufbewahren!**

**Empfohlene Speicherorte:**
- ☁️ Cloud: Dropbox, Google Drive, iCloud
- 💾 Lokal: PC, externe Festplatte
- 📧 E-Mail: An sich selbst senden

**Frequenz:**
- **Wöchentlich** bei aktiver Nutzung
- **Monatlich** bei gelegentlicher Nutzung
- **Vor Geräte-Wechsel** unbedingt!

---

### 4. Backup wiederherstellen

**Für Geräte-Wechsel oder Datenverlust.**

```
┌─────────────────────────────────────────┐
│ Backup wiederherstellen                 │
│ Daten aus Backup-Datei importieren      │
│                                         │
│ ⚠️ ACHTUNG: Bestehende Daten werden    │
│    ÜBERSCHRIEBEN!                       │
│                                         │
│        [Backup auswählen]               │
└─────────────────────────────────────────┘
```

**Schritt-für-Schritt:**
1. **Tippen** auf "Backup auswählen"
2. **Datei-Browser** öffnet sich
3. **Backup-ZIP auswählen** (z.B. `fleet-steuer-backup-2026-01-25.zip`)
4. **Bestätigung:**
   ```
   ⚠️ WARNUNG
   Alle aktuellen Daten werden ersetzt!
   Fortfahren?
   
   [Abbrechen] [Ja, importieren]
   ```
5. **"Ja, importieren"** tippen
6. **Warten** (Import läuft)
7. **Erfolgreich:** "Backup wiederhergestellt! X Fahrten, Y Ausgaben, Z Ausstattungen"

**Wichtig:**
- ⚠️ **Vorher aktuelles Backup erstellen!**
- ⚠️ Alle bestehenden Daten werden **gelöscht**
- ⚠️ Vorgang kann **nicht rückgängig** gemacht werden

---

### 5. Belege exportieren

**Nur Belege (ohne Daten) exportieren.**

```
┌─────────────────────────────────────────┐
│ Belege exportieren                      │
│ Alle Fotos und PDFs als ZIP             │
│                                         │
│ Anzahl Belege: 47                       │
│ Geschätzte Größe: ~85 MB                │
│                                         │
│        [Belege exportieren]             │
└─────────────────────────────────────────┘
```

**Was wird exportiert?**
- ✅ Alle Fotos (Fahrten, Ausgaben, Ausstattung)
- ✅ Alle PDFs (wenn vorhanden)
- ❌ **Keine Daten** (nur Bilder/PDFs)

**Dateiname:** `fleet-steuer-belege-2026-01-25.zip`

**Anwendungsfälle:**
- An Steuerberater senden (nur Belege, ohne private Daten)
- Archivierung
- Freigabe für Prüfung

**Struktur im ZIP:**
```
belege/
├── fahrten/
│   ├── 2026-01-25_Hamburg-Berlin.jpg
│   └── 2026-01-20_München.jpg
├── ausgaben/
│   ├── 2026-01-22_Mittagessen.jpg
│   └── 2026-01-18_Hotel.pdf
└── ausstattung/
    ├── 2026-01-15_Smartphone.jpg
    └── 2026-03-01_Laptop.jpg
```

---

### 6. Standardwerte wiederherstellen

**Alle Einstellungen auf Werkseinstellungen zurücksetzen.**

```
┌─────────────────────────────────────────┐
│ Standardwerte                           │
│                                         │
│ ⚠️ Setzt ALLE Einstellungen zurück:    │
│ • Pendelstrecke gelöscht                │
│ • Steuersätze auf Standard              │
│                                         │
│ DATEN bleiben ERHALTEN:                 │
│ ✓ Fahrten, Ausgaben, Ausstattung        │
│                                         │
│        [Standardwerte wiederherstellen] │
└─────────────────────────────────────────┘
```

**Was passiert?**
- ✅ Pendelstrecke: **Gelöscht** (auf 0 km)
- ✅ Steuersätze: **Standard** (€14, €28, €0,30, etc.)
- ❌ Fahrten/Ausgaben/Ausstattung: **BLEIBEN**

**Anwendungsfall:**  
Sie haben versehentlich Steuersätze geändert und wollen zurück zu den Standardwerten.

---

## 💡 Praktische Tipps

### Tipp 1: Automatisches wöchentliches Backup

**Routine einrichten:**

**Jeden Sonntag Abend:**
1. App öffnen → Einstellungen
2. Backup erstellen
3. Datei in Cloud hochladen (automatisch, wenn Cloud-App auf Gerät)

**Automatisierung (iOS):**
- Shortcuts-App nutzen
- Erinnerung erstellen

**Automatisierung (Android):**
- Tasker-App
- Wöchentliche Erinnerung

### Tipp 2: Mehrere Backup-Kopien

**3-2-1-Regel:**
- **3** Kopien: Original + 2 Backups
- **2** verschiedene Medien: Cloud + lokale Festplatte
- **1** Kopie offsite: Cloud oder bei Freund/Familie

**Beispiel:**
```
1. Original: In der App
2. Backup 1: Google Drive
3. Backup 2: Externe Festplatte
```

### Tipp 3: Backup vor großen Änderungen

**Immer Backup erstellen vor:**
- App-Update
- Geräte-Wechsel
- Großem Daten-Import
- Massen-Löschen

**Grund:** Falls etwas schief geht, können Sie zurück.

### Tipp 4: Pendelstrecke für Stammstrecke

**Nicht nur für Bahnhof!**

Auch nutzbar für:
- Tägliche Fahrt zur Firma (bei Festanstellung + Überführungen)
- Regelmäßige Strecke zum Depot

**Flexibel:** Optional bei jeder Fahrt aktivierbar.

---

## ❓ Häufige Fragen

### "Wo werden Backups gespeichert?"

**Je nach Plattform:**

**iOS:**
- Standard: iCloud Drive / Dateien-App
- Alternativ: Downloads-Ordner (mit share-function teilen)

**Android:**
- Standard: Downloads-Ordner
- Pfad: `/storage/emulated/0/Download/`

**Web:**
- Standard: Browser-Downloads
- Pfad: Betriebssystem-abhängig (meist `~/Downloads`)

### "Kann ich Backups teilen?"

**Ja!**

**Anwendungsfälle:**
1. **Geräte-Wechsel:** Backup auf neues Gerät übertragen
2. **Sicherung:** An sich selbst per E-Mail senden
3. **Steuerberater:** Backup zur Verfügung stellen (enthält alle Daten!)

**Achtung:** Backup enthält **alle privaten Daten**!  
Nur verschlüsselt oder über sichere Kanäle teilen.

### "Wie groß werden Backups?"

**Abhängig von Anzahl der Belege:**

**Beispiel-Kalkulation:**
```
50 Fahrten (20 mit Beleg à 1 MB) = 20 MB
30 Ausgaben (15 mit Beleg à 1 MB) = 15 MB
10 Ausstattungen (8 mit Beleg à 1 MB) = 8 MB
Daten (JSON) = 0,5 MB
─────────────────────────────────────────
Gesamt: ~43 MB
```

**ZIP-Komprimierung:** ~30-50% Einsparung → **~25-30 MB**

### "Kann ich selektiv importieren?"

**Nein, aktuell nur vollständige Wiederherstellung.**

**Workaround:**
1. Backup auf zweitem Gerät wiederherstellen
2. Manuell gewünschte Einträge übertragen

**Geplant:** Selektiver Import in zukünftiger Version.

### "Was passiert bei Backup-Fehlern?"

**Mögliche Fehler:**

**"Nicht genug Speicherplatz"**
- Belege löschen oder alte Backups entfernen
- Backup auf PC/Cloud erstellen

**"Backup beschädigt"**
- Datei erneut herunterladen
- Älteres Backup verwenden

**"Import fehlgeschlagen"**
- Datei-Format prüfen (muss `.zip` sein)
- App neu starten
- Support kontaktieren

---

## 🔧 Erweiterte Funktionen

### Automatische Backups (geplant)

**Zukünftige Features:**
- [ ] Automatische Backups (täglich/wöchentlich)
- [ ] Cloud-Synchronisation (Google Drive, iCloud)
- [ ] Backup-Verschlüsselung (Passwort-geschützt)
- [ ] Backup-Versionen (mehrere behalten)

### Selektiver Export

**Geplante Exporte:**
- CSV: Nur Fahrten
- CSV: Nur Ausgaben
- PDF: Jahresbericht
- Excel: Alle Daten mit Pivot-Tabellen

---

## 📊 Backup-Strategie

### Empfohlener Backup-Plan

**Wöchentlich (Sonntags):**
- Backup erstellen
- In Cloud hochladen
- Altes Backup (> 4 Wochen) löschen

**Monatlich:**
- Zusätzliches Backup auf PC
- In Ordner: `Backup-Archiv/2026/`

**Jährlich (Dezember):**
- Jahres-Backup erstellen
- Belege exportieren
- An Steuerberater senden
- Original 10 Jahre aufbewahren

### Backup-Checkliste

- [ ] Wöchentliches Backup aktiviert
- [ ] Cloud-Speicher konfiguriert
- [ ] Lokales Backup auf PC/Festplatte
- [ ] Test-Wiederherstellung durchgeführt
- [ ] Notfall-Plan (was tun bei Geräteverlust?)

---

## ✅ Checkliste: Einstellungen optimal nutzen

- [ ] Pendelstrecke konfiguriert (falls nötig)
- [ ] Steuersätze geprüft (Standard = korrekt)
- [ ] Erstes Backup erstellt
- [ ] Backup-Speicherort sicher
- [ ] Wiederherstellung getestet
- [ ] Wöchentliche Backup-Routine etabliert

**Alle Punkte erledigt?**  
Ihre Daten sind **professionell gesichert**! ⚙️

---

## 🚨 Wichtige Hinweise

### ⚠️ Backup-Pflicht

**OHNE BACKUP = DATENVERLUST!**

Szenarien ohne Backup:
- ❌ Gerät verloren → Alle Daten weg
- ❌ App deinstalliert → Alle Daten weg
- ❌ Geräte-Wechsel → Keine Übertragung möglich
- ❌ Browser-Daten gelöscht (Web) → Alle Daten weg

**Lösung:** Regelmäßig Backups erstellen!

### ⚠️ Steuersätze nicht ändern

**Standardwerte sind korrekt!**

Nur ändern bei:
- Gesetzesänderung (Nachricht von uns)
- Steuerberater empfiehlt es
- Test-Zwecke

**Falsche Werte = Falsche Steuererklärung!**

### ⚠️ Backup-Sicherheit

**Backups enthalten ALLE Daten:**
- Fahrtziele (Privatsphäre)
- Ausgaben (finanziell sensitiv)
- Belege (persönliche Dokumente)

**Niemals:**
- ❌ Unverschlüsselt per E-Mail versenden
- ❌ Auf öffentlichem Cloud-Speicher
- ❌ Mit Fremden teilen

**Immer:**
- ✅ Verschlüsselte Cloud (mit 2FA)
- ✅ Lokale Backups auf geschützten Geräten
- ✅ Passwort-geschützte ZIP-Dateien (manuell)

---

## 📚 Weiterführende Links

- 📖 [Schnellstart](../schnellstart.md) – Backup-Hinweise für Einsteiger
- 📖 [Installation](../installation.md) – Backup bei Geräte-Wechsel
- 📖 [Fehlerbehebung](../fehlerbehebung.md) – Backup-Probleme lösen
- 📖 [FAQ](../faq.md) – Häufige Fragen zu Backups

---

**Zurück zu [Ausstattung](ausstattung.md) | Weiter zu [Steuerrecht Grundlagen](../steuerrecht/grundlagen.md)**
