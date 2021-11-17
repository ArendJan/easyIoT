#include <Arduino.h>
#include <ArduinoJson.h>
#include "Adafruit_sensor.h"
#include "Adafruit_AM2320.h"

Adafruit_AM2320 am2320 = Adafruit_AM2320();

int dataAM2320(DynamicJsonDocument& doc)
{

    doc["am_temp"] = am2320.readTemperature();
    doc["am_hum"] = am2320.readHumidity();
}
void initAM2320()
{
    am2320.begin();
}