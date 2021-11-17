#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include <MHZ19.h>

#include "sensorFramework.hpp"
int dataMHZ19(DynamicJsonDocument &doc);
void initMHZ19();
int checkMHZ19();
const sensor MHZ19Sensor = {.dataFun = dataMHZ19, .initFun = initMHZ19, .checkFun = checkMHZ19};

#define DEBUGGING true