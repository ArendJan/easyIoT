#include "sensorFramework.hpp"
const int SignalRed = 0;
const int SignalYellow = 1;
const int SignalGreen = 2;
const int LedRed = 25;
const int LedYellow = 26;
const int LedGreen = 27;
const int LedOrange = 32;

void dataLedwriter(DynamicJsonDocument &doc)
{
    if (doc.containsKey("CO2_ppm") && doc.containsKey("hdc_hum"))
    {
        float PPM = doc["CO2_ppm"];
        float hum = doc["hdc_hum"];
        if ((int)PPM >= 500 || (int)hum >= 60)
        {
            ledcWrite(SignalRed, 40);
            ledcWrite(SignalYellow, 40);
            ledcWrite(SignalGreen, 255);
        }
        else if (((int)PPM >= 10 && (int)PPM < 500) || ((int)hum >= 50 && (int)hum < 60))
        {
            ledcWrite(SignalYellow, 40);
            ledcWrite(SignalGreen, 255);
            ledcWrite(SignalRed, 0);
        }
        else if ((int)PPM <= 10 || (int)hum < 50)
        {
            ledcWrite(SignalGreen, 255);
            ledcWrite(SignalYellow, 0);
            ledcWrite(SignalRed, 0);
        }
    }
    if (doc.containsKey("warning"))
    {
        digitalWrite(LedOrange, (boolean)doc["warning"]);
    }
}

void initLedWriter()
{

    ledcSetup(SignalRed, 5000, 8);
    ledcSetup(SignalYellow, 5000, 8);
    ledcSetup(SignalGreen, 5000, 8);

    ledcAttachPin(LedRed, SignalRed);
    ledcAttachPin(LedYellow, SignalYellow);
    ledcAttachPin(LedGreen, SignalGreen);
    pinMode(LedOrange, OUTPUT);
}