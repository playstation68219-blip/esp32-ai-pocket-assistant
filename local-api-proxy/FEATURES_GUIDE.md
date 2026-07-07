# 🏠 ESP32 Smart Home & Extended APIs Guide

Umfassende Anleitung für alle neuen Features deines ESP32-S3 Xiaozhi!

---

## 📋 Feature Übersicht

| Feature | API | Kostenlos | Setup |
|---------|-----|----------|-------|
| 🏠 Smart Home | IFTTT, Home Assistant, Tasmota | ✅ | 🔧 Einfach |
| ⏰ Zeit & Kalender | System + Google Calendar | ✅/❌ | 🔧 Einfach |
| 💱 Aktienpreise | Alpha Vantage | ❌ | 🔧 Mittel |
| 🪙 Kryptowährungen | CoinGecko | ✅ | ✨ Kostenlos! |
| 🌍 Übersetzungen | MyMemory | ✅ | ✨ Kostenlos! |
| 🌫️ Luftqualität | OpenWeather | ❌ | 🔧 Mittel |
| 🌅 Sonnenauf/-untergang | Sunrise Sunset | ✅ | ✨ Kostenlos! |
| 📱 QR Codes | QRServer | ✅ | ✨ Kostenlos! |
| 🎲 Fakten | Useless Facts | ✅ | ✨ Kostenlos! |

---

## 🏠 SMART HOME Integration

### 1️⃣ IFTTT (Einfachste Variante!)

**Setup (5 Minuten):**

1. Geh zu https://ifttt.com
2. Registriere dich
3. Suche nach "Webhooks" → Connect
4. Gib dir einen Namen: z.B. "smart_light_on"
5. Kopiere deine **Webhook URL** (enthält Key)
6. Trag den Key in `.env` ein:

```bash
IFTTT_WEBHOOK_KEY=your_key_here
```

**API Test:**
```bash
curl -X POST "http://localhost:3000/api/smarthome/ifttt" \
  -H "Content-Type: application/json" \
  -d '{"action":"light_on","device":"living_room","state":"on"}'
```

**Dein ESP32 kann nun sagen:**
- "Schalte das Licht an"
- "Heizung auf 22 Grad"
- "Rollläden schließen"

---

### 2️⃣ Home Assistant (Fortgeschritten)

**Voraussetzung:** Home Assistant läuft auf deinem lokalen Netzwerk

**Setup:**

1. Öffne Home Assistant
2. Geh zu **Settings** → **Long-Lived Access Token**
3. Erstelle einen neuen Token
4. Trag in `.env` ein:

```bash
HOME_ASSISTANT_URL=http://192.168.1.100:8123
HOME_ASSISTANT_TOKEN=eyJhbGc...
```

**Beispiel - Licht kontrollieren:**
```bash
# Licht einschalten
curl -X POST "http://localhost:3000/api/smarthome/homeassistant/control" \
  -H "Content-Type: application/json" \
  -d '{"device":"light.living_room","action":"light.turn_on"}'

# Status prüfen
curl "http://localhost:3000/api/smarthome/homeassistant/status?entity_id=light.living_room"
```

---

### 3️⃣ Tasmota Devices (DIY Smart Devices)

Für selbstgebaute Smart Devices mit Tasmota Firmware:

```bash
# Gerät steuern
curl -X POST "http://localhost:3000/api/smarthome/tasmota/control" \
  -H "Content-Type: application/json" \
  -d '{"deviceIp":"192.168.1.50","command":"Power","value":"on"}'
```

---

## ⏰ ZEIT & KALENDER

### Aktuelle Zeit abrufen

```bash
curl "http://localhost:3000/api/time?timezone=Europe/Berlin"
```

**Response:**
```json
{
  "time": "14:30:45",
  "date": "07.07.2026",
  "day_of_week": "Montag",
  "formatted": "Montag, 7. Juli 2026 um 14:30:45"
}
```

### Timer starten (für Küche, Alarm, etc.)

```bash
# Timer starten
curl -X POST "http://localhost:3000/api/time/timer/start" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kaffee","minutes":5}'

# Response: timer_id = "Kaffee_1720340400000"

# Status prüfen
curl "http://localhost:3000/api/time/timer/check?timer_id=Kaffee_1720340400000"
```

### Google Kalender (Optional)

```bash
# Setup: https://developers.google.com/calendar/api
GOOGLE_CALENDAR_ID=deine@gmail.com
GOOGLE_CALENDAR_API_KEY=your_key

# Nächste Events abrufen
curl "http://localhost:3000/api/calendar/events"
```

---

## 💱 FINANZ & KRYPTO

### Kryptowährungen (Kostenlos!)

```bash
# Bitcoin Preis
curl "http://localhost:3000/api/crypto/price?coin=bitcoin&currency=eur"

# Andere Coins: ethereum, cardano, ripple, etc.
curl "http://localhost:3000/api/crypto/price?coin=ethereum&currency=eur"
```

**Response:**
```json
{
  "coin": "bitcoin",
  "price": 45320.50,
  "market_cap": 890000000000,
  "change_24h": 2.5
}
```

### Aktienpreise

```bash
# Voraussetzung: Alpha Vantage API Key
ALPHA_VANTAGE_KEY=demo  # oder dein Key

# Apple Stock
curl "http://localhost:3000/api/stocks/price?symbol=AAPL"

# Tesla
curl "http://localhost:3000/api/stocks/price?symbol=TSLA"
```

---

## 🌍 WEITERE PRAKTISCHE APIs

### Übersetzungen (Kostenlos!)

```bash
curl "http://localhost:3000/api/translate?text=Hallo%20Welt&target_lang=en&source_lang=de"

# Response: "Hello World"
```

### Luftqualität

```bash
curl "http://localhost:3000/api/air-quality?city=Berlin"

# oder mit Koordinaten:
curl "http://localhost:3000/api/air-quality?lat=52.52&lon=13.405"
```

### Sonnenauf- & Untergang

```bash
curl "http://localhost:3000/api/astronomy/sun?lat=52.52&lon=13.405"

# Response:
# {
#   "sunrise": "2026-07-07T04:30:00Z",
#   "sunset": "2026-07-07T21:15:00Z",
#   "day_length": 61020
# }
```

### QR Code generieren

```bash
curl "http://localhost:3000/api/generate/qrcode?text=http://example.com&size=300"

# Response:
# {
#   "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=..."
# }
```

### Zufällige Fakten

```bash
curl "http://localhost:3000/api/facts/random"

# Response: "Die Banane ist eine Beere, aber die Erdbeere nicht!"
```

---

## 🎙️ ESP32 Voice Commands

Mit allen Features kannst dein Xiaozhi nun folgende Befehle verstehen:

```
🏠 Smart Home:
  "Schalte das Licht in der Küche an"
  "Heizung auf 22 Grad stellen"
  "Rollläden runterfahren"

⏰ Zeit & Kalender:
  "Wie spät ist es?"
  "Starte einen 10-Minuten-Timer"
  "Was steht auf meiner Agenda?"

💱 Finanzen:
  "Was kostet Bitcoin in Euro?"
  "Wie teuer ist eine Tesla-Aktie?"

🌍 Sonstiges:
  "Übersetze 'Guten Morgen' ins Englische"
  "Wie ist die Luftqualität heute?"
  "Wann geht die Sonne unter?"
  "Erzähl mir einen Fakt"
```

---

## 🚀 Aktiviere alle Extensions

Editiere `server.js` und füge am Ende hinzu:

```javascript
// Lade alle Extensions
const extensions = require('./extensions.js');
// Extensions sind bereits integriert!
```

Oder erstelle einen separaten Express App mit beiden:

```javascript
const express = require('express');
const app = express();
const mainServer = require('./server.js');
const extensions = require('./extensions.js');

// Alle Endpoints sind verfügbar
app.listen(3000);
```

---

## 📝 API-Keys Summary

| Service | Kostenlos | URL |
|---------|-----------|-----|
| IFTTT | ✅ | https://ifttt.com |
| CoinGecko | ✅ | https://coingecko.com (kein Key nötig) |
| MyMemory | ✅ | https://mymemory.translated.net (kein Key nötig) |
| QR Server | ✅ | https://qrserver.com (kein Key nötig) |
| Sunrise Sunset | ✅ | https://sunrise-sunset.org (kein Key nötig) |
| Useless Facts | ✅ | https://uselessfacts.jsond.com (kein Key nötig) |
| Home Assistant | ✅ | Local (nur Token nötig) |
| Google Calendar | ❌ | https://developers.google.com/calendar |
| Alpha Vantage | ❌ | https://www.alphavantage.co |
| OpenWeather | ❌ | https://openweathermap.org |

---

## 🐛 Troubleshooting

### "Smart Home antwortet nicht"
→ Prüfe IP-Adresse und Firewall-Regeln

### "Timer funktioniert nicht"
→ Timer werden im RAM gespeichert (restartet bei Server-Neustart)

### "Crypto-API ist zu langsam"
→ CoinGecko hat Rate Limits - max. 10-50 Anfragen/Minute

### "Home Assistant Token ungültig"
→ Erstelle neuen Token in Home Assistant

---

## 📚 Nächste Schritte

1. **Wähle deine Smart Home Lösung** (IFTTT ist am einfachsten)
2. **Hole API Keys** für die Services die du brauchst
3. **Teste die Endpoints** mit curl
4. **Integriere ins Xiaozhi-Interface**

---

**Happy Automating! 🚀**
