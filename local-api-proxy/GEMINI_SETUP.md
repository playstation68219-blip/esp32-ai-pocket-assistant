# 🤖 Gemini AI Integration für ESP32-S3

## 📋 Übersicht

Diese Integration verbindet **Google Gemini AI** mit deinem ESP32-S3 Assistenten. Dadurch erhält dein Gerät:

- 🌐 **Echtzeit-Web-Suche** - Aktuelle Informationen aus dem Internet
- 📰 **News-Analyse** - Verarbeitet aktuelle Nachrichten
- ⛅ **Wetter-Intelligenz** - Intelligente Wetter-Vorhersagen
- 🔍 **Problemlösung** - Komplexe Fragen analysieren
- ⚡ **Real-Time Streaming** - Schnelle Antworten
- 📊 **Zusammenfassungen** - Inhalte kompakt zusammenfassen

---

## 🚀 Schritt 1: Gemini API Key einrichten

### 1.1 Google AI Studio besuchen
1. Gehe zu: https://ai.google.dev
2. Klicke **"Get API Key"**
3. Wähle **"Create API Key in new project"**

### 1.2 API Key kopieren
1. Dein API Key wird angezeigt
2. **Kopiere ihn** (Vorsicht: Nicht teilen!)
3. Speichere ihn sicher

### 1.3 API Key in `.env` eintragen

```bash
# Öffne die .env Datei
cp .env.example .env

# Bearbeite .env mit deinem Editor und füge ein:
GEMINI_API_KEY=dein_api_key_hier
GEMINI_MODEL=models/gemini-2.0-flash
```

---

## 🔌 Schritt 2: Abhängigkeiten installieren

```bash
cd local-api-proxy
npm install axios dotenv express cors
```

Falls du ein neues Projekt startest:
```bash
npm init -y
npm install express cors axios dotenv
```

---

## 📡 Schritt 3: Server starten

```bash
# Mit npm
npm start

# Oder mit Node direkt
node server.js

# Mit Gemini Integration
node gemini-integration.js
```

**Output sollte sein:**
```
Server läuft auf Port 3000
Gemini ist konfiguriert: true
```

---

## 🧪 Schritt 4: APIs testen

### Test 1: Einfacher Chat
```bash
curl -X POST http://localhost:3000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hallo! Wie heißt du?"}'
```

**Erwartete Antwort:**
```json
{
  "status": "success",
  "response": "Ich bin Claude... [Antwort von Gemini]"
}
```

### Test 2: Web-Suche & Analyse
```bash
curl -X POST http://localhost:3000/api/gemini/search-and-analyze \
  -H "Content-Type: application/json" \
  -d '{"query":"Was sind die aktuellen Bitcoin Preise?"}'
```

### Test 3: Echtzeit-News Analyse
```bash
curl -X GET "http://localhost:3000/api/gemini/analyze-news?country=de&category=general&newsApiKey=DEIN_NEWS_API_KEY"
```

### Test 4: Wetter-Analyse
```bash
curl -X GET "http://localhost:3000/api/gemini/analyze-weather?city=Berlin&openweatherKey=DEIN_OPENWEATHER_KEY"
```

---

## 📚 Verfügbare Endpoints

### 1. **Simple Chat** - Basis-Gemini Anfrage
```
POST /api/gemini/chat
Content-Type: application/json

{
  "prompt": "Deine Frage hier",
  "system_prompt": "Optional: Spezielle Anweisung"
}
```

**Antwort:**
```json
{
  "status": "success",
  "response": "Gemini Antwort hier",
  "timestamp": "2026-07-07T12:00:00Z"
}
```

---

### 2. **Web-Suche & Analyse** - Mit Echtzeit-Daten
```
POST /api/gemini/search-and-analyze
Content-Type: application/json

{
  "query": "Deine Such-Frage",
  "context": "Optional: Zusätzlicher Kontext"
}
```

**Antwort:**
```json
{
  "status": "success",
  "analysis": "Detaillierte Analyse mit Web-Ergebnissen",
  "has_web_search": true,
  "citations_count": 5
}
```

---

### 3. **Echtzeit-Antworten** - Schnell & fokussiert
```
POST /api/gemini/realtime
Content-Type: application/json

{
  "prompt": "Kurze Frage",
  "max_tokens": 1024
}
```

---

### 4. **Zusammenfassungen** - Lange Texte kürzen
```
POST /api/gemini/summarize
Content-Type: application/json

{
  "text": "Langer Text zum Zusammenfassen",
  "style": "bullet_points",  // oder: paragraph, short, detailed
  "language": "de"
}
```

---

### 5. **News-Analyse** - Aktuelle Nachrichten verstehen
```
GET /api/gemini/analyze-news?country=de&category=general
```

**Benötigt:** `NEWS_API_KEY` in `.env`

---

### 6. **Wetter-Analyse** - Intelligente Vorhersagen
```
GET /api/gemini/analyze-weather?city=Berlin
```

**Benötigt:** `OPENWEATHER_API_KEY` in `.env`

---

### 7. **Problemlösung** - Komplexe Fragen
```
POST /api/gemini/solve-problem
Content-Type: application/json

{
  "problem": "Mein Problem ist...",
  "context": "Zusätzliche Informationen",
  "expertise_level": "beginner"  // oder: intermediate, advanced
}
```

---

## 🔗 ESP32 Integration

### In deinem ESP32-Code (Arduino/C++):

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Gemini Server Adresse
const char* GEMINI_API = "http://192.168.1.YOUR_COMPUTER_IP:3000";

void askGemini(String prompt) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Einfacher Chat
    String url = String(GEMINI_API) + "/api/gemini/chat";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"prompt\":\"" + prompt + "\"}";
    int httpCode = http.POST(payload);
    
    if(httpCode == 200) {
      String response = http.getString();
      Serial.println(response);
      
      // Parse JSON
      StaticJsonDocument<2048> doc;
      deserializeJson(doc, response);
      String answer = doc["response"];
      Serial.println("Antwort: " + answer);
    }
    
    http.end();
  }
}

void askGeminiWithSearch(String query) {
  // Für Web-Suche & Analyse
  String url = String(GEMINI_API) + "/api/gemini/search-and-analyze";
  // ... ähnlich wie oben
}
```

---

## 🛠️ Konfiguration für andere APIs

Damit dein Assistente **noch mehr kann**, konfiguriere auch:

### News API
```bash
# 1. Gehe zu: https://newsapi.org
# 2. Registriere dich (kostenlos)
# 3. Kopiere deinen API Key
# 4. In .env eintragen:
NEWS_API_KEY=dein_key_hier
```

### OpenWeather API
```bash
# 1. Gehe zu: https://openweathermap.org/api
# 2. Registriere dich (kostenlos für Basic)
# 3. Kopiere deinen API Key
# 4. In .env eintragen:
OPENWEATHER_API_KEY=dein_key_hier
```

---

## 📊 Kosten & Limits

| Feature | Kostenlos | Limit | Preis |
|---------|-----------|-------|-------|
| Gemini API | Ja (mit 60 Anfragen/Min) | 60/Min | €0 |
| News API | Ja | 100/Tag | €0 |
| OpenWeather | Ja | Unbegrenzt | €0 |
| Web-Suche | Inkl. in Gemini | - | €0 |

**GESAMT: 100% KOSTENLOS! 🎉**

---

## ⚠️ Troubleshooting

### Problem: API Key funktioniert nicht
```
❌ Error: Invalid API key
✅ Lösung:
  1. Key neu kopieren von ai.google.dev
  2. In .env korrekt eintragen (keine Leerzeichen)
  3. Server neu starten
```

### Problem: Keine Web-Suche Ergebnisse
```
❌ Error: Web search disabled
✅ Lösung:
  1. Nutze POST zu /api/gemini/search-and-analyze
  2. Nicht /api/gemini/chat
```

### Problem: Timeout bei News-Analyse
```
❌ Error: Request timeout
✅ Lösung:
  1. NEWS_API_KEY in .env überprüfen
  2. Internetverbindung prüfen
  3. Versuche mit kleinerer Page Size
```

### Problem: ESP32 kann den Server nicht erreichen
```
❌ Error: Connection refused
✅ Lösung:
  1. Stelle sicher, dass Server läuft: npm start
  2. Überprüfe IP-Adresse: hostname -I
  3. Gleicher WLAN-Netzwerk? JA!
  4. Firewall?
```

---

## 🎯 Praktische Beispiele für ESP32

### Beispiel 1: "Aktuelle Nachrichten"
```cpp
// Benutzer: "Erzähl mir die News"
askGeminiWithSearch("Gib mir eine Zusammenfassung der wichtigsten Nachrichten heute");
```

### Beispiel 2: "Ist das Wetter gut zum Joggen?"
```cpp
askGeminiWithSearch("Wie ist das Wetter in Berlin und ist es gut zum Joggen?");
```

### Beispiel 3: "Bitcoin Preis erklären"
```cpp
askGeminiWithSearch("Erkläre mir warum der Bitcoin Preis so ist");
```

### Beispiel 4: "Schnelle Antwort"
```cpp
// Für schnelle Fragen ohne Web-Suche
askGemini("Was ist 2+2?");  // Blitzschnell!
```

---

## 🚀 Nächste Schritte

1. ✅ Gemini API Key einrichten
2. ✅ `.env` Datei konfigurieren
3. ✅ Server starten: `npm start`
4. ✅ APIs mit curl testen
5. ✅ ESP32 Code anpassen
6. ✅ Voice Commands testen!

---

## 📞 Support

**Probleme?**
- Logs checken: `npm start` Output
- API Keys überprüfen (keine Typos)
- Internetverbindung testen
- Google Gemini Docs: https://ai.google.dev/docs

---

## 🎉 Dein Assistent mit Gemini

Du hast jetzt:
- ✅ Web-Suche Fähigkeit
- ✅ Echtzeit-Datenanalyse
- ✅ Nachrichten-Verarbeitung
- ✅ Intelligente Wetter-Vorhersagen
- ✅ Schnelle Antworten
- ✅ 100% kostenlos!

**Viel Spaß mit deinem verbesserten ESP32-Assistenten! 🚀**
