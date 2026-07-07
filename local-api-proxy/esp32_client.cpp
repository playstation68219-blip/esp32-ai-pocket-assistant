/**
 * ESP32 Xiaozhi - HTTP Client für lokalen Proxy Server
 * Verwende diesen Code, um den Proxy vom ESP32 aus zu nutzen
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==================== KONFIGURATION ====================

const char* PROXY_SERVER = "http://192.168.X.X:3000"; // Deine Computer IP
const char* ENDPOINT_NEWS = "/api/news";
const char* ENDPOINT_WEATHER = "/api/weather";
const char* ENDPOINT_JOKES = "/api/jokes";
const char* ENDPOINT_ENHANCE = "/api/xiaozhi/enhance";

// ==================== NEWS ABRUFEN ====================

void getNews() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(PROXY_SERVER) + ENDPOINT_NEWS + "?country=de&category=general";
    
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode == 200) {
      String payload = http.getString();
      Serial.println("📰 Nachrichten:");
      Serial.println(payload);
      
      // JSON parsen (optional)
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, payload);
      
      if (doc["articles"].size() > 0) {
        String title = doc["articles"][0]["title"];
        Serial.print("Headline: ");
        Serial.println(title);
      }
    } else {
      Serial.print("HTTP Error: ");
      Serial.println(httpCode);
    }
    http.end();
  }
}

// ==================== WETTER ABRUFEN ====================

void getWeather(String city = "Berlin") {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(PROXY_SERVER) + ENDPOINT_WEATHER + "?city=" + city + "&lang=de";
    
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode == 200) {
      String payload = http.getString();
      Serial.println("🌤️ Wetter:");
      
      DynamicJsonDocument doc(512);
      deserializeJson(doc, payload);
      
      float temp = doc["current"]["temperature"];
      String condition = doc["current"]["condition"];
      
      Serial.print("Temperatur: ");
      Serial.print(temp);
      Serial.print("°C - ");
      Serial.println(condition);
    }
    http.end();
  }
}

// ==================== WITZE ABRUFEN ====================

void getJoke() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(PROXY_SERVER) + ENDPOINT_JOKES + "?lang=de";
    
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode == 200) {
      String payload = http.getString();
      DynamicJsonDocument doc(512);
      deserializeJson(doc, payload);
      
      String type = doc["type"];
      
      if (type == "single") {
        String joke = doc["joke"];
        Serial.print("😂 Witz: ");
        Serial.println(joke);
      } else if (type == "twopart") {
        String setup = doc["setup"];
        String delivery = doc["delivery"];
        Serial.print("Setup: ");
        Serial.println(setup);
        Serial.print("Punchline: ");
        Serial.println(delivery);
      }
    }
    http.end();
  }
}

// ==================== CONTEXT ANREICHERUNG ====================

void enhanceContext(String query) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(PROXY_SERVER) + ENDPOINT_ENHANCE;
    
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    // JSON Request erstellen
    StaticJsonDocument<256> doc;
    doc["query"] = query;
    doc["context"] = "voice_assistant";
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpCode = http.POST(jsonString);
    
    if (httpCode == 200) {
      String payload = http.getString();
      Serial.println("🔄 Enhanced Context:");
      Serial.println(payload);
    }
    http.end();
  }
}

// ==================== HEALTH CHECK ====================

bool checkProxyHealth() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(PROXY_SERVER) + "/health";
    
    http.begin(url);
    int httpCode = http.GET();
    http.end();
    
    return (httpCode == 200);
  }
  return false;
}

// ==================== SETUP ====================

void setup() {
  Serial.begin(115200);
  delay(100);
  
  Serial.println("\n\n🚀 ESP32 Xiaozhi Local Proxy Client");
  
  // WiFi verbindung (annahme: bereits verbunden von Xiaozhi)
  Serial.println("📡 Verbinde zum WiFi...");
  
  // Test Health
  delay(2000);
  if (checkProxyHealth()) {
    Serial.println("✅ Proxy-Server erreichbar!");
  } else {
    Serial.println("❌ Proxy-Server nicht erreichbar");
    Serial.println("Prüfe: IP, Port, Firewall");
  }
}

// ==================== LOOP ====================

void loop() {
  delay(5000);
  
  // Nachrichten alle 30 Sekunden abrufen
  static unsigned long lastNews = 0;
  if (millis() - lastNews > 30000) {
    Serial.println("\n--- News Update ---");
    getNews();
    lastNews = millis();
  }
  
  // Wetter alle 60 Sekunden abrufen
  static unsigned long lastWeather = 0;
  if (millis() - lastWeather > 60000) {
    Serial.println("\n--- Weather Update ---");
    getWeather("Berlin");
    lastWeather = millis();
  }
  
  // Witze auf Anfrage (simuliert)
  static unsigned long lastJoke = 0;
  if (millis() - lastJoke > 120000) {
    Serial.println("\n--- Daily Joke ---");
    getJoke();
    lastJoke = millis();
  }
}

/**
 * VERWENDUNG:
 * 
 * 1. CORS muss im Server aktiviert sein (ist es bereits)
 * 2. Ersetze "192.168.X.X" mit der IP deines Computers
 * 3. Stelle sicher, dass Port 3000 offen ist
 * 4. Upload zu ESP32-S3 mit Arduino IDE oder PlatformIO
 * 
 * Funktionen:
 * - getNews()          - Ruft aktuelle Nachrichten ab
 * - getWeather(city)   - Wetterdaten für eine Stadt
 * - getJoke()          - Zufälliger Witz
 * - enhanceContext()   - Context-Anreicherung für Xiaozhi
 * - checkProxyHealth() - Testet Proxy-Verbindung
 */
