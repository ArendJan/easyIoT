#ifndef ds18_sens
#define ds18_sens
#include <Arduino.h>
#include <ArduinoJson.h>
#include "sensorFramework.hpp"
int dataDS18(DynamicJsonDocument &doc);
void initDS18();
int checkDS18();
const sensor DS18 = {.dataFun = dataDS18, .initFun = initDS18, .checkFun = checkDS18};

#endif