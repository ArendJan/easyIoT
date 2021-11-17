#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "sensorFramework.hpp"
int dataCCS811(DynamicJsonDocument &doc);
void initCCS811();
const sensor CCS811 = {.dataFun = dataCCS811, .initFun = initCCS811};