#include <Arduino.h>

#include "sensorFramework.hpp"
#include "main.hpp"
#include <ArduinoJson.h>

int send_log(bool error, String message)
{
  String output;
  DynamicJsonDocument doc(300);
  if (error == true)
  {
    doc["error"] = message;
  }
  else
  {
    doc["Log"] = message;
  }
  doc["password"] = password;
  serializeJson(doc, output);

  HTTPClient http;
  http.begin(serverName, root_ca);
  // If you need an HTTP request with a content type: application/json, use the following:
  http.addHeader("Content-Type", "application/json");

  // Send HTTP POST request
  int httpResponseCode = http.POST(output);
  if (DEBUGGING)
  {
    Serial.println(message);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    Serial.println(http.getString());
  }

  // Free resources
  http.end();
  return httpResponseCode;
}
