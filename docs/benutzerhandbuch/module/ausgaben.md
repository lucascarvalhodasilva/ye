# 💶 Ausgaben - Private Ausgaben verwalten

Das **Ausgaben-Modul** erfasst **private Ausgaben**, die Sie im Blick behalten möchten, aber **nicht steuerlich absetzbar** sind.

---

## 📊 Überblick

Das Modul bietet:

- ✅ **Kategorisierung** – Essen, Transport, Unterkunft, Sonstiges
- ✅ **Belegverwaltung** – Fotos und PDFs hochladen
- ✅ **PDF-Viewer** – Integrierte Anzeige von PDF-Belegen
- ✅ **Monatsweise Gruppierung** – Übersichtliche Organisation
- ✅ **Such- und Filterfunktion** – Schnell finden
- ✅ **Swipe-Gesten** – Bearbeiten und Löschen
- ✅ **Tabellenansicht** – Detaillierte Auswertungen

---

## 🎯 Zweck des Moduls

### Warum private Ausgaben erfassen?

**Wichtig:** Diese Ausgaben sind **NICHT steuerlich absetzbar**!

**Nutzen:**
1. **Überblick** über Ihre Gesamtausgaben
2. **Budgetierung** – Monatliche Kontrolle
3. **Netto-Bilanz** – Dashboard zeigt: Werbungskosten - Private Ausgaben
4. **Dokumentation** – Belege digital archivieren

**Beispiele:**
- Privates Mittagessen (nicht beruflich)
- Hotelübernachtung (privat)
- Tankfüllung (privater PKW)
- Einkäufe unterwegs

---

## 🎯 Hauptfunktionen

### 1. Ausgabe hinzufügen

**➕-Button** oben rechts öffnet das Formular.

```
┌─────────────────────────────────────────┐
│ Ausgabe hinzufügen                      │
├─────────────────────────────────────────┤
│ Datum: [25.01.2026]                     │
│                                         │
│ Betrag: [25,00] €                       │
│                                         │
│ Kategorie: [Essen & Trinken ▼]         │
│                                         │
│ Beschreibung: [Mittagessen Restaurant]  │
│                                         │
│ Beleg: [📷 Foto aufnehmen]              │
│        [📁 Datei auswählen]             │
│                                         │
│        [Ausgabe speichern]              │
└─────────────────────────────────────────┘
```

**Pflichtfelder:**
- ✅ Datum
- ✅ Betrag
- ✅ Kategorie

**Optional:**
- Beschreibung (empfohlen)
- Beleg (empfohlen)

---

### 2. Kategorien

Wählen Sie aus **4 vordefinierten Kategorien**:

#### 🍽️ Essen & Trinken

```
Beispiele:
- Restaurant-Besuche
- Café
- Snacks unterwegs
- Lebensmittel-Einkäufe (privat)
```

#### 🚗 Transport

```
Beispiele:
- Taxi (privat)
- Tank-Füllung (privater PKW)
- Parkgebühren (privat)
- Mietwagen (privat)
```

#### 🏨 Unterkunft

```
Beispiele:
- Hotel-Übernachtung (privat)
- Airbnb
- Pension
```

#### 📦 Sonstiges

```
Beispiele:
- Kleidung
- Elektronik (privat)
- Freizeit-Aktivitäten
- Geschenke
```

**Kategorie ändern:**  
Kann später beim Bearbeiten geändert werden.

---

### 3. Belegverwaltung

Jede Ausgabe kann **einen Beleg** haben (Foto oder PDF).

#### Beleg fotografieren

1. **Tippen:** "📷 Foto aufnehmen"
2. **Kamera öffnet sich** (Berechtigung erforderlich)
3. **Foto machen** von:
   - Kassenbon
   - Rechnung
   - Quittung

4. **Automatische Komprimierung** (spart Speicher)
5. **Sofort verfügbar** in der Ausgabe

#### Beleg aus Galerie/Dateien

1. **Tippen:** "📁 Datei auswählen"
2. **Datei-Browser öffnet sich**
3. **Unterstützte Formate:**
   - 📷 Bilder: JPG, PNG
   - 📄 Dokumente: PDF

4. **Datei auswählen** → Wird importiert

#### Beleg ansehen

**In der Ausgaben-Liste:**
1. **Tippen** auf Ausgabe mit 📎-Symbol
2. **Vollbild-Viewer** öffnet sich

**Für Bilder:**
- Zoom (Pinch-Geste)
- Pan (verschieben)
- Drehen (zukünftig)

**Für PDFs:**
- Seitenweise Navigation (◀ ▶)
- Zoom
- Vollbild-Modus
- Hochwertige Darstellung

---

### 4. Ausgaben-Liste

Nach dem Hinzufügen sehen Sie:

```
┌─────────────────────────────────────────┐
│ Ausgaben (2026)                         │
│ [🔍 Suche...] [📊 Tabelle]              │
├─────────────────────────────────────────┤
│ ▼ Januar 2026 (5 Ausgaben)              │
│                                         │
│ 25.01. 🍽️ Mittagessen Restaurant    📎 │
│        € 25,00                          │
│        [← Wischen für Optionen →]       │
│                                         │
│ 22.01. 🚗 Tankfüllung                   │
│        € 65,00                          │
│                                         │
│ 18.01. 🏨 Hotel-Übernachtung        📎  │
│        € 89,00                          │
│                                         │
│ 15.01. 📦 Schuhe                        │
│        € 79,99                          │
│                                         │
│ 10.01. 🍽️ Café                      📎 │
│        € 4,50                           │
└─────────────────────────────────────────┘
```

#### Features

**Swipe-Gesten:**
- **Nach links wischen** → 🗑️ Löschen
- **Nach rechts wischen** → ✏️ Bearbeiten

**Icons nach Kategorie:**
- 🍽️ = Essen & Trinken
- 🚗 = Transport
- 🏨 = Unterkunft
- 📦 = Sonstiges

**Beleg-Symbol:**
- 📎 = Beleg vorhanden (klickbar)
- Kein Symbol = Kein Beleg

---

### 5. Such- und Filterfunktion

**Suchfeld oben:**

```
[🔍 Mittagessen...]
```

**Funktionsweise:**
- Sucht in **Beschreibung**
- Sucht in **Kategorie**
- Echtzeit-Filterung (sofort während Tippen)
- Groß-/Kleinschreibung egal

**Beispiele:**
```
"essen" → Findet alle Essen & Trinken
"hotel" → Findet Unterkunft-Ausgaben
"Januar" → Filtert nach Monat (zukünftig)
```

---

### 6. Tabellenansicht

Für **detaillierte Auswertungen**:

1. **Tippen** auf "📊 Tabelle" (oben rechts)
2. **Vollbild-Tabelle** öffnet sich

```
┌──────────────────────────────────────────────────────────┐
│ Ausgaben-Tabelle (2026)                                  │
├──────────────────────────────────────────────────────────┤
│ Datum  │ Kategorie        │ Beschreibung   │ Betrag      │
├──────────────────────────────────────────────────────────┤
│ 25.01. │ Essen & Trinken  │ Mittagessen    │ € 25,00     │
│ 22.01. │ Transport        │ Tankfüllung    │ € 65,00     │
│ 18.01. │ Unterkunft       │ Hotel          │ € 89,00     │
│ 15.01. │ Sonstiges        │ Schuhe         │ € 79,99     │
│ 10.01. │ Essen & Trinken  │ Café           │ € 4,50      │
├──────────────────────────────────────────────────────────┤
│ Gesamt │                  │ 5 Ausgaben     │ € 263,49    │
└──────────────────────────────────────────────────────────┘
```

**Nutzung:**
- Horizontal scrollen (mobile)
- Sortierung nach Datum
- Summe automatisch berechnet

---

## 💡 Praktische Tipps

### Tipp 1: Belege sofort fotografieren

**Direkt an der Kasse:**
1. Beleg erhalten
2. App öffnen
3. ➕ → Foto machen
4. Später Betrag/Kategorie ergänzen

**Vorteil:**  
Beleg nicht verlieren, später in Ruhe kategorisieren.

### Tipp 2: Wöchentliche Review

**Jeden Sonntag:**
1. Ausgaben-Liste durchgehen
2. Fehlende Belege nachtragen
3. Kategorien überprüfen
4. Summe checken

**Frage:** "Sind die Ausgaben plausibel?"

### Tipp 3: Budgetierung

**Monatslimit setzen (mental):**

```
Budget: €500/Monat für Essen
──────────────────────────────
Bisher: €263,49
Verbleibend: €236,51
```

App zeigt Summen automatisch (Tabellenansicht).

### Tipp 4: Kategorien konsistent nutzen

**Immer gleich kategorisieren:**
- Alle Restaurants → "Essen & Trinken"
- Alle Tankfüllungen → "Transport"
- Niemals wechseln!

**Vorteil:** Bessere Auswertung über Monate hinweg.

---

## ❓ Häufige Fragen

### "Sind private Ausgaben steuerlich absetzbar?"

**NEIN!**

Private Ausgaben sind **nicht** steuerlich absetzbar.

**Zweck dieses Moduls:**
- Eigene Dokumentation
- Budgetkontrolle
- Netto-Bilanz auf Dashboard

**Steuerlich absetzbar:**
- Fahrten (Modul "Fahrten")
- Arbeitsmittel (Modul "Ausstattung")

### "Kann ich Kategorien umbenennen?"

**Aktuell nicht.**

Die 4 Kategorien sind **fest vorgegeben**:
1. Essen & Trinken
2. Transport
3. Unterkunft
4. Sonstiges

**Workaround:**  
Nutzen Sie "Sonstiges" für alles, was nicht passt.

**Geplant:** Benutzerdefinierte Kategorien (zukünftige Version).

### "Wie groß dürfen Belege sein?"

**Maximale Dateigröße:**
- Fotos: ~10 MB (nach Komprimierung ~1-2 MB)
- PDFs: ~10 MB pro Datei

**Bei zu großen Dateien:**
- Fehlermeldung erscheint
- Datei wird nicht hochgeladen
- Lösung: PDF komprimieren oder als Foto scannen

### "Kann ich mehrere Belege pro Ausgabe hochladen?"

**Nein, aktuell nur 1 Beleg pro Ausgabe.**

**Workaround:**
- Mehrere Fotos zu einem PDF kombinieren (externe App)
- Oder: Mehrere separate Ausgaben anlegen

**Geplant:** Multi-Beleg-Unterstützung (zukünftig).

### "Was passiert mit Belegen beim Löschen?"

**Beleg wird mit gelöscht!**

Beim Löschen einer Ausgabe:
- ✅ Ausgabe verschwindet aus Liste
- ✅ Beleg wird aus Speicher entfernt
- ❌ **Unwiederbringlich weg** (außer Backup vorhanden)

**Tipp:** Vor Löschen Backup erstellen!

---

## 🔧 Erweiterte Funktionen

### PDF-Viewer-Optimierung

**Features des integrierten PDF-Viewers:**
- Lazy Loading (spart Ressourcen)
- Zoom-Funktion
- Seitennavigation
- Responsive Design (mobile & desktop)

**Performance:**
- Große PDFs können langsam laden
- Geduld haben (Ladebalken)
- Alternativ: Als Bild speichern (schneller)

### Beleg nachträglich hinzufügen

**Ausgabe bereits gespeichert, Beleg später fotografiert?**

1. **Ausgabe bearbeiten** (Swipe → ✏️)
2. **"📷 Foto aufnehmen"** im Formular
3. **Beleg hinzufügen**
4. **Speichern**

Beleg wird hinzugefügt, Ausgabe bleibt gleich.

### Beleg ersetzen

**Schlechtes Foto gemacht?**

1. **Ausgabe bearbeiten**
2. **Neues Foto aufnehmen**
3. **Speichern**

**Achtung:** Altes Foto wird **überschrieben** (nicht beide gespeichert).

---

## 📊 Auswertungen

### Monatssummen

**Automatisch in Gruppen-Headern:**

```
▼ Januar 2026 (5 Ausgaben) → € 263,49
▼ Februar 2026 (3 Ausgaben) → € 180,00
```

**Nutzen:**
- Monatliches Budget prüfen
- Vergleich: Januar vs. Februar
- Trend erkennen

### Dashboard-Integration

**Private Ausgaben erscheinen im Dashboard:**

```
Grand Total:        € 12.450,00
Private Ausgaben:   - € 890,00
────────────────────────────────
Netto-Bilanz:       € 11.560,00
```

**Bedeutung:**  
Zeigt, wie viel Sie nach Abzug privater Ausgaben **netto** steuerlich geltend machen.

### Export (geplant)

**Zukünftige Features:**
- CSV-Export für Excel
- PDF-Monatsübersicht
- Diagramme (Kategorie-Verteilung)

---

## ✅ Checkliste: Ausgaben optimal nutzen

- [ ] Erste private Ausgabe erfasst
- [ ] Beleg fotografiert
- [ ] PDF-Beleg hochgeladen und angesehen
- [ ] Swipe-Gesten getestet
- [ ] Suchfunktion genutzt
- [ ] Tabellenansicht geprüft
- [ ] Monatssummen überprüft

**Alle Punkte erledigt?**  
Sie nutzen das Ausgaben-Modul wie ein **Profi**! 💶

---

## 🚨 Wichtige Hinweise

### ⚠️ Keine Steuerabsetzung

**Nochmals zur Klarstellung:**

Ausgaben in diesem Modul sind **PRIVATE** Ausgaben.

**Steuerlich absetzbar:**
- ❌ Mittagessen (privat)
- ❌ Hotel-Übernachtung (privat)
- ❌ Tankfüllung (privater PKW)

**Steuerlich absetzbar (andere Module):**
- ✅ Verpflegungspauschale (Modul: Fahrten)
- ✅ Kilometergeld (Modul: Fahrten)
- ✅ Arbeitsmittel (Modul: Ausstattung)

### ⚠️ Datenschutz

**Belege enthalten sensible Daten!**
- Kreditkarten-Nummern (teilweise)
- Adressen
- Kaufverhalten

**Tipp:**
- Regelmäßig Backups erstellen
- Backup verschlüsselt speichern
- Nicht unverschlüsselt per E-Mail versenden

---

## 📚 Weiterführende Links

- 📖 [Dashboard](dashboard.md) – Netto-Bilanz verstehen
- 📖 [Fahrten](fahrten.md) – Steuerlich absetzbare Fahrten
- 📖 [Ausstattung](ausstattung.md) – Steuerlich absetzbare Arbeitsmittel
- 📖 [Einstellungen](einstellungen.md) – Backup erstellen

---

**Zurück zu [Fahrten](fahrten.md) | Weiter zu [Ausstattung](ausstattung.md)**
