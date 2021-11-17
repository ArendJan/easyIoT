#include <Arduino.h>
#include <ArduinoJson.h>
#include "Adafruit_CCS811.h"
#include "ccs811sensor.hpp"
Adafruit_CCS811 ccs;

#warning needs hdc1080 and ds18 sensor to go before this sensor in the sensors list
int dataCCS811(DynamicJsonDocument &doc)
{

    if (ccs.available())
    {
        float amhumVal = doc["am_hum"];
        float dsvalue = doc["DS18_temp"];
        ccs.setEnvironmentalData(amhumVal, dsvalue);

        if (!ccs.readData())
        {
            Serial.print("CO2: ");
            Serial.print(ccs.geteCO2());
            Serial.print("ppm, TVOC: ");
            Serial.print(ccs.getTVOC());
            Serial.println("ppb");
        }
        else
        {
            Serial.println("ERROR with CCS811 sensor!!");
        }
    }
    else
    {
        Serial.println("CCS811 sensor unavailable!");
    }
    doc["CO2_ppm"] = ccs.geteCO2();
    doc["TVOC_ppb"] = ccs.getTVOC();
}

void initCCS811()
{

    /******************************* CCS811 Initialisation ************************************/
    if (!ccs.begin())
    {
        Serial.println("Failed to start CCS811 sensor! Please check your wiring.");
        while (1)
            ;
    }

    while (!ccs.available())
        ;   // Wait for CCS811 sensor to boot
            // ccs.setDriveMode(CCS811_DRIVE_MODE_IDLE); // disable heating element of CCS811
}