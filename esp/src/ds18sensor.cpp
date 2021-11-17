#include <Arduino.h>
#include <ArduinoJson.h>
#include "OneWire.h"
#include "DallasTemperature.h"
#include <Wire.h>
#include "ds18sensor.hpp"
float temp_ds18 = 0;
float temp_ds18_prev = 0;
// DS18  = {.dataFun = dataDS18, .initFun = initDS18};
#define ONE_WIRE_BUS 32
OneWire oneWire(ONE_WIRE_BUS);
// Pass our oneWire reference to Dallas Temperature sensor
DallasTemperature temp_sensor(&oneWire);

int dataDS18(DynamicJsonDocument &doc)
{

  if (temp_sensor.getDS18Count() == 0)
  {
    temp_sensor.begin();
    Serial.println("DS18B20 sensor not found!");
  }
  else
  {
    temp_sensor.requestTemperatures();
    // float temperatureC = sensors.getTempCByIndex(0);
    delay(1000);
    temp_ds18_prev = temp_ds18;
    temp_ds18 = temp_sensor.getTempCByIndex(0);

    // if (temp_ds18 > 80 || temp_ds18 < -100)
    // {
    //     temp_ds18 = temp_ds18_prev;
    // }
    Serial.print("Temp DS18B20 : ");
    Serial.print(temp_ds18);
    Serial.println("ºC");
    doc["DS18_temp"] = temp_ds18;
  }
}

void initDS18()
{

  // Wire.begin(21, 22);  // Start I2c bus
  temp_sensor.begin(); // Start DS18B20 temperature sensor
}

int checkDS18()
{
  int error = false;
  if ((temp_ds18 == 85) || (temp_ds18 == DEVICE_DISCONNECTED_C))
  {
    send_log(false, "DS18 reports disconnected value during system check.");
    error = true;
  }
  if (temp_sensor.getDS18Count() == 0)
  {
    send_log(false, "DS18 not found during system check.");
    error = true;
  }
  return error;
}