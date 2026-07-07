# ESP32-S3 Xiaozhi Local API Proxy - Quick Start Guide

## 🎯 Ziel

Dein ESP32-S3 bekommt **aktuelle lokale Daten**:
- 📰 Nachrichten aus deiner Region
- 🌤️ Aktuelles Wetter
- 😂 Deutsche Witze
- 🎵 Spotify-Integration
- 📚 eBook-Katalog

---

## ⚡ Schnellstart (5 Minuten)

### 1️⃣ Ordner erstellen und Files herunterladen

```bash
# Im Projekt-Verzeichnis
cd local-api-proxy

# Abhängigkeiten installieren
npm install
```

### 2️⃣ API-Keys besorgen

**NewsAPI (kostenlos):**
- Geh zu https://newsapi.org
- Registriere dich → Copy API Key
- Paste in `.env` Datei:

```bash
cp .env.example .env
# Editiere .env und füge deinen KEY ein
```

### 3️⃣ Server starten

```bash
npm start
```

✅ Server läuft jetzt unter **`http://localhost:3000`**

---

## 🔗 ESP32 konfigurieren

Damit der ESP32 deinen lokalen Server nutzt:

1. **ESP32 Web-Interface öffnen** (nach Setup)
   - URL: `http://ESP32_IP` (oder Xiaozhi-XXXX)

2. **Proxy-Server einstellen**
   - Suche Settings → API Endpoint
   - Trag ein: `http://YOUR_COMPUTER_IP:3000`
   - Port: `3000`

3. **Testen**
   - Sage: *"Erzähl mir einen Witz"*
   - Sage: *"Wie ist das Wetter?"*
   - Sage: *"Nachrichten"*

---

## 📡 Beispiel-API-Aufrufe (für Tests)

### News testen:
```bash
curl "http://localhost:3000/api/news?country=de"
```

### Wetter testen:
```bash
curl "http://localhost:3000/api/weather?city=Berlin"
```

### Witz testen:
```bash
curl "http://localhost:3000/api/jokes?lang=de"
```

### Health Check:
```bash
curl "http://localhost:3000/health"
```

---

## 🚨 Häufige Probleme

| Problem | Lösung |
|---------|--------|
| Port 3000 bereits in Benutzung | `npm start -- --port 3001` |
| "API Key invalid" | NewsAPI Key prüfen/erneuern |
| ESP32 kann nicht verbinden | Firewall für Port 3000 öffnen |
| "Service Unavailable" | Internets-Verbindung prüfen |

---

## 📚 Komplette API-Dokumentation

Siehe `README.md` für alle verfügbaren Endpoints!

---

## 🎉 Das war's!

Dein ESP32-S3 hat jetzt:
- ✅ Aktuelle deutsche Nachrichten
- ✅ Echtzeit-Wetterdaten
- ✅ Deutsche Witze & Witze auf Englisch
- ✅ Spotify-Integration
- ✅ eBook-Katalog

**Viel Spaß damit! 🚀**
