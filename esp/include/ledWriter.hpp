#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "sensorFramework.hpp"

void dataLedwriter(DynamicJsonDocument &);

void initLedWriter();

const reader ledWriter = {.readFun = dataLedwriter, .initFun = initLedWriter};