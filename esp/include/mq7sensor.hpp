#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "sensorFramework.hpp"
int dataMQ7(DynamicJsonDocument &doc);
void initMQ7();
const sensor MQ7Sensor = {.dataFun = dataMQ7, .initFun = initMQ7};