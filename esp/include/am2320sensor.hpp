#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "sensorFramework.hpp"
int dataAM2320(DynamicJsonDocument &doc);
void initAM2320();
const sensor AM2320 = {.dataFun = dataAM2320, .initFun = initAM2320};