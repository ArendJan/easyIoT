#include <Arduino.h>
#include "main.hpp"
#include <WiFiManager.h> //https://github.com/tzapu/WiFiManager
#include <SPI.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include "am2320sensor.hpp"
#include "ccs811sensor.hpp"
#include "ds18sensor.hpp"
#include "hdc1080sensor.hpp"
#include "mq7sensor.hpp"
#include "ledWriter.hpp"
#include "mhz19Sensor.hpp"
#include "heapSensor.hpp"

WiFiClientSecure client;
const char* serverName = "https://<URL>/push/<ID>"; // already has id to have less string operations.
const char* password = "<EDIT>";
const char *root_ca = "<EDIT if you want HTTPS>";

//Declare Sensors

const int LedBlue = 33;
const int LedWhite = 14;
const int SignalBlue = 3;
const int SignalWhite = 4;

int responsecode = 0;

const sensor sensors[] = {
    AM2320,
    DS18,
    CCS811,
    MQ7Sensor,
    MHZ19Sensor,
    heapSensor};

const reader readers[] = {ledWriter};

void setup()
{
  Serial.begin(115200);
  delay(1000); // Gives one wire bus time to initialise

  ledcSetup(SignalBlue, 5000, 8);
  ledcSetup(SignalWhite, 5000, 8);

  ledcAttachPin(LedBlue, SignalBlue);
  ledcAttachPin(LedWhite, SignalWhite);

  //WiFiManager, Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wm;

  // Automatically connect using saved credentials,
  // if connection fails, it starts an access point with the specified name ( "roomCare"),
  // if empty will auto generate SSID, if password is blank it will be anonymous AP (wm.autoConnect())
  // then goes into a blocking loop awaiting configuration and will return success result

  bool res;

  res = wm.autoConnect("roomCare"); // password protected ap

  if (!res)
  {
    Serial.println("Failed to connect");
    ESP.restart();
  }
  else
  {
    //if you get here you have connected to the WiFi
    Serial.println("connected...yeey :)");
  }

  initSensors(sensors);
  initReaders(readers);
  send_log(false, "Booted!");
}

void loop()
{
  Serial.println("**************************************************************************************************");

  //Check WiFi connection status
  if (WiFi.status() == WL_CONNECTED)
  {
    if (ledcReadFreq(SignalBlue) <= 0)
    {
      ledcWrite(SignalBlue, 150);
    }
    sendData();
    systemCheck();
  }
  else
  {
    Serial.println("WiFi Disconnected");
    ledcWrite(SignalBlue, 0);
  }

  if (responsecode == 200)
  {
    ledcWrite(SignalWhite, 50);
  }
  else
  {
    ledcWrite(SignalWhite, 0);
  }

  responsecode = 0;

  delay(2000); //Sampling frequency
}

void sendData()
{

  DynamicJsonDocument doc(300);

  //
  readSensors(sensors, doc);
  doc["password"] = password;
  String output;
  serializeJson(doc, output);

  HTTPClient http;

  // Your Domain name with URL path or IP address with path
  if (prefix(serverName, "https"))
  {
    http.begin(serverName, root_ca);
  }
  else
  {
    http.begin(serverName);
  }
  http.addHeader("Content-Type", "application/json");

  // Send HTTP POST request
  int httpPostResponseCode = http.POST(output);

  Serial.print("Payload : ");
  String payload = http.getString();
  Serial.println(payload);

  Serial.print("Post http code : ");
  Serial.println(httpPostResponseCode);
  if (httpPostResponseCode == 200)
  {
    if (DeserializationError::Code::Ok == deserializeJson(doc, payload).code())
    {
      doReaders(readers, doc);
    }
  }
  responsecode = httpPostResponseCode;

  // Free resources
  http.end();
}

void systemCheck()
{
  int error = checkSensors(sensors);

  if (error)
  {
    Serial.printf("Error while checking the sensors: %i", error);
  }
}

bool prefix(const char *pre, const char *str)
{
    return strncmp(pre, str, strlen(pre)) == 0;
}