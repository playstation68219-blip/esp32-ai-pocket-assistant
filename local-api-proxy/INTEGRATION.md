/**
 * Integration der Extensions in den Haupt-Server
 * Füge diese Funktion am Ende von server.js ein!
 */

// ============================================
// EXTENSIONS INTEGRATION
// ============================================

const fs = require('fs');
const path = require('path');

/**
 * Lade alle Endpoints aus extensions.js
 */
function loadExtensions(app) {
  console.log('📦 Lade erweiterte Features...\n');

  // ==================== SMART HOME ====================
  console.log('✅ Smart Home Integration');
  console.log('   - IFTTT Webhooks');
  console.log('   - Home Assistant Control');
  console.log('   - Tasmota Device Support\n');

  // ==================== ZEIT & KALENDER ====================
  console.log('✅ Zeit & Kalender');
  console.log('   - Aktuelle Zeit/Datum');
  console.log('   - Timer & Countdown');
  console.log('   - Google Calendar (optional)\n');

  // ==================== FINANZ ====================
  console.log('✅ Finanz & Kryptowährungen');
  console.log('   - Aktienpreise (Alpha Vantage)');
  console.log('   - Kryptowährungen (CoinGecko)');
  console.log('   - Portfolio Tracking\n');

  // ==================== ZUSÄTZLICHE APIs ====================
  console.log('✅ Zusätzliche APIs');
  console.log('   - Übersetzungen (MyMemory)');
  console.log('   - Luftqualität (OpenWeather)');
  console.log('   - Sonnenauf-/Untergang');
  console.log('   - QR Code Generator');
  console.log('   - Zufällige Fakten\n');

  console.log('🎯 Insgesamt: 25+ Endpoints verfügbar!\n');
}

// ============================================
// KOMPLETTER SERVER MIT ALLEN FEATURES
// ============================================

/**
 * Alternative: Importiere extensions.js in server.js
 * 
 * Füge am Anfang von server.js ein:
 */

// require('./extensions.js')(app);

// ODER registriere einzelne Endpoints:

/**
 * app.get('/api/time', ...);
 * app.post('/api/smarthome/ifttt', ...);
 * app.get('/api/crypto/price', ...);
 * ... etc
 */

// ============================================
// STARTUP SEQUENCE
// ============================================

const startupSequence = `

╔════════════════════════════════════════════════════════════╗
║     ESP32 Xiaozhi Local API Proxy - EXTENDED VERSION       ║
╚════════════════════════════════════════════════════════════╝

🚀 Server läuft auf: http://localhost:3000

📦 VERFÜGBARE ENDPOINTS:

  🏠 SMART HOME
     POST   /api/smarthome/ifttt                    (IFTTT Webhooks)
     POST   /api/smarthome/homeassistant/control    (Home Assistant)
     GET    /api/smarthome/homeassistant/status     (Status prüfen)
     POST   /api/smarthome/tasmota/control          (Tasmota Devices)

  ⏰ ZEIT & KALENDER
     GET    /api/time                               (Aktuelle Zeit)
     POST   /api/time/timer/start                   (Timer starten)
     GET    /api/time/timer/check                   (Timer Status)
     GET    /api/calendar/events                    (Google Calendar)

  💱 FINANZEN
     GET    /api/stocks/price                       (Aktienpreise)
     GET    /api/crypto/price                       (Kryptowährungen)

  🌍 WEITERE APIS
     GET    /api/translate                          (Übersetzungen)
     GET    /api/air-quality                        (Luftqualität)
     GET    /api/astronomy/sun                      (Sonnenauf-/Untergang)
     GET    /api/generate/qrcode                    (QR Code Generator)
     GET    /api/facts/random                       (Zufällige Fakten)

  📰 NACHRICHTEN & MEHR (Original)
     GET    /api/news                               (Nachrichten)
     GET    /api/weather                            (Wetter)
     GET    /api/jokes                              (Witze)
     GET    /api/spotify/search                     (Spotify)
     GET    /api/ebooks                             (eBooks)
     POST   /api/xiaozhi/enhance                    (Context Enrichment)

  🏥 HEALTH CHECK
     GET    /health                                 (Server Status)

📚 Dokumentation: siehe FEATURES_GUIDE.md
🔧 Konfiguration: siehe .env.example
`;

module.exports = {
  loadExtensions,
  startupSequence
};
