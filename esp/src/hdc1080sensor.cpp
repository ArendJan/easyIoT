#include <Arduino.h>
#include <ArduinoJson.h>
#include "hdc1080sensor.hpp"
#include "ClosedCube_HDC1080.h"

ClosedCube_HDC1080 hdc1080;
float hum = 0;

void initHDC1080()
{
    hdc1080.begin(0x40); // Start HDC1080 sensor
}

int dataHDC1080(DynamicJsonDocument &doc)
{

    hum = hdc1080.readHumidity();
    Serial.print("RH=");
    Serial.print(hum);
    Serial.println("%");
    doc["hdc_hum"] = hdc1080.readHumidity();
}