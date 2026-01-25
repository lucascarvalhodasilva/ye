# 🚗 Fahrten - Fahrtenbuch & Verpflegung

Das **Fahrten-Modul** erfasst alle beruflichen Fahrten mit automatischer Berechnung von **Kilometergeld** und **Verpflegungspauschalen** nach deutschem Steuerrecht.

---

## 📊 Überblick

Das Modul bietet:

- ✅ **Tagesfahrten** – Einfache Hin- und Rückfahrten
- ✅ **Mehrtägige Fahrten** – Mit Übernachtungen
- ✅ **Mehrere Verkehrsmittel** – PKW, Motorrad, Fahrrad, ÖPNV
- ✅ **Automatische Pauschalen** – €14 / €28 Verpflegung
- ✅ **Belegverwaltung** – Fotos von Tankquittungen, Tickets
- ✅ **Arbeitgeber-Spesen** – Monatliche Pauschalen erfassen
- ✅ **Tabellenansicht** – Alle Fahrten auf einen Blick
- ✅ **Monatsweise Gruppierung** – Übersichtliche Organisation

---

## 🎯 Hauptfunktionen

### 1. Fahrt hinzufügen

**➕-Button** oben rechts öffnet das Formular.

#### Tagesfahrt (einfach)

**Beispiel: Hamburg → Berlin (Tagesfahrt)**

```
┌─────────────────────────────────────────┐
│ Fahrt hinzufügen                        │
├─────────────────────────────────────────┤
│ Typ: ○ Tagesfahrt  ● Mehrtägig         │
│                                         │
│ Datum: [25.01.2026]                     │
│                                         │
│ Von: [Hamburg]                          │
│ Nach: [Berlin]                          │
│                                         │
│ Verkehrsmittel:                         │
│ ✓ PKW        📏 290 km                  │
│ ○ Motorrad   📏 0 km                    │
│ ○ Fahrrad    📏 0 km                    │
│ ○ Öffentlich € 0,00                    │
│                                         │
│ Abfahrt: [08:00]  Ankunft: [15:30]     │
│                                         │
│ Beleg: [📷 Foto aufnehmen]              │
│                                         │
│ ═══════════════════════════════════════ │
│ Vorschau:                               │
│ Kilometergeld: € 87,00 (290 km × €0,30)│
│ Verpflegung:   € 14,00 (> 8 Stunden)   │
│ Gesamt:        € 101,00                 │
│ ═══════════════════════════════════════ │
│                                         │
│        [Fahrt hinzufügen]               │
└─────────────────────────────────────────┘
```

**Was wird berechnet?**
1. **Dauer:** 15:30 - 08:00 = 7,5 Stunden → **> 8h** → €14
2. **Kilometergeld:** 290 km × €0,30 = €87,00
3. **Gesamt:** €101,00

#### Mehrtägige Fahrt

**Beispiel: Hamburg → München (2 Tage)**

```
┌─────────────────────────────────────────┐
│ Mehrtägige Fahrt                        │
├─────────────────────────────────────────┤
│ Typ: ○ Tagesfahrt  ● Mehrtägig         │
│                                         │
│ Von Datum: [20.01.2026]                 │
│ Bis Datum: [21.01.2026]                 │
│                                         │
│ Von: [Hamburg]                          │
│ Nach: [München]                         │
│                                         │
│ Verkehrsmittel:                         │
│ ✓ PKW        📏 780 km                  │
│                                         │
│ Abfahrt: [06:00]  Rückkehr: [18:00]    │
│                                         │
│ ═══════════════════════════════════════ │
│ Vorschau:                               │
│ Kilometergeld: € 234,00 (780km × €0,30)│
│ Verpflegung:   € 56,00 (2 Tage × €28)  │
│ Gesamt:        € 290,00                 │
│ ═══════════════════════════════════════ │
└─────────────────────────────────────────┘
```

**Mehrtägige Berechnung:**
- **Tag 1 (Anreise):** €28
- **Tag 2 (Abreise):** €28
- **Gesamt:** €56

---

### 2. Verkehrsmittel

Sie können **mehrere Verkehrsmittel pro Fahrt** kombinieren!

#### PKW (€0,30/km)

```
✓ PKW  📏 [━━━━━━━━━━━━━━━━━━] 290 km
```

- Standard-Fahrzeug für Überführungen
- €0,30 pro Kilometer (gesetzlich)
- Slider bis 1.000 km

#### Motorrad (€0,20/km)

```
✓ Motorrad  📏 [━━━━━━━━━━━] 150 km
```

- €0,20 pro Kilometer
- Slider bis 1.000 km

#### Fahrrad (€0,05/km)

```
✓ Fahrrad  📏 [━━━━━━] 25 km
```

- €0,05 pro Kilometer
- Slider bis 100 km
- Ideal für kurze Strecken zur Bahn

#### Öffentliche Verkehrsmittel (Tatsächliche Kosten)

```
✓ Öffentlich  € [45,00]
```

- **Tatsächliche Kosten** eintragen
- Keine Pauschale, sondern Betrag von der Rechnung
- Beleg hochladen empfohlen!

**Kombinations-Beispiel:**
```
Fahrrad:     10 km × €0,05 = € 0,50 (zum Bahnhof)
Öffentlich:                  € 45,00 (Zug-Ticket)
─────────────────────────────────────────────
Gesamt Fahrtkosten:          € 45,50
```

---

### 3. Belegverwaltung

Jede Fahrt kann **einen Beleg** haben.

#### Beleg fotografieren

1. **Tippen:** "📷 Foto aufnehmen"
2. **Kamera öffnet sich**
3. **Foto machen** von:
   - Tankquittung
   - Parkschein
   - Bahnticket
   - Mautbeleg

4. **App speichert automatisch** (komprimiert)

#### Beleg aus Galerie

1. **Tippen:** "📁 Datei auswählen"
2. **Galerie öffnet sich**
3. **Foto/PDF auswählen**
4. **Wird importiert**

#### Beleg ansehen

In der Fahrten-Liste:
1. **Tippen** auf Fahrt mit Beleg-Symbol (📎)
2. **Vollbild-Viewer** öffnet sich
3. **Zoom** und **Swipe** für Details

---

### 4. Monatliche Spesen (Arbeitgeber)

Viele Arbeitgeber zahlen **pauschale Verpflegungsgelder**.

**So erfassen Sie es:**

1. **Tippen** auf "💼 Monatliche Spesen" (oben im Modul)
2. **Modal öffnet sich**

```
┌─────────────────────────────────────────┐
│ Monatliche Arbeitgeber-Spesen           │
├─────────────────────────────────────────┤
│ Monat: [Januar 2026 ▼]                  │
│                                         │
│ Betrag: [200,00] €                      │
│                                         │
│ ✓ Vom Arbeitgeber erstattet             │
│                                         │
│        [Speichern]                      │
└─────────────────────────────────────────┘
```

3. **Betrag eingeben** (z.B. €200)
4. **Speichern**

**Auswirkung:**
- Betrag wird vom **Grand Total abgezogen**
- Erscheint auf Dashboard als **negative Zahl**
- Verhindert doppelte Absetzung

**Beispiel:**
```
Ihre Verpflegungspauschalen: €500
Arbeitgeber zahlt:           -€200
────────────────────────────────
Absetzbar:                   €300
```

---

### 5. Fahrten-Liste

Nach dem Hinzufügen sehen Sie:

```
┌─────────────────────────────────────────┐
│ Fahrten (2026)                          │
│ [🔍 Suche...] [📊 Tabelle]              │
├─────────────────────────────────────────┤
│ ▼ Januar 2026 (3 Fahrten)               │
│                                         │
│ 25.01. 🚗 Hamburg → Berlin         📎   │
│        € 101,00                         │
│        [← Wischen für Optionen →]       │
│                                         │
│ 20.01. 🚗 Hamburg → München             │
│        € 290,00                         │
│                                         │
│ 15.01. 🚲 Lokale Besorgung              │
│        € 2,50                           │
└─────────────────────────────────────────┘
```

#### Features

**Swipe-Gesten:**
- **Nach links wischen** → 🗑️ Löschen
- **Nach rechts wischen** → ✏️ Bearbeiten

**Monatsgruppen:**
- Klappbar (▼ / ▶)
- Zeigt Anzahl der Fahrten
- Summe pro Monat (zukünftig)

**Suche/Filter:**
- Nach Ziel suchen (z.B. "Berlin")
- Nach Zweck filtern
- Nach Monat eingrenzen

---

### 6. Tabellenansicht

Für **detaillierte Auswertungen**:

1. **Tippen** auf "📊 Tabelle" (oben rechts)
2. **Vollbild-Tabelle** öffnet sich

```
┌──────────────────────────────────────────────────────────┐
│ Fahrten-Tabelle                                          │
├──────────────────────────────────────────────────────────┤
│ Datum  │ Von      │ Nach    │ km   │ Verpfleg.│ Gesamt  │
├──────────────────────────────────────────────────────────┤
│ 25.01. │ Hamburg  │ Berlin  │ 290  │ €14,00   │ €101,00 │
│ 20.01. │ Hamburg  │ München │ 780  │ €56,00   │ €290,00 │
│ 15.01. │ Lokal    │ Lokal   │ 50   │ €0,00    │ €2,50   │
├──────────────────────────────────────────────────────────┤
│ Gesamt │          │         │ 1120 │ €70,00   │ €393,50 │
└──────────────────────────────────────────────────────────┘
```

**Nutzung:**
- Horizontal scrollen für alle Spalten
- Daten kopieren (Desktop)
- Screenshot für Steuerberater

---

## 💡 Praktische Tipps

### Tipp 1: Sofort erfassen

**Direkt nach der Fahrt:**
1. App öffnen
2. Fahrt hinzufügen
3. Belege fotografieren (Tankquittung etc.)

**Vorteil:**  
Nichts vergessen, alle Details frisch im Kopf!

### Tipp 2: Pendelstrecke nutzen

Für **tägliche Fahrten zum Bahnhof**:

1. Einstellungen → Pendelstrecke
2. Einmalig konfigurieren: "5 km Fahrrad zum Bahnhof"
3. Bei Fahrten: Checkbox "Pendelstrecke" aktivieren
4. Automatisch hinzugefügt!

### Tipp 3: Mehrtägige Fahrten

**Übernachtung = €28 pro Tag!**

Beispiel:
```
Montag:   Hamburg → München (€28)
Dienstag: Arbeit in München (€28)
Mittwoch: München → Hamburg (€28)
────────────────────────────────
Gesamt: €84 Verpflegung!
```

### Tipp 4: Kombinierte Verkehrsmittel

**Realität:**  
Fahrrad → Bahnhof → Zug → PKW abholen

**In der App:**
```
✓ Fahrrad:     5 km × €0,05 = €0,25
✓ Öffentlich:  €45,00 (Zug)
✓ PKW:         200 km × €0,30 = €60,00
─────────────────────────────────────
Gesamt: €105,25
```

---

## ❓ Häufige Fragen

### "Wann bekomme ich €14 vs. €28?"

**€14** – Tagesfahrt über 8 Stunden:
```
Abfahrt: 08:00
Ankunft: 17:00
→ 9 Stunden → €14
```

**€28** – Mehrtägige Fahrt:
```
Tag 1 (Anreise):  €28
Tag 2 (Abreise):  €28
→ Pro Tag €28
```

👉 Details: [Verpflegungspauschalen](../steuerrecht/verpflegungspauschalen.md)

### "Kann ich mehrere Fahrten am selben Tag erfassen?"

**Ja, absolut!**

Beispiel:
- Vormittag: Hamburg → Berlin (Überführung)
- Nachmittag: Berlin → Hamburg (Rückfahrt)

Beide separat erfassen → Werden addiert.

### "Was zählt bei 'Von' und 'Nach'?"

**Flexibel:**
- Städtenamen ("Hamburg", "Berlin")
- Adressen ("Hauptbahnhof Hamburg")
- Abkürzungen ("HH", "B")

**Wichtig:** Nur für eigene Dokumentation, hat **keinen Einfluss** auf Berechnung.

### "Wie lade ich einen Beleg nachträglich hoch?"

1. **Fahrt bearbeiten** (nach links wischen → ✏️)
2. **"📷 Foto aufnehmen"** im Formular
3. **Beleg hinzufügen**
4. **Speichern**

Vorhandener Beleg wird überschrieben!

### "Kann ich eine Fahrt duplizieren?"

**Aktuell nicht direkt.**

**Workaround:**
1. Fahrt bearbeiten
2. Alle Daten kopieren (manuell merken)
3. Neue Fahrt anlegen
4. Daten einfügen

**Geplant:** "Duplizieren"-Funktion in zukünftiger Version.

---

## 🔧 Erweiterte Funktionen

### Verpflegung manuell überschreiben

**Standardmäßig automatisch**, aber Sie können:
1. Fahrt bearbeiten
2. Verpflegung auf €0 setzen (wenn bereits vom AG bezahlt)
3. Speichern

**Anwendungsfall:**  
Arbeitgeber hat Hotelfrühstück gebucht → Keine eigene Verpflegungspauschale.

### Pendelstrecke pro Fahrt

**Wenn konfiguriert** (Einstellungen):
- Checkbox "Pendelstrecke hinzufügen" im Formular
- Automatisch 2× Entfernung (hin & zurück)

Beispiel:
```
Pendelstrecke: 5 km Fahrrad
→ Bei Fahrt: Automatisch 10 km (hin & zurück)
```

---

## 📊 Statistiken & Auswertungen

### Monatssummen (in Planung)

**Zukünftige Features:**
- Summe pro Monat in Gruppen-Header
- Diagramm: Fahrten pro Monat
- Durchschnittliche Fahrtkosten

### Export-Funktionen

**Aktuell:**
- Backup mit allen Fahrten
- Tabellenansicht → Screenshot

**Geplant:**
- CSV-Export für Excel
- PDF-Jahresbericht
- Direkter E-Mail-Versand an Steuerberater

---

## ✅ Checkliste: Fahrten optimal nutzen

- [ ] Erste Fahrt erfasst
- [ ] Beleg fotografiert
- [ ] Mehrtägige Fahrt getestet
- [ ] Kombinierte Verkehrsmittel genutzt
- [ ] Monatliche Spesen eingetragen
- [ ] Tabellenansicht geprüft
- [ ] Swipe-Gesten bekannt

**Alle Punkte erledigt?**  
Sie nutzen das Fahrten-Modul wie ein **Profi**! 🚗

---

## 📚 Weiterführende Links

- 📖 [Verpflegungspauschalen](../steuerrecht/verpflegungspauschalen.md) – €14 vs. €28 detailliert
- 📖 [Kilometerpauschalen](../steuerrecht/kilometerpauschalen.md) – Alle Sätze erklärt
- 📖 [Praxisbeispiele](../steuerrecht/praxisbeispiele.md) – Schritt-für-Schritt Szenarien
- 📖 [Einstellungen](einstellungen.md) – Pendelstrecke konfigurieren

---

**Zurück zu [Dashboard](dashboard.md) | Weiter zu [Ausgaben](ausgaben.md)**
