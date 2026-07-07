require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================
// GEMINI AI INTEGRATION
// ============================================

/**
 * Google Gemini API Client
 * Unterstützt Echtzeit-Suche & Analyse
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'models/gemini-2.0-flash';

/**
 * Einfache Gemini Anfrage (nur Text)
 * POST /api/gemini/chat
 */
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, system_prompt = null } = req.body;

    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt erforderlich'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        status: 'error',
        message: 'Gemini API Key nicht konfiguriert'
      });
    }

    const requestBody = {
      model: GEMINI_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.9
      }
    };

    // Füge System-Prompt hinzu wenn vorhanden
    if (system_prompt) {
      requestBody.system = system_prompt;
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Antwort';

    res.json({
      status: 'success',
      model: GEMINI_MODEL,
      prompt: prompt,
      response: content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini Chat Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gemini Anfrage fehlgeschlagen',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Gemini mit Web-Suche (Echtzeit-Daten)
 * POST /api/gemini/search-and-analyze
 */
app.post('/api/gemini/search-and-analyze', async (req, res) => {
  try {
    const { query, context = null } = req.body;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Query erforderlich'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        status: 'error',
        message: 'Gemini API Key nicht konfiguriert'
      });
    }

    // Verwende Gemini mit Google Search Tool
    const requestBody = {
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: query
            }
          ]
        }
      ],
      tools: [
        {
          googleSearch: {}  // Aktiviert Google Search
        }
      ],
      generationConfig: {
        temperature: 1,
        topP: 0.5,
        maxOutputTokens: 4096,
        thinking: {
          type: 'REASONING_EFFORT',
          budget_tokens: 10000
        }
      }
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    // Extrahiere Antwort und Source-Informationen
    const candidates = response.data.candidates || [];
    const text = candidates[0]?.content?.parts?.[0]?.text || 'Keine Antwort';
    const citations = candidates[0]?.content?.parts?.filter(p => p.webSearch) || [];

    res.json({
      status: 'success',
      model: GEMINI_MODEL,
      query: query,
      analysis: text,
      has_web_search: citations.length > 0,
      citations_count: citations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini Search Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gemini Suche fehlgeschlagen',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Gemini Realtime (Streaming für schnelle Antworten)
 * POST /api/gemini/realtime
 */
app.post('/api/gemini/realtime', async (req, res) => {
  try {
    const { prompt, max_tokens = 1024 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        status: 'error',
        message: 'Prompt erforderlich'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        status: 'error',
        message: 'Gemini API Key nicht konfiguriert'
      });
    }

    // Schnelle Antwort mit niedriger Temperatur
    const requestBody = {
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,  // Niedrig für schnelle, fokussierte Antworten
        maxOutputTokens: max_tokens,
        topP: 0.8
      }
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        timeout: 30000
      }
    );

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Antwort';
    const tokens = response.data.usageMetadata || {};

    res.json({
      status: 'success',
      response: content,
      tokens_used: {
        input: tokens.promptTokenCount || 0,
        output: tokens.candidatesTokenCount || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini Realtime Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gemini Realtime Anfrage fehlgeschlagen',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Gemini Zusammenfassung (Echtzeit-News, URLs, etc.)
 * POST /api/gemini/summarize
 */
app.post('/api/gemini/summarize', async (req, res) => {
  try {
    const { text, style = 'bullet_points', language = 'de' } = req.body;

    if (!text || text.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Text zum Zusammenfassen erforderlich'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        status: 'error',
        message: 'Gemini API Key nicht konfiguriert'
      });
    }

    // Style-Mapping
    const stylePrompt = {
      bullet_points: 'Erstelle eine prägnante Zusammenfassung mit 3-5 Bulletpoints',
      paragraph: 'Fasse den Text in einem Absatz zusammen',
      short: 'Erstelle eine Ein-Satz-Zusammenfassung',
      detailed: 'Erstelle eine ausführliche Zusammenfassung mit Kontext'
    }[style] || 'Erstelle eine prägnante Zusammenfassung';

    const prompt = `${stylePrompt} in ${language}:\n\n${text}`;

    const requestBody = {
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024,
        topP: 0.9
      }
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    const summary = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Zusammenfassung möglich';

    res.json({
      status: 'success',
      original_length: text.length,
      style: style,
      language: language,
      summary: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini Summarize Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gemini Zusammenfassung fehlgeschlagen',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Gemini mit Realtime-News Analyse
 * GET /api/gemini/analyze-news
 */
app.get('/api/gemini/analyze-news', async (req, res) => {
  try {
    const { newsApiKey = process.env.NEWS_API_KEY, category = 'general', country = 'de' } = req.query;

    if (!newsApiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'News API Key erforderlich'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        status: 'error',
        message: 'Gemini API Key nicht konfiguriert'
      });
    }

    // Hole aktuelle News
    const newsResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: country,
        category: category,
        apiKey: newsApiKey,
        sortBy: 'publishedAt',
        pageSize: 5
      }
    });

    const articles = newsResponse.data.articles || [];
    const newsText = articles
      .map((article, i) => `${i + 1}. ${article.title}\n${article.description || ''}`)
      .join('\n\n');

    if (!newsText || newsText.length === 0) {
      return res.json({
        status: 'success',
        analysis: 'Keine Nachrichten gefunden',
        articles: 0
      });
    }

    // Analysiere mit Gemini
    const analysisPrompt = `Analysiere diese aktuellen Nachrichten und gib:
1. Haupttrends
2. Wichtigste Ereignisse
3. Auswirkungen und Bedeutung

Nachrichten:\n${newsText}`;

    const requestBody = {
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: analysisPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.9
      }
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    const analysis = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Analyse möglich';

    res.json({
      status: 'success',
      articles_analyzed: articles.length,
      category: category,
      country: country,
      analysis: analysis,
      articles: articles.map(a => ({
        title: a.title,
        source: a.source.name,
        publishedAt: a.publishedAt
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini News Analysis Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gemini News Analyse fehlgeschlagen',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Gemini Wetter-Analyse mit Echtzeit-Daten
 * GET /api/gemini/analyze-weather
 */
app.get('/api/gemini/analyze-weather', async (req, res) => {
  try {
    const { city = 'Berlin', openweatherKey = process.env.OPENWEATHER_API_KEY } = req.query;

    if (!openweatherKey) {
      return res.status(400).json({
        status: 'error',
        message: 'OpenWeather API Key erforderlich'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        status: 'error',
        message: 'Gemini API Key nicht konfiguriert'
      });
    }

    // Hole Wetterdaten
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: openweatherKey,
        units: 'metric',
        lang: 'de'
      }
    });

    const weather = weatherResponse.data;
    const weatherText = `
Stadt: ${weather.name}
Temperatur: ${weather.main.temp}°C
Gefühlte Temperatur: ${weather.main.feels_like}°C
Wetterbedingung: ${weather.weather[0].description}
Luftfeuchtigkeit: ${weather.main.humidity}%
Luftdruck: ${weather.main.pressure} hPa
Windgeschwindigkeit: ${weather.wind.speed} m/s
Bewölkung: ${weather.clouds.all}%
`;

    // Analysiere mit Gemini
    const analysisPrompt = `Analysiere diese Wetterdaten und gib:
1. Eine kurze Wettervorhersage für die nächsten Stunden
2. Empfehlungen (Kleidung, Aktivitäten)
3. Warnung vor extremen Bedingungen falls vorhanden

${weatherText}`;

    const requestBody = {
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: analysisPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.9
      }
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    const analysis = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Analyse möglich';

    res.json({
      status: 'success',
      city: city,
      current_weather: {
        temp: weather.main.temp,
        condition: weather.weather[0].description,
        humidity: weather.main.humidity
      },
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini Weather Analysis Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gemini Wetter-Analyse fehlgeschlagen',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Gemini für komplexe Problemlösung
 * POST /api/gemini/solve-problem
 */
app.post('/api/gemini/solve-problem', async (req, res) => {
  try {
    const { problem, context = '', expertise_level = 'beginner' } = req.body;

    if (!problem) {
      return res.status(400).json({
        status: 'error',
        message: 'Problem erforderlich'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        status: 'error',
        message: 'Gemini API Key nicht konfiguriert'
      });
    }

    const systemPrompt = `Du bist ein erfahrener Problem-Löser. 
Expertise Level des Nutzers: ${expertise_level}
Erkläre Lösungen auf diesem Level.
Gib praktische, umsetzbare Schritte.`;

    const userPrompt = context ? `${problem}\n\nKontext: ${context}` : problem;

    const requestBody = {
      model: GEMINI_MODEL,
      system: systemPrompt,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
        topP: 0.9
      }
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    const solution = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Lösung möglich';

    res.json({
      status: 'success',
      problem: problem,
      expertise_level: expertise_level,
      solution: solution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini Problem Solving Error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Gemini Problem-Lösung fehlgeschlagen',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    gemini_configured: !!GEMINI_API_KEY,
    model: GEMINI_MODEL,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
