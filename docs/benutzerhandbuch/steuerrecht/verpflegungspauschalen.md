# 🍽️ Verpflegungspauschalen

Alles über **Verpflegungsmehraufwand** (Verpflegungspauschalen) nach deutschem Steuerrecht 2024+.

---

## 📊 Überblick

**Verpflegungspauschalen** sind pauschale Beträge für:
- Mehraufwand durch Essen außerhalb der Wohnung
- Bei **beruflich veranlassten Auswärtstätigkeiten**
- **Ohne Einzelnachweis** (keine Belege erforderlich)

**Gesetzliche Grundlage:**  
§ 9 Abs. 4a Satz 3 Einkommensteuergesetz (EStG)

---

## 💰 Pauschbeträge 2024+

### Aktuelle Sätze (Deutschland)

| Abwesenheit | Pauschale | Voraussetzung |
|-------------|-----------|---------------|
| **8-24 Stunden** | **€14** | Tagesfahrt > 8 Stunden |
| **24 Stunden** | **€28** | Voller Kalendertag (mehrtägig) |
| **An-/Abreisetag** | **€14** | Bei mehrtägigen Reisen |

**Stand:** 2024 (seit 2020 unverändert)

### Ausland (Beispiele)

Höhere Pauschalen im Ausland:

| Land | 24h | 8-24h |
|------|-----|-------|
| Schweiz | €60 | €40 |
| Österreich | €43 | €29 |
| Frankreich | €53 | €35 |
| Polen | €35 | €23 |

**Für diese App:** Nur Deutschland-Sätze (€14/€28).

---

## 🎯 Wann bekomme ich welchen Satz?

### Szenario 1: Tagesfahrt > 8 Stunden

**Beispiel:**
```
Abfahrt:  08:00 Uhr
Ankunft:  17:00 Uhr
Dauer:    9 Stunden
──────────────────
Pauschale: €14
```

**Bedingungen:**
- ✅ Einfache Fahrt (hin & zurück am selben Tag)
- ✅ Abwesenheit > 8 Stunden
- ✅ Beruflich veranlasst

**App berechnet automatisch!**

### Szenario 2: Tagesfahrt < 8 Stunden

**Beispiel:**
```
Abfahrt:  10:00 Uhr
Ankunft:  16:00 Uhr
Dauer:    6 Stunden
──────────────────
Pauschale: €0
```

**Keine Pauschale bei < 8 Stunden!**

### Szenario 3: Mehrtägige Fahrt

**Beispiel: 2 Tage**
```
Tag 1 (Anreise):   €14
Tag 2 (Abreise):   €14
──────────────────────
Gesamt:            €28
```

**Regel:**
- **An- und Abreisetag:** Je €14 (egal wie lange)
- **Zwischentage (volle 24h):** Je €28

**Beispiel: 4 Tage**
```
Tag 1 (Anreise):   €14
Tag 2 (voll):      €28
Tag 3 (voll):      €28
Tag 4 (Abreise):   €14
──────────────────────
Gesamt:            €84
```

---

## 📅 Berechnung nach Zeiträumen

### 8-Stunden-Regel

**Wie wird gezählt?**

Von **Beginn der Abwesenheit** bis **Ende der Abwesenheit**.

**Beispiel 1: Gerade 8 Stunden**
```
Abfahrt:  09:00 Uhr
Ankunft:  17:00 Uhr
──────────────────
8 Stunden → €0 (NICHT > 8!)
```

**Beispiel 2: Mehr als 8 Stunden**
```
Abfahrt:  09:00 Uhr
Ankunft:  17:15 Uhr
──────────────────
8,25 Stunden → €14 ✅
```

**App-Logik:**
```javascript
Dauer > 8 Stunden → €14
Dauer ≤ 8 Stunden → €0
```

### 24-Stunden-Regel (mehrtägig)

**Volle Kalendertage:**

Ein **voller Kalendertag** ist:
```
00:00 Uhr bis 24:00 Uhr (Mitternacht zu Mitternacht)
```

**Beispiel: 3-Tages-Fahrt**
```
Montag:    Abfahrt 14:00 Uhr     → €14 (Anreisetag)
Dienstag:  Ganzer Tag (00-24h)   → €28 (voller Tag)
Mittwoch:  Ankunft 10:00 Uhr     → €14 (Abreisetag)
────────────────────────────────────────────────────
Gesamt:                            €56
```

**Wichtig:**
- **Anreisetag:** Immer €14 (egal wann angekommen)
- **Abreisetag:** Immer €14 (egal wann abgefahren)
- **Zwischentage:** Immer €28 (volle 24h)

---

## 🚫 Kürzungen

### Arbeitgeber-Mahlzeiten

**Wenn Arbeitgeber Mahlzeiten stellt:**

| Mahlzeit | Kürzung |
|----------|---------|
| Frühstück | -€5,60 (20%) |
| Mittagessen | -€11,20 (40%) |
| Abendessen | -€11,20 (40%) |

**Beispiel:**
```
Pauschale:        €28
Arbeitgeber gibt Mittagessen
Kürzung:          -€11,20
────────────────────────
Absetzbar:        €16,80
```

**In der App:**  
Manuelle Anpassung erforderlich (Pauschale auf €16,80 setzen).

### Arbeitgeber-Erstattung

**Wenn Arbeitgeber Verpflegungsgeld zahlt:**

**Beispiel:**
```
Ihr Anspruch:     €28
Arbeitgeber zahlt:  €20
────────────────────────
Noch absetzbar:   €8
```

**In der App:**  
Monatliche Spesen im Fahrten-Modul erfassen → Automatische Kürzung im Dashboard.

---

## 💡 Praktische Anwendung

### Typischer Fahrzeugüberführer-Tag

**Szenario: Hamburg → München (Tagesfahrt)**

```
06:00  Abfahrt von Zuhause (Hamburg)
07:00  Zug nach München
13:00  Ankunft München, PKW abholen
14:00  Fahrt zurück nach Hamburg
20:00  Ankunft Zuhause
────────────────────────────────────
Abwesenheit: 14 Stunden
Pauschale:   €14 ✅
```

**Was Sie gegessen haben:** Irrelevant!  
Pauschale gilt **unabhängig** von tatsächlichen Kosten.

### Mehrtägige Überführung

**Szenario: Hamburg → Italien (3 Tage)**

```
Tag 1 (Montag):
  08:00  Abfahrt Hamburg
  18:00  Ankunft München, Hotel
  → €14 (Anreisetag)

Tag 2 (Dienstag):
  08:00  Weiterfahrt München
  20:00  Ankunft Mailand, Hotel
  → €28 (voller Tag)

Tag 3 (Mittwoch):
  09:00  Rückflug Mailand → Hamburg
  12:00  Ankunft Hamburg
  → €14 (Abreisetag)
────────────────────────────────────
Gesamt: €56
```

---

## ❓ Häufige Fragen

### "Muss ich Essensbelege sammeln?"

**NEIN!**

Pauschalen = **ohne Nachweis**.

**Vorteile:**
- ✅ Keine Belege erforderlich
- ✅ Egal, was Sie tatsächlich ausgegeben haben
- ✅ Einfache Abrechnung

**Sie können sogar:**
- Selbstgemachtes Sandwich essen → Trotzdem €14
- Gar nicht essen → Trotzdem €14
- Teuer im Restaurant → Trotzdem €14 (nicht mehr!)

### "Was ist besser: Pauschale oder Einzelnachweis?"

**Für Fahrzeugüberführer: Pauschale!**

**Vergleich:**

| Methode | Pauschale | Einzelnachweis |
|---------|-----------|----------------|
| Aufwand | ⭐ Niedrig | ⭐⭐⭐ Hoch |
| Belege | Keine | Alle Restaurantbelege |
| Risiko | Gering | Hoch (Anerkennung) |
| Betrag | Fix | Variabel |

**Einzelnachweis lohnt nur bei:**
- Sehr teuren Geschäftsessen
- Auslandsreisen mit hohen Kosten

**Für normale Überführungen:** Pauschale nutzen!

### "Gilt die Pauschale auch bei Übernachtung im Auto?"

**JA!**

Pauschale ist **unabhängig** von:
- ❌ Hotel/Pension (nicht erforderlich)
- ❌ Tatsächlichen Essenskosten
- ❌ Art der Übernachtung

**Entscheidend ist nur:**
- ✅ Dauer der Abwesenheit
- ✅ Beruflicher Anlass

### "Was wenn ich zu Hause bin zwischen 8-24h?"

**Beispiel:**
```
08:00  Abfahrt
12:00  Pause zu Hause (2 Stunden)
14:00  Weiterfahrt
18:00  Ankunft
──────────────────────────
Gesamt: 10 Stunden, aber Unterbrechung?
```

**Regelung:**
- Pause zu Hause **unterbricht** Abwesenheit
- Nur reine Abwesenheit zählt: 4h + 4h = **8h**
- → Keine Pauschale ❌

**Tipp:** Pausen nicht zu Hause machen, sondern unterwegs!

### "Zählt die Fahrt zum Bahnhof mit?"

**JA!**

**Abwesenheit beginnt:**  
Verlassen der Wohnung (oder letzter regelmäßiger Arbeitsort).

**Beispiel:**
```
07:00  Verlasse Wohnung (Fahrrad)
07:15  Am Bahnhof
08:00  Zug fährt ab
17:00  Zug kommt an
17:30  Zurück zu Hause (Fahrrad)
──────────────────────────────────
Abwesenheit: 07:00 - 17:30 = 10,5 Stunden
Pauschale: €14 ✅
```

---

## 🔧 In der App

### Automatische Berechnung

**App erkennt automatisch:**

**Tagesfahrt:**
```
Abfahrt: 08:00
Ankunft: 17:00
→ App berechnet: 9 Stunden
→ > 8 Stunden → €14 ✅
```

**Mehrtägige Fahrt:**
```
Von: 20.01.2026
Bis: 22.01.2026
→ App berechnet: 3 Tage
→ Tag 1: €14
→ Tag 2: €28
→ Tag 3: €14
→ Gesamt: €56 ✅
```

### Manuelle Anpassung

**Falls Kürzung nötig:**

1. Fahrt bearbeiten
2. Verpflegung manuell auf €0 oder niedrigeren Betrag setzen
3. Speichern

**Anwendungsfälle:**
- Arbeitgeber hat Mahlzeit gestellt
- Bereits erstattete Verpflegung
- Keine Pauschale gewünscht

---

## 📊 Beispiel-Berechnungen

### Beispiel 1: Typische Überführungs-Woche

```
Montag:    Hamburg → Berlin (10h)        → €14
Dienstag:  Berlin → München (12h)        → €14
Mittwoch:  München → Stuttgart (8h)      → €0
Donnerstag: Stuttgart → Frankfurt (9h)   → €14
Freitag:   Frankfurt → Hamburg (11h)     → €14
────────────────────────────────────────────
Woche gesamt:                              €56
Monat (4 Wochen):                          €224
Jahr (48 Wochen):                          €2.688
```

### Beispiel 2: Mehrtägige Fernüberführung

```
Woche 1:
Mo: Hamburg → München (Anreise)        → €14
Di: München → Rom (voll)               → €28
Mi: Rom → Neapel (voll)                → €28
Do: Neapel → Rom (voll)                → €28
Fr: Rom → München (Abreise)            → €14
────────────────────────────────────────────
Woche gesamt:                            €112
```

**Hochgerechnet:**  
€112/Woche × 4 Wochen = **€448/Monat**  
€448 × 12 Monate = **€5.376/Jahr**

**Erhebliche Steuerersparnis!**

---

## ✅ Zusammenfassung

**Kernaussagen:**

1. **€14** = Tagesfahrt > 8 Stunden
2. **€28** = Voller Kalendertag (mehrtägig)
3. **Keine Belege** erforderlich (Pauschale!)
4. **App berechnet** automatisch
5. **Kürzungen** bei Arbeitgeber-Leistungen
6. **Hohe Steuerersparnis** möglich (€2.000+ pro Jahr)

**Wichtig:**  
Pauschalen sind **unabhängig** von tatsächlichen Kosten. Sie bekommen immer den gleichen Betrag, egal was Sie ausgeben!

---

## 📚 Weiterführende Links

- 📖 [Grundlagen](grundlagen.md) – Allgemeine Steuerrecht-Basics
- 📖 [Kilometerpauschalen](kilometerpauschalen.md) – Fahrtkosten
- 📖 [Praxisbeispiele](praxisbeispiele.md) – Komplette Berechnungen
- 📖 [Fahrten-Modul](../module/fahrten.md) – App-Bedienung

---

**Zurück zu [Grundlagen](grundlagen.md) | Weiter zu [Kilometerpauschalen](kilometerpauschalen.md)**
