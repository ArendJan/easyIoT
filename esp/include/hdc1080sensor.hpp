#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "sensorFramework.hpp"
int dataHDC1080(DynamicJsonDocument &doc);
void initHDC1080();
const sensor HDC1080 = {.dataFun = dataHDC1080, .initFun = initHDC1080};