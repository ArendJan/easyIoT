#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

typedef int (*getDataSensor)(DynamicJsonDocument &);
typedef void (*initSensor)(void);
typedef void (*onDataSensor)(DynamicJsonDocument &);
typedef int (*checkSensor)(void);
typedef struct sensor
{
    getDataSensor dataFun;
    initSensor initFun;
    checkSensor checkFun;
} sensor;

typedef void (*readReturn)(DynamicJsonDocument &);
typedef void (*initReader)(void);

typedef struct reader
{
    readReturn readFun;
    initReader initFun;
} reader;

int send_log(bool, String);

// Has to be in the header file because of the template
template <size_t S>
void initSensors(const sensor (&sensors)[S])
{
    for (const sensor sensorI : sensors)
    {
        if (sensorI.initFun != NULL)
        {
            sensorI.initFun();
        }
    }
}

template <size_t S>
void readSensors(const sensor (&sensors)[S], DynamicJsonDocument &doc)
{
    for (auto sensorI : sensors)
    {
        if (sensorI.dataFun != NULL)
        {
            sensorI.dataFun(doc);
        }
    }
}

template <size_t S>
int checkSensors(const sensor (&sensors)[S])
{
    int error = 0;
    for (auto sensorI : sensors)
    {
        if (sensorI.checkFun != NULL)
        {
            error |= sensorI.checkFun();
        }
    }
    return error;
}

template <size_t S>
void initReaders(const reader (&readers)[S])
{
    for (auto readerI : readers)
    {
        if (readerI.initFun != NULL)
        {
            readerI.initFun();
        }
    }
}

template <size_t S>
void doReaders(const reader (&readers)[S], DynamicJsonDocument &doc)
{
    for (auto readerI : readers)
    {
        if (readerI.readFun != NULL)
        {
            readerI.readFun(doc);
        }
    }
}