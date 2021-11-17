#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>

#include "sensorFramework.hpp"
inline int dataHeap(DynamicJsonDocument &doc)
{
    doc["heap"] = ESP.getFreeHeap();
}

const sensor heapSensor = {.dataFun = dataHeap};

#define DEBUGGING true