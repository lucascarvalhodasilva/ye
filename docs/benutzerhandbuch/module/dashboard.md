# 🏠 Dashboard - Jahresübersicht

Das **Dashboard** ist Ihre zentrale Übersicht über alle steuerlich relevanten Beträge des Jahres.

---

## 📊 Überblick

Das Dashboard zeigt:

- ✅ **Jahresauswahl** – Wechseln Sie zwischen verschiedenen Jahren
- ✅ **KPI-Karten** – Alle wichtigen Kennzahlen auf einen Blick
- ✅ **Grand Total** – Gesamtsumme aller Werbungskosten
- ✅ **Private Bilanz** – Private Ausgaben und Netto-Saldo
- ✅ **Letzte Aktivitäten** – Die 5 neuesten Einträge

---

## 🎯 Hauptfunktionen

### 1. Jahresauswahl

Oben rechts können Sie das Jahr auswählen:

```
[2024 ▼] [2025] [2026 ✓]
```

**Anwendungsfälle:**
- 📅 Aktuelles Jahr im Blick behalten
- 📊 Vorjahre für Steuererklärung prüfen
- 📈 Mehrjährige Entwicklung vergleichen

**So funktioniert's:**
1. Tippen Sie auf das Jahr-Dropdown
2. Wählen Sie das gewünschte Jahr
3. Dashboard lädt automatisch die Daten

---

### 2. Grand Total Card (Hauptkarte)

Die große Karte oben zeigt:

```
┌─────────────────────────────────────┐
│  Jahr: 2026                         │
│                                     │
│  Gesamt Werbungskosten              │
│  € 12.450,00                        │
│                                     │
│  Steuerlich absetzbare Beträge      │
└─────────────────────────────────────┘
```

**Berechnungsformel:**
```
Grand Total = 
  Verpflegungspauschalen
  + Fahrtkosten (Kilometergeld)
  + Arbeitsmittel (Abschreibungen)
  - Spesen vom Arbeitgeber
```

**Wichtig:** Arbeitgeber-Spesen werden **abgezogen**, da diese nicht steuerlich geltend gemacht werden dürfen!

---

### 3. KPI-Karten (2×2 Grid)

#### 📋 Karte 1: Verpflegung

```
┌────────────────────┐
│ 🍽️ Verpflegung     │
│ € 3.200,00         │
│                    │
│ Pauschalen         │
└────────────────────┘
```

**Was wird gezählt?**
- Verpflegungspauschalen aus Fahrten
- €14 (Tagesfahrt > 8h)
- €28 (Mehrtägige Fahrt, pro Tag)

**Beispiel:**
```
10 Tagesfahrten × €14 = €140
5 Übernachtungen × €28 × 2 Tage = €280
─────────────────────────────────────
Gesamt: €420
```

#### 🚗 Karte 2: Fahrtkosten

```
┌────────────────────┐
│ 🚗 Fahrtkosten     │
│ € 5.800,00         │
│                    │
│ Kilometer          │
└────────────────────┘
```

**Was wird gezählt?**
- PKW: km × €0,30
- Motorrad: km × €0,20
- Fahrrad: km × €0,05
- Öffentlich: Tatsächliche Kosten

**Beispiel:**
```
15.000 km PKW × €0,30 = €4.500
2.000 km Motorrad × €0,20 = €400
──────────────────────────────
Gesamt: €4.900
```

#### 🔧 Karte 3: Arbeitsmittel

```
┌────────────────────┐
│ 🔧 Arbeitsmittel   │
│ € 850,00           │
│                    │
│ GWG & AfA          │
└────────────────────┘
```

**Was wird gezählt?**
- GWG (≤€952): Voller Betrag im Kaufjahr
- Abschreibung (>€952): Anteilig über 3 Jahre

**Beispiel:**
```
Smartphone (€450) = €450 sofort absetzbar
Laptop (€1.500) gekauft im März:
  → €1.500 ÷ 36 Monate × 10 Monate = €416,67
────────────────────────────────────────────
Gesamt: €866,67
```

#### 💼 Karte 4: Spesen (negativ)

```
┌────────────────────┐
│ 💼 Spesen          │
│ -€ 2.400,00        │
│                    │
│ Arbeitgeber        │
└────────────────────┘
```

**Was wird gezählt?**
- Monatliche Pauschalen vom Arbeitgeber
- Werden vom Grand Total **abgezogen**

**Warum negativ?**  
Bereits erstattete Beträge dürfen nicht doppelt geltend gemacht werden!

**Beispiel:**
```
Arbeitgeber zahlt: €200/Monat Verpflegung
12 Monate × €200 = €2.400
→ Wird von Ihrer Steuerlast abgezogen
```

---

### 4. Private Bilanz

Unter den KPI-Karten:

```
┌───────────────────────────────────┐
│ Private Bilanz                    │
│                                   │
│ Private Ausgaben:    € 890,00     │
│ Netto-Bilanz:        € 10.050,00  │
└───────────────────────────────────┘
```

**Berechnung:**
```
Netto-Bilanz = Grand Total - Private Ausgaben
```

**Farbcodierung:**
- 🟢 Grün: Positiver Saldo (mehr Werbungskosten als private Ausgaben)
- 🔴 Rot: Negativer Saldo (mehr private Ausgaben)

**Anwendung:**  
Zeigt, wie viel Sie **netto** steuerlich geltend machen können, wenn private Ausgaben berücksichtigt werden.

---

### 5. Letzte Aktivitäten

Die letzten 5 Einträge (alle Module):

```
┌─────────────────────────────────────────┐
│ Letzte Aktivitäten                      │
├─────────────────────────────────────────┤
│ 🚗  25.01. Fahrt: Hamburg → Berlin      │
│     € 101,00                            │
├─────────────────────────────────────────┤
│ 💶  24.01. Ausgabe: Mittagessen         │
│     € 25,00                             │
├─────────────────────────────────────────┤
│ 🔧  20.01. Ausstattung: Smartphone      │
│     € 450,00                            │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ Automatische Icon-Zuordnung
- ✅ Datum im deutschen Format (DD.MM.)
- ✅ Betrag mit Euro-Symbol
- ✅ Hover-Effekt für Interaktivität

**Leerer Zustand:**
```
┌─────────────────────────────────────────┐
│ Keine Aktivitäten vorhanden             │
│                                         │
│ Fügen Sie Ihre erste Fahrt, Ausgabe    │
│ oder Ausstattung hinzu!                 │
└─────────────────────────────────────────┘
```

---

## 📱 Bedienung

### Jahreswechsel

**Schritt-für-Schritt:**
1. Tippen Sie auf das Jahr-Dropdown (oben rechts)
2. Wählen Sie ein anderes Jahr
3. Dashboard aktualisiert automatisch

**Was passiert?**
- Alle KPI-Karten zeigen Daten des gewählten Jahres
- Letzte Aktivitäten filtern nach Jahr
- Private Bilanz neu berechnet

### Navigation zu Modulen

Von einer **KPI-Karte direkt zum Modul**:

1. **Tippen** Sie auf eine KPI-Karte
2. App navigiert zum entsprechenden Modul:
   - Verpflegung → Fahrten
   - Fahrtkosten → Fahrten
   - Arbeitsmittel → Ausstattung
   - Spesen → Fahrten (Monatliche Spesen)

### Aktivitäten aufrufen

**Aus "Letzte Aktivitäten":**
1. Tippen Sie auf einen Eintrag
2. Öffnet das entsprechende Modul
3. Zeigt den Eintrag im Detail

**Beispiel:**  
Tippen auf "Fahrt: Hamburg → Berlin" → Öffnet Fahrten-Modul mit dieser Fahrt

---

## 💡 Praktische Tipps

### Tipp 1: Täglicher Check

Öffnen Sie das Dashboard **täglich** für:
- ✅ Schneller Überblick über Jahres-Fortschritt
- ✅ Kontrolle der letzten Einträge
- ✅ Motivation durch wachsende Zahlen

### Tipp 2: Monatliches Review

**Ende des Monats:**
1. Dashboard öffnen
2. KPIs prüfen (sind die Werte plausibel?)
3. Backup erstellen
4. Optional: Screenshot für eigene Unterlagen

### Tipp 3: Jahresende-Vorbereitung

**Dezember:**
1. Dashboard für aktuelles Jahr öffnen
2. Grand Total notieren
3. Belege sortieren
4. Daten exportieren für Steuerberater

### Tipp 4: Mehrjahresvergleich

**So nutzen Sie es:**
```
2024: €10.500 → Screenshot machen
2025: €12.000 → Screenshot machen
2026: €11.800 (aktuell)

Vergleich: Umsatzentwicklung prüfen
```

---

## ❓ Häufige Fragen

### "Warum stimmt der Grand Total nicht mit meinen Erwartungen überein?"

**Mögliche Gründe:**
1. **Arbeitgeber-Spesen** werden abgezogen
2. **Anderes Jahr** ausgewählt
3. **Filter aktiv** in Untermodulen

**Lösung:**  
Prüfen Sie die einzelnen KPI-Karten und gehen Sie zu den Modulen, um Details zu sehen.

### "Was bedeutet die rote Netto-Bilanz?"

**Rot** = Private Ausgaben > Werbungskosten

**Beispiel:**
```
Grand Total: €5.000
Private Ausgaben: €6.000
────────────────────────
Netto-Bilanz: -€1.000 (ROT)
```

**Bedeutung:**  
Sie haben mehr privat ausgegeben als Sie steuerlich geltend machen können. Das ist normal und kein Problem!

### "Werden gelöschte Einträge vom Dashboard entfernt?"

**Ja, sofort!**

Wenn Sie einen Eintrag löschen:
- ✅ KPIs aktualisieren automatisch
- ✅ Grand Total wird neu berechnet
- ✅ Eintrag verschwindet aus "Letzte Aktivitäten"

### "Kann ich das Dashboard exportieren?"

**Aktuell nicht direkt.**

**Workaround:**
1. Screenshot des Dashboards erstellen
2. Oder: Detaillierte Exporte aus einzelnen Modulen

**Geplant:** PDF-Export des Jahres-Dashboards (zukünftige Version)

---

## 🔧 Erweiterte Funktionen

### KPI-Karten anpassen (zukünftig)

Derzeit sind die KPI-Karten **fest vorgegeben**.

**Geplante Features:**
- [ ] Karten umsortieren
- [ ] Zusätzliche KPIs hinzufügen
- [ ] Farbthemen anpassen

### Dashboard-Widgets (zukünftig)

**Ideen für zukünftige Versionen:**
- 📊 Diagramme (Balken, Torten)
- 📈 Trend-Linien über mehrere Jahre
- 🎯 Soll/Ist-Vergleich
- 📅 Monatsweise Aufschlüsselung

---

## ✅ Checkliste: Dashboard-Nutzung

Nutzen Sie das Dashboard optimal:

- [ ] Täglicher Blick aufs Dashboard
- [ ] KPIs sind verständlich
- [ ] Jahresauswahl korrekt
- [ ] Private Bilanz nachvollziehbar
- [ ] Navigation zu Modulen funktioniert
- [ ] "Letzte Aktivitäten" zeigt neueste Einträge

**Alle Punkte erfüllt?**  
Sie nutzen das Dashboard **professionell**! 🎉

---

## 📚 Weiterführende Links

- 📖 [Fahrten-Modul](fahrten.md) – Details zu Verpflegung & Fahrtkosten
- 📖 [Ausstattung-Modul](ausstattung.md) – Details zu Arbeitsmitteln
- 📖 [Ausgaben-Modul](ausgaben.md) – Private Ausgaben verwalten
- 📖 [Steuerrecht Grundlagen](../steuerrecht/grundlagen.md) – Wie alles berechnet wird

---

**Zurück zur [Übersicht](../README.md) | Weiter zu [Fahrten](fahrten.md)**
