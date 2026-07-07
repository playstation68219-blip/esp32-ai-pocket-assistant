require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================
// EXISTING IMPORTS (from original server.js)
// ============================================

// News, Weather, Jokes, etc. endpoints here
// (Keep all previous endpoints from server.js)

// ============================================
// 1. SMART HOME INTEGRATION
// ============================================

/**
 * IFTTT (If This Then That) - Webhook Support
 * Beispiel: ESP32 kann IFTTT-Events auslösen
 */
app.post('/api/smarthome/ifttt', async (req, res) => {
  try {
    const { action, device, state } = req.body;
    const iftttKey = process.env.IFTTT_WEBHOOK_KEY;

    if (!iftttKey) {
      return res.status(400).json({
        status: 'error',
        message: 'IFTTT Webhook Key nicht konfiguriert'
      });
    }

    // IFTTT Webhook auslösen
    const url = `https://maker.ifttt.com/trigger/${action}/with/key/${iftttKey}`;
    
    const response = await axios.post(url, {
      value1: device,
      value2: state,
      value3: new Date().toISOString()
    });

    res.json({
      status: 'success',
      action: action,
      device: device,
      state: state,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('IFTTT Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'IFTTT Webhook fehlgeschlagen'
    });
  }
});

/**
 * Home Assistant Integration
 * Kontrolliere Lichter, Schalter, Sensoren
 */
app.post('/api/smarthome/homeassistant/control', async (req, res) => {
  try {
    const { device, action, value } = req.body;
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;

    if (!haUrl || !haToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Home Assistant nicht konfiguriert'
      });
    }

    const serviceCall = {
      'light.turn_on': `${haUrl}/api/services/light/turn_on`,
      'light.turn_off': `${haUrl}/api/services/light/turn_off`,
      'switch.turn_on': `${haUrl}/api/services/switch/turn_on`,
      'switch.turn_off': `${haUrl}/api/services/switch/turn_off`
    };

    const url = serviceCall[action];
    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: `Action ${action} nicht unterstützt`
      });
    }

    const response = await axios.post(url, {
      entity_id: device
    }, {
      headers: {
        'Authorization': `Bearer ${haToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      status: 'success',
      action: action,
      device: device,
      result: response.data
    });
  } catch (error) {
    console.error('Home Assistant Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Home Assistant Kontrolle fehlgeschlagen'
    });
  }
});

/**
 * Home Assistant Status abrufen
 */
app.get('/api/smarthome/homeassistant/status', async (req, res) => {
  try {
    const { entity_id } = req.query;
    const haUrl = process.env.HOME_ASSISTANT_URL;
    const haToken = process.env.HOME_ASSISTANT_TOKEN;

    if (!haUrl || !haToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Home Assistant nicht konfiguriert'
      });
    }

    const response = await axios.get(
      `${haUrl}/api/states/${entity_id}`,
      {
        headers: {
          'Authorization': `Bearer ${haToken}`
        }
      }
    );

    res.json({
      status: 'success',
      entity_id: entity_id,
      state: response.data.state,
      attributes: response.data.attributes,
      last_updated: response.data.last_updated
    });
  } catch (error) {
    console.error('Home Assistant Status Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Status abrufen fehlgeschlagen'
    });
  }
});

/**
 * Tasmota Device Control (MQTT Bridge)
 */
app.post('/api/smarthome/tasmota/control', async (req, res) => {
  try {
    const { deviceIp, command, value } = req.body;
    const tasmotaUrl = `http://${deviceIp}/cm`;

    const response = await axios.get(tasmotaUrl, {
      params: {
        cmnd: `${command} ${value}`.trim()
      }
    });

    res.json({
      status: 'success',
      device: deviceIp,
      command: command,
      response: response.data
    });
  } catch (error) {
    console.error('Tasmota Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Tasmota Befehl fehlgeschlagen'
    });
  }
});

// ============================================
// 2. ZEIT & AGENDA
// ============================================

/**
 * Aktuelle Zeit und Datum
 */
app.get('/api/time', (req, res) => {
  const { timezone = 'Europe/Berlin' } = req.query;
  
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const formatted = formatter.format(now);
    const time = now.toLocaleTimeString('de-DE', { timeZone: timezone });
    const date = now.toLocaleDateString('de-DE', { timeZone: timezone });

    res.json({
      status: 'success',
      timezone: timezone,
      time: time,
      date: date,
      formatted: formatted,
      unix_timestamp: Math.floor(now.getTime() / 1000),
      day_of_week: now.toLocaleDateString('de-DE', { timeZone: timezone, weekday: 'long' })
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Zeitzone nicht unterstützt'
    });
  }
});

/**
 * Countdown / Timer
 */
const timers = {};

app.post('/api/time/timer/start', (req, res) => {
  try {
    const { name, minutes } = req.body;
    const timerId = `${name}_${Date.now()}`;
    const endTime = Date.now() + (minutes * 60 * 1000);

    timers[timerId] = {
      name: name,
      started: new Date(),
      duration_minutes: minutes,
      end_time: new Date(endTime),
      remaining_minutes: minutes
    };

    res.json({
      status: 'success',
      timer_id: timerId,
      name: name,
      duration: minutes,
      end_time: new Date(endTime)
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Timer konnte nicht gestartet werden'
    });
  }
});

app.get('/api/time/timer/check', (req, res) => {
  try {
    const { timer_id } = req.query;
    const timer = timers[timer_id];

    if (!timer) {
      return res.status(404).json({
        status: 'error',
        message: 'Timer nicht gefunden'
      });
    }

    const remaining = Math.max(0, timer.end_time - Date.now());
    const remainingMinutes = Math.floor(remaining / 60000);
    const remainingSeconds = Math.floor((remaining % 60000) / 1000);

    if (remaining <= 0) {
      delete timers[timer_id];
      return res.json({
        status: 'finished',
        name: timer.name,
        message: `⏰ Timer "${timer.name}" ist abgelaufen!`
      });
    }

    res.json({
      status: 'running',
      name: timer.name,
      remaining_minutes: remainingMinutes,
      remaining_seconds: remainingSeconds,
      remaining_formatted: `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Timer-Status konnte nicht abgerufen werden'
    });
  }
});

/**
 * Google Calendar Integration (optional)
 */
app.get('/api/calendar/events', async (req, res) => {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

    if (!calendarId || !apiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Google Calendar nicht konfiguriert'
      });
    }

    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        params: {
          key: apiKey,
          maxResults: 10,
          orderBy: 'startTime',
          singleEvents: true,
          timeMin: new Date().toISOString()
        }
      }
    );

    const events = response.data.items.map(event => ({
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      description: event.description || ''
    }));

    res.json({
      status: 'success',
      events: events
    });
  } catch (error) {
    console.error('Calendar Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Kalender konnte nicht abgerufen werden'
    });
  }
});

// ============================================
// 3. ZUSÄTZLICHE APIS
// ============================================

/**
 * Aktienpreise (Alpha Vantage)
 */
app.get('/api/stocks/price', async (req, res) => {
  try {
    const { symbol = 'AAPL' } = req.query;
    const apiKey = process.env.ALPHA_VANTAGE_KEY;

    if (!apiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Alpha Vantage API Key nicht konfiguriert'
      });
    }

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: apiKey
      }
    });

    const quote = response.data['Global Quote'];

    res.json({
      status: 'success',
      symbol: symbol,
      price: quote['05. price'],
      change: quote['09. change'],
      change_percent: quote['10. change percent'],
      timestamp: quote['07. latest trading day']
    });
  } catch (error) {
    console.error('Stocks API Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Aktienpreis konnte nicht abgerufen werden'
    });
  }
});

/**
 * Kryptowährungen (CoinGecko - kostenlos!)
 */
app.get('/api/crypto/price', async (req, res) => {
  try {
    const { coin = 'bitcoin', currency = 'eur' } = req.query;

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
      {
        params: {
          ids: coin,
          vs_currencies: currency,
          include_market_cap: true,
          include_24hr_change: true
        }
      }
    );

    const price = response.data[coin];

    res.json({
      status: 'success',
      coin: coin,
      price: price[currency],
      market_cap: price[`${currency}_market_cap`],
      change_24h: price[`${currency}_24h_change`]
    });
  } catch (error) {
    console.error('Crypto API Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Kryptowährungspreis konnte nicht abgerufen werden'
    });
  }
});

/**
 * Übersetzungen (Google Translate oder libre)
 */
app.get('/api/translate', async (req, res) => {
  try {
    const { text, target_lang = 'en', source_lang = 'auto' } = req.query;

    if (!text) {
      return res.status(400).json({
        status: 'error',
        message: 'Text erforderlich'
      });
    }

    // Nutze MyMemory API (kostenlos, keine API Key nötig)
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: `${source_lang}|${target_lang}`
      }
    });

    res.json({
      status: 'success',
      original: text,
      source_language: source_lang,
      target_language: target_lang,
      translation: response.data.responseData.translatedText
    });
  } catch (error) {
    console.error('Translation Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Übersetzung fehlgeschlagen'
    });
  }
});

/**
 * Air Quality / Luftqualität (OpenWeatherMap)
 */
app.get('/api/air-quality', async (req, res) => {
  try {
    const { city = 'Berlin', lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'OpenWeather API Key nicht konfiguriert'
      });
    }

    let latitude, longitude;

    if (lat && lon) {
      latitude = lat;
      longitude = lon;
    } else {
      // Geocode city name
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct`,
        {
          params: { q: city, limit: 1, appid: apiKey }
        }
      );

      if (geoResponse.data.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: `Stadt "${city}" nicht gefunden`
        });
      }

      latitude = geoResponse.data[0].lat;
      longitude = geoResponse.data[0].lon;
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution`,
      {
        params: {
          lat: latitude,
          lon: longitude,
          appid: apiKey
        }
      }
    );

    const aqi = response.data.list[0].main.aqi;
    const aqiLabel = ['Gut', 'Fair', 'Moderat', 'Schlecht', 'Sehr Schlecht'][aqi - 1];

    res.json({
      status: 'success',
      city: city,
      aqi_index: aqi,
      aqi_label: aqiLabel,
      components: response.data.list[0].components
    });
  } catch (error) {
    console.error('Air Quality Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Luftqualität konnte nicht abgerufen werden'
    });
  }
});

/**
 * Sunrise/Sunset Times
 */
app.get('/api/astronomy/sun', async (req, res) => {
  try {
    const { lat = 52.52, lon = 13.405 } = req.query; // Berlin default

    const response = await axios.get('https://api.sunrise-sunset.org/json', {
      params: {
        lat: lat,
        lng: lon,
        formatted: 0
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error('API returned error');
    }

    const results = response.data.results;

    res.json({
      status: 'success',
      sunrise: results.sunrise,
      sunset: results.sunset,
      civil_twilight_begin: results.civil_twilight_begin,
      civil_twilight_end: results.civil_twilight_end,
      day_length: results.day_length
    });
  } catch (error) {
    console.error('Astronomy Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Sonnenaufgang/Sonnenuntergang konnte nicht abgerufen werden'
    });
  }
});

/**
 * QR Code Generator
 */
app.get('/api/generate/qrcode', (req, res) => {
  try {
    const { text, size = 300 } = req.query;

    if (!text) {
      return res.status(400).json({
        status: 'error',
        message: 'Text erforderlich'
      });
    }

    // Nutze QR Server API (kostenlos)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;

    res.json({
      status: 'success',
      text: text,
      qr_code_url: qrUrl
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'QR Code konnte nicht generiert werden'
    });
  }
});

/**
 * Random Facts
 */
app.get('/api/facts/random', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;

    // Nutze USELESS FACTS API
    const response = await axios.get('https://uselessfacts.jsond.com/random.json');

    res.json({
      status: 'success',
      fact: response.data.text
    });
  } catch (error) {
    console.error('Facts Error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Fakt konnte nicht abgerufen werden'
    });
  }
});

module.exports = app;
