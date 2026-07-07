# 🎯 SETUP CHECKLISTE - ESP32 Smart Home Assistant

Schritt-für-Schritt Anleitung, um ALLES zum Laufen zu bringen!

---

## ✅ PHASE 1: BASIS-SETUP (30 Minuten)

- [ ] **Node.js installieren** (v14+) von https://nodejs.org
- [ ] **Repository geklont/heruntergeladen**
- [ ] **In `local-api-proxy` Ordner navigiert**
  ```bash
  cd local-api-proxy
  ```
- [ ] **Dependencies installiert**
  ```bash
  npm install
  ```
- [ ] **`.env` Datei erstellt**
  ```bash
  cp .env.example .env
  ```
- [ ] **NewsAPI Key geholt** (kostenlos von https://newsapi.org)
  - [ ] In `.env` eingetragen: `NEWS_API_KEY=your_key`
- [ ] **Server gestartet und getestet**
  ```bash
  npm start
  ```
- [ ] **Health Check erfolgreich**
  ```bash
  curl http://localhost:3000/health
  ```

---

## ✅ PHASE 2: SMART HOME SETUP (45 Minuten)

### Option A: IFTTT (Einfachste Variante - EMPFOHLEN!)

- [ ] **IFTTT Account erstellt** → https://ifttt.com
- [ ] **Webhooks Service verbunden**
- [ ] **Webhook Key kopiert**
- [ ] **In `.env` eingetragen:**
  ```env
  IFTTT_WEBHOOK_KEY=your_key_here
  ```
- [ ] **IFTTT Applets erstellt** (z.B. "light_on", "heating", etc.)
- [ ] **Mit curl getestet:**
  ```bash
  curl -X POST http://localhost:3000/api/smarthome/ifttt \
    -H "Content-Type: application/json" \
    -d '{"action":"light_on","device":"living_room","state":"on"}'
  ```

### Option B: Home Assistant (Fortgeschrittene)

- [ ] **Home Assistant läuft auf Heimnetz**
- [ ] **Long-Lived Token erstellt**
- [ ] **In `.env` eingetragen:**
  ```env
  HOME_ASSISTANT_URL=http://192.168.1.100:8123
  HOME_ASSISTANT_TOKEN=your_token
  ```
- [ ] **Mit curl getestet:**
  ```bash
  curl http://localhost:3000/api/smarthome/homeassistant/status?entity_id=light.living_room
  ```

---

## ✅ PHASE 3: ZEIT & KALENDER (20 Minuten)

- [ ] **Aktuelle Zeit testen:**
  ```bash
  curl http://localhost:3000/api/time
  ```
- [ ] **Timer-Funktion testen:**
  ```bash
  curl -X POST http://localhost:3000/api/time/timer/start \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","minutes":1}'
  ```
- [ ] **(Optional) Google Calendar Setup:**
  - [ ] API Key von https://developers.google.com/calendar
  - [ ] In `.env`: `GOOGLE_CALENDAR_ID=` und `GOOGLE_CALENDAR_API_KEY=`

---

## ✅ PHASE 4: FINANZ & KRYPTO (15 Minuten)

### Kryptowährungen (Kostenlos!)

- [ ] **Crypto API testen:**
  ```bash
  curl http://localhost:3000/api/crypto/price?coin=bitcoin&currency=eur
  ```

### Aktienpreise (Optional)

- [ ] **Alpha Vantage Key** (optional) von https://www.alphavantage.co
- [ ] **In `.env` eingetragen:** `ALPHA_VANTAGE_KEY=`
- [ ] **Aktienpreis testen:**
  ```bash
  curl http://localhost:3000/api/stocks/price?symbol=AAPL
  ```

---

## ✅ PHASE 5: WEITERE APIs (10 Minuten)

- [ ] **Übersetzung testen (KOSTENLOS!):**
  ```bash
  curl "http://localhost:3000/api/translate?text=Hallo&target_lang=en"
  ```

- [ ] **Sonnenauf-/Untergang testen (KOSTENLOS!):**
  ```bash
  curl "http://localhost:3000/api/astronomy/sun"
  ```

- [ ] **QR Code testen (KOSTENLOS!):**
  ```bash
  curl "http://localhost:3000/api/generate/qrcode?text=HelloWorld"
  ```

- [ ] **Fakten testen (KOSTENLOS!):**
  ```bash
  curl http://localhost:3000/api/facts/random
  ```

- [ ] **(Optional) Luftqualität:**
  - [ ] OpenWeather API Key von https://openweathermap.org
  - [ ] In `.env`: `OPENWEATHER_API_KEY=`

---

## ✅ PHASE 6: ESP32 KONFIGURATION (30 Minuten)

- [ ] **ESP32 mit Xiaozhi Firmware geflasht** (sollte bereits erledigt sein)
- [ ] **ESP32 mit WiFi verbunden**
- [ ] **Xiaozhi Webinterface geöffnet** (IP des ESP32)
- [ ] **Proxy-Server eingestellt:**
  - [ ] URL: `http://YOUR_COMPUTER_IP:3000`
  - [ ] Port: `3000`
- [ ] **Xiaozhi Device-Code registriert** auf xiaozhi.me
- [ ] **Xiaozhi neu gestartet**

---

## ✅ PHASE 7: TESTS MIT VOICE COMMANDS (20 Minuten)

### Smart Home

- [ ] *"Schalte das Licht an"* → Antwortet mit Status
- [ ] *"Heizung auf 22 Grad"* → IFTTT/Home Assistant reagiert
- [ ] *"Rollläden schließen"* → Befehl wird ausgeführt

### Nachrichten & Wetter

- [ ] *"Erzähl mir die neuesten Nachrichten"* → News wird erzählt
- [ ] *"Wie ist das Wetter in Berlin?"* → Wetterbericht
- [ ] *"Erzähl mir einen Witz"* → Deutscher Witz wird erzählt

### Zeit & Kalender

- [ ] *"Wie spät ist es?"* → Aktuelle Zeit
- [ ] *"Starte einen 10-Minuten-Timer"* → Timer läuft
- [ ] *"Was steht auf meiner Agenda?"* → (wenn Google Calendar aktiviert)

### Finanzen

- [ ] *"Was kostet Bitcoin?"* → Bitcoin Kurs in Euro
- [ ] *"Tesla Aktienpreis"* → Stock Price (wenn Alpha Vantage aktiviert)

### Sonstiges

- [ ] *"Übersetze 'Guten Morgen' ins Englische"* → "Good Morning"
- [ ] *"Wie ist die Luftqualität?"* → Luftqualität wird angesagt
- [ ] *"Wann geht die Sonne unter?"* → Sonnenuntergang Zeit
- [ ] *"Erzähl mir einen Fakt"* → Zufälliger Fakt

---

## ✅ PHASE 8: PRODUKTION (Optional)

- [ ] **PM2 installiert für automatischen Restart:**
  ```bash
  npm install -g pm2
  pm2 start server.js --name "xiaozhi-proxy"
  pm2 startup
  pm2 save
  ```

- [ ] **Docker (Optional):**
  ```bash
  docker build -t xiaozhi-proxy .
  docker run -p 3000:3000 --env-file .env xiaozhi-proxy
  ```

- [ ] **Server bei Systemstart automatisch starten**

- [ ] **Logs prüfen auf Fehler:**
  ```bash
  pm2 logs xiaozhi-proxy
  ```

---

## 🚨 TROUBLESHOOTING

| Problem | Lösung |
|---------|--------|
| Port 3000 bereits belegt | `npm start -- --port 3001` |
| ESP32 kann nicht verbinden | IP-Adresse prüfen, Firewall öffnen |
| "API Key invalid" | NewsAPI Key erneuern |
| Smart Home antwortet nicht | IFTTT/Home Assistant konfiguration prüfen |
| Timer funktioniert nicht | Server nicht neu gestartet? |
| Slow Response | API-Limits? Rate Limiting? |

---

## 📊 PROJEKT STATUS

```
✅ Basis APIs:      NEWS, WEATHER, JOKES, SPOTIFY, EBOOKS
✅ Smart Home:      IFTTT, HOME ASSISTANT, TASMOTA
✅ Zeit & Kalender: TIME, TIMER, CALENDAR
✅ Finanzen:        CRYPTO (kostenlos), STOCKS (optional)
✅ Weitere APIs:    TRANSLATE, SUNRISE/SUNSET, LUFTQUALITÄT, QR, FAKTEN

GESAMT: 25+ Endpoints verfügbar! 🚀
```

---

## 📚 NÜTZLICHE RESSOURCEN

- **Xiaozhi Dokumentation:** https://github.com/78/xiaozhi-esp32
- **IFTTT:** https://ifttt.com
- **Home Assistant:** https://www.home-assistant.io
- **CoinGecko API:** https://coingecko.com/de/api
- **MyMemory Translator:** https://mymemory.translated.net

---

## 🎉 FERTIG!

Herzlichen Glückwunsch! Dein ESP32-S3 Xiaozhi ist jetzt ein **vollwertiger Smart Home Assistant** mit:

✅ Lokalen Datenquellen (keine China-Defaults mehr!)  
✅ Smart Home Control  
✅ Aktuellen Nachrichten & Wetter  
✅ Zeitfunktionen & Timer  
✅ Finanzinformationen  
✅ Übersetzungen  
✅ Und vielem mehr!

**Viel Spaß damit! 🚀**

---

## 💬 Feedback & Support

Hast du Fragen oder Probleme?
- Schau ins README.md oder FEATURES_GUIDE.md
- Prüf die Logs: `npm start`
- Teste die API direkt: `curl http://localhost:3000/health`

**Happy Automating! 🏠**
