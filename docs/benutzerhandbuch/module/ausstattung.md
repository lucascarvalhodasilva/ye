# 🔧 Ausstattung - Arbeitsmittel & GWG

Das **Ausstattung-Modul** verwaltet **Arbeitsmittel** (Arbeitsmittel) mit automatischer Berechnung nach **deutschem Steuerrecht** (GWG-Regelung und Abschreibung).

---

## 📊 Überblick

Das Modul bietet:

- ✅ **GWG-Automatik** – Erkennt Geringwertige Wirtschaftsgüter (≤ €952)
- ✅ **3-Jahres-Abschreibung** – Für Güter > €952
- ✅ **Pro-Rata-Berechnung** – Anteilig nach Kaufmonat
- ✅ **Intelligente Vorschläge** – Häufige Arbeitsmittel
- ✅ **Belegverwaltung** – Fotos von Kaufbelegen
- ✅ **Swipe-Gesten** – Bearbeiten und Löschen
- ✅ **Tabellenansicht** – Detaillierte Auswertungen

---

## 🎯 Was sind Arbeitsmittel?

**Arbeitsmittel** sind Gegenstände, die Sie **beruflich** nutzen:

### ✅ Typische Arbeitsmittel für Fahrzeugüberführer

```
📱 Smartphones & Tablets
💻 Laptops & Computer
🔧 Werkzeuge
📷 Kameras (für Dokumentation)
🎒 Arbeitstasche, Rucksack
👔 Arbeitskleidung (spezifisch)
🔋 Powerbanks, Ladegeräte
📡 Navigationsgeräte
```

### ❌ Nicht als Arbeitsmittel absetzbar

```
❌ Private Kleidung (Jeans, T-Shirts)
❌ Sportgeräte
❌ Unterhaltungselektronik (TV, Spielkonsole)
❌ Möbel für Privatwohnung
```

**Faustregel:** Nur bei **überwiegend beruflicher Nutzung** (> 90%) absetzbar!

---

## 🎯 Hauptfunktionen

### 1. Arbeitsmittel hinzufügen

**➕-Button** oben rechts öffnet das Formular.

```
┌─────────────────────────────────────────┐
│ Arbeitsmittel hinzufügen                │
├─────────────────────────────────────────┤
│ Bezeichnung: [Smartphone]               │
│ 💡 Vorschläge: Laptop, Tablet,          │
│    Werkzeug, Kamera, ...                │
│                                         │
│ Preis: [450,00] €                       │
│                                         │
│ Kaufdatum: [15.01.2026]                 │
│                                         │
│ Beleg: [📷 Foto aufnehmen]              │
│                                         │
│ ═══════════════════════════════════════ │
│ Automatische Berechnung:                │
│                                         │
│ ✅ GWG (€450 ≤ €952)                    │
│ Status: Sofort absetzbar                │
│ Abzugsfähig 2026: € 450,00              │
│ ═══════════════════════════════════════ │
│                                         │
│        [Arbeitsmittel speichern]        │
└─────────────────────────────────────────┘
```

**Automatische Erkennung:**
- Preis ≤ €952 → **GWG** (Geringwertiges Wirtschaftsgut)
- Preis > €952 → **Abschreibung** (3 Jahre, anteilig)

---

### 2. GWG-Regelung (≤ €952)

**Beispiel: Smartphone (€450)**

```
Kaufdatum: 15.01.2026
Preis:     € 450,00
─────────────────────
GWG-Limit: € 952
→ €450 < €952 ✅

Status: "Sofort absetzbar (GWG)"
Abzug 2026: € 450,00 (100%)
```

**Vorteile:**
- ✅ Gesamter Betrag im **Kaufjahr** absetzbar
- ✅ Keine Verteilung über mehrere Jahre
- ✅ Einfache Berechnung

**Gesetzliche Grundlage:**  
§ 6 Abs. 2 EStG – Stand 2024+

---

### 3. Abschreibung (> €952)

**Beispiel: Laptop (€1.500)**

```
Kaufdatum: 01.03.2026 (März)
Preis:     € 1.500,00
─────────────────────
GWG-Limit: € 952
→ €1.500 > €952 → Abschreibung erforderlich

Nutzungsdauer: 3 Jahre (36 Monate)
Kauf im März → 10 Monate im Jahr 2026

Berechnung:
€1.500 ÷ 36 Monate = € 41,67 pro Monat
€41,67 × 10 Monate = € 416,70

Status: "Abschreibung (3 Jahre) - 10 Monate anteilig"
Abzug 2026: € 416,70
Abzug 2027: € 500,00 (12 Monate)
Abzug 2028: € 500,00 (12 Monate)
Abzug 2029: € 83,30 (2 Monate)
```

**Pro-Rata-Regel:**
- Anteilige Berechnung nach **Monaten**
- Kaufmonat wird **voll gezählt** (Tag egal)
- Verteilung über genau **3 Jahre**

---

### 4. Intelligente Vorschläge

Beim Tippen erscheinen **häufige Arbeitsmittel**:

```
Eingabe: "Lap..."

Vorschläge:
● Laptop
● Laptoptasche
```

**Vordefinierte Vorschläge:**
```
📱 Elektronik:
   - Smartphone, Tablet, Laptop
   - Powerbank, Ladegerät
   - Kopfhörer

🔧 Werkzeug:
   - Werkzeugkasten
   - Schraubendreher-Set
   - Taschenlampe

📷 Dokumentation:
   - Kamera
   - Speicherkarte
   - Stativ

👔 Arbeitskleidung:
   - Sicherheitsschuhe
   - Warnweste
   - Arbeitshandschuhe

📦 Sonstiges:
   - Arbeitstasche
   - Rucksack
   - Schreibwaren
```

**Nutzen:**
- Schnellere Eingabe
- Konsistente Bezeichnungen
- Weniger Tippfehler

---

### 5. Arbeitsmittel-Liste

Nach dem Hinzufügen sehen Sie:

```
┌─────────────────────────────────────────┐
│ Ausstattung (2026)                      │
│ [🔍 Suche...] [📊 Tabelle]              │
├─────────────────────────────────────────┤
│ ▼ März 2026 (1 Arbeitsmittel)           │
│                                         │
│ 01.03. 💻 Laptop                    📎  │
│        € 1.500,00                       │
│        Abschreibung (10 Mon.) → €416,70 │
│        [← Wischen für Optionen →]       │
└─────────────────────────────────────────┘
│                                         │
│ ▼ Januar 2026 (2 Arbeitsmittel)         │
│                                         │
│ 15.01. 📱 Smartphone                📎  │
│        € 450,00                         │
│        GWG → Sofort absetzbar           │
│                                         │
│ 10.01. 🔧 Werkzeugkasten                │
│        € 85,00                          │
│        GWG → Sofort absetzbar           │
└─────────────────────────────────────────┘
```

#### Features

**Swipe-Gesten:**
- **Nach links wischen** → 🗑️ Löschen
- **Nach rechts wischen** → ✏️ Bearbeiten

**Status-Anzeige:**
- "GWG → Sofort absetzbar"
- "Abschreibung (X Monate) → €XXX"

**Beleg-Symbol:**
- 📎 = Beleg vorhanden (klickbar)

---

### 6. Tabellenansicht

Für **Jahresübersicht und Steuerberater**:

```
┌──────────────────────────────────────────────────────────────────┐
│ Ausstattung-Tabelle (2026)                                       │
├──────────────────────────────────────────────────────────────────┤
│ Datum  │ Bezeichnung    │ Preis     │ Status    │ Abzug 2026    │
├──────────────────────────────────────────────────────────────────┤
│ 01.03. │ Laptop         │ €1.500,00 │ AfA 10Mon │ € 416,70      │
│ 15.01. │ Smartphone     │ € 450,00  │ GWG       │ € 450,00      │
│ 10.01. │ Werkzeugkasten │ € 85,00   │ GWG       │ € 85,00       │
├──────────────────────────────────────────────────────────────────┤
│ Gesamt │ 3 Arbeitsmittel│ €2.035,00 │           │ € 951,70      │
└──────────────────────────────────────────────────────────────────┘
```

**Spalten:**
- **Datum** – Kaufdatum
- **Bezeichnung** – Name des Arbeitsmittels
- **Preis** – Kaufpreis
- **Status** – GWG oder Abschreibung
- **Abzug 2026** – Steuerlich absetzbar im aktuellen Jahr

---

## 💡 Praktische Tipps

### Tipp 1: GWG-Grenze ausnutzen

**Strategisch kaufen:**

Statt:
```
1× Laptop (€1.500) → Abschreibung 3 Jahre
```

Besser (wenn möglich):
```
1× Laptop (€900) → GWG, sofort absetzbar
1× Tablet (€600) → GWG, sofort absetzbar
────────────────────────────────────────
Gesamt: €1.500, beide sofort absetzbar!
```

**Achtung:** Nur, wenn **beruflich sinnvoll**!

### Tipp 2: Kaufdatum optimieren

**Ende des Jahres kaufen?**

```
Kauf im Dezember:
€1.500 ÷ 36 Monate × 1 Monat = € 41,67 (2026)

Kauf im Januar:
€1.500 ÷ 36 Monate × 12 Monate = € 500,00 (2026)
```

**Für Abschreibungen:** Früh im Jahr kaufen maximiert Abzug!  
**Für GWG:** Egal, immer 100% absetzbar.

### Tipp 3: Belege aufbewahren

**Für Finanzamt:**
1. Beleg in der App fotografieren (digitale Kopie)
2. **Original-Beleg 10 Jahre aufbewahren** (gesetzlich)
3. Beschriftung: "Arbeitsmittel [Jahr]"

### Tipp 4: Gebrauchte Geräte

**Kann ich gebrauchte Laptops absetzen?**

**Ja!** Gleiche Regeln:
- Kaufpreis ≤ €952 → GWG
- Kaufpreis > €952 → Abschreibung

**Beleg:**
- eBay-Rechnung
- Privat-Kaufvertrag
- PayPal-Beleg

---

## ❓ Häufige Fragen

### "Was ist die €952-Grenze genau?"

**Geringwertige Wirtschaftsgüter (GWG):**

Seit 2024 (aktuell):
- **€952** = Grenze (netto bei Umsatzsteuer-Pflichtigen)
- **€952** = Brutto bei Nicht-USt-Pflichtigen (z.B. Kleinunternehmer)

**Für Fahrzeugüberführer (meist Kleinunternehmer):**  
€952 **Brutto-Preis** auf Rechnung.

**Beispiel:**
```
Rechnung: €945 → GWG ✅
Rechnung: €960 → Abschreibung ❌
```

👉 Details: [GWG und Abschreibung](../steuerrecht/gwg-und-abschreibung.md)

### "Wie funktioniert Abschreibung über 3 Jahre?"

**Beispiel: Laptop €1.800, gekauft Juni 2026**

```
Jahr 2026 (Jun-Dez = 7 Monate):
€1.800 ÷ 36 × 7 = € 350,00

Jahr 2027 (12 Monate):
€1.800 ÷ 36 × 12 = € 600,00

Jahr 2028 (12 Monate):
€1.800 ÷ 36 × 12 = € 600,00

Jahr 2029 (Jan-Mai = 5 Monate):
€1.800 ÷ 36 × 5 = € 250,00
─────────────────────────────
Gesamt: €1.800 ✓
```

**Regel:** Genau 36 Monate, verteilt auf **4 Kalenderjahre**.

### "Kann ich gebrauchte Geräte absetzen?"

**Ja!**

Bedingungen:
- ✅ Beruflich genutzt (> 90%)
- ✅ Kaufbeleg vorhanden
- ✅ Angemessener Preis

**Beleg akzeptiert:**
- eBay-Rechnung
- eBay Kleinanzeigen (Quittung)
- Privat-Kaufvertrag (handschriftlich)
- Flohmarkt (Eigenbeleg)

### "Was passiert bei Verkauf?"

**Beispiel:**  
Laptop (€1.500) gekauft 2026, verkauft 2027.

**Steuerlich:**
1. Abschreibung 2026: € 500
2. Verkauf 2027 für € 800
3. **Restbuchwert** 2027: €1.500 - €500 = €1.000
4. **Gewinn:** €800 - €1.000 = -€200 (Verlust)

**Kompliziert!** → Steuerberater konsultieren.

**In der App:**  
Arbeitsmittel einfach löschen (oder als "verkauft" markieren in Beschreibung).

### "Muss ich private Nutzung angeben?"

**Ja, bei > 10% privater Nutzung!**

**Beispiel: Smartphone**
- 80% beruflich
- 20% privat

**Steuerlich:**  
Nur 80% des Preises absetzbar.

**In der App:**  
Preis manuell anpassen:  
€500 × 80% = €400 → €400 eintragen.

---

## 🔧 Erweiterte Funktionen

### Mehrjährige Abschreibung anzeigen (Planung)

**Aktuell:** Nur Abzug für aktuelles Jahr sichtbar.

**Geplant:** Übersicht aller 3 Jahre:

```
┌─────────────────────────────────┐
│ Laptop (€1.500)                 │
│ Gekauft: März 2026              │
├─────────────────────────────────┤
│ 2026: € 416,70 (10 Monate)      │
│ 2027: € 500,00 (12 Monate)      │
│ 2028: € 500,00 (12 Monate)      │
│ 2029: € 83,30 (2 Monate)        │
├─────────────────────────────────┤
│ Gesamt: € 1.500,00 ✓            │
└─────────────────────────────────┘
```

### Export für Steuerberater

**Tabellenansicht → Screenshot**

Oder:
- Backup erstellen
- An Steuerberater senden
- Alle Belege enthalten

---

## 📊 Statistiken

### Dashboard-Integration

**Ausstattung-KPI auf Dashboard:**

```
🔧 Arbeitsmittel
€ 951,70

(Nur Abzug für aktuelles Jahr)
```

### Jahresvergleich

**Mehrere Jahre:**

```
2024: € 600 (Werkzeug)
2025: € 1.200 (Laptop, Smartphone)
2026: € 951,70 (Laptop-Abschreibung + Smartphone)
```

**Tipp:** Screenshots für Vergleich machen.

---

## ✅ Checkliste: Ausstattung optimal nutzen

- [ ] Erstes Arbeitsmittel erfasst
- [ ] GWG-Automatik verstanden
- [ ] Abschreibung nachvollzogen
- [ ] Beleg fotografiert
- [ ] Intelligente Vorschläge genutzt
- [ ] Tabellenansicht geprüft
- [ ] Swipe-Gesten getestet

**Alle Punkte erledigt?**  
Sie nutzen das Ausstattung-Modul wie ein **Steuer-Profi**! 🔧

---

## 🚨 Wichtige Hinweise

### ⚠️ Steuerberatung

**Diese App ersetzt keinen Steuerberater!**

Bei Unsicherheiten:
- Hoher Wert (> €5.000)
- Private Nutzung > 50%
- Verkauf innerhalb 3 Jahren
- Spezielle Geräte (Firmenwagen, etc.)

→ **Steuerberater konsultieren!**

### ⚠️ Belegpflicht

**10 Jahre aufbewahren** (gesetzlich):
- Original-Rechnungen
- Kaufverträge
- Zahlungsnachweise

**App-Fotos sind nur Kopien!**

### ⚠️ Überwiegend beruflich

**Nur bei > 90% beruflicher Nutzung voll absetzbar!**

Bei Mischnutzung:
- Anteil schätzen
- Dokumentieren
- Nur beruflichen Anteil eintragen

---

## 📚 Weiterführende Links

- 📖 [GWG und Abschreibung](../steuerrecht/gwg-und-abschreibung.md) – Detaillierte Erklärung
- 📖 [Praxisbeispiele](../steuerrecht/praxisbeispiele.md) – Schritt-für-Schritt
- 📖 [Dashboard](dashboard.md) – Ausstattung-KPI verstehen
- 📖 [Einstellungen](einstellungen.md) – Steuersätze anpassen

---

**Zurück zu [Ausgaben](ausgaben.md) | Weiter zu [Einstellungen](einstellungen.md)**
