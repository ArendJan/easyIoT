#include "mhz19Sensor.hpp"
#include <ArduinoJson.h>

#define BAUDRATE_Z19 9600 // Native to the sensor (do not change)

MHZ19 myMHZ19;

void initMHZ19()
{

  Serial2.begin(BAUDRATE_Z19); //Setup serial for MH z19
  myMHZ19.begin(Serial2);
  if (DEBUGGING)
  {
    // myMHZ19.printCommunication();// Error Codes are also included here if found (mainly for debugging/interest)

    /*
    getVersion(char array[]) returns version number to the argument. The first 2 char are the major 
    version, and second 2 bytes the minor version. e.g 02.11
  */
    char myVersion[4];
    myMHZ19.getVersion(myVersion);

    Serial.print("\nFirmware Version: ");
    for (byte i = 0; i < 4; i++)
    {
      Serial.print(myVersion[i]);
      if (i == 1)
        Serial.print(".");
    }
    Serial.println("");
    Serial.print("Range: ");
    Serial.println(myMHZ19.getRange());
    Serial.print("Background CO2: ");
    Serial.println(myMHZ19.getBackgroundCO2());
    Serial.print("Temperature Cal: ");
    Serial.println(myMHZ19.getTempAdjustment());
    Serial.print("ABC Status: ");
    myMHZ19.getABC() ? Serial.println("ON") : Serial.println("OFF");
  }
}

float mhz19_Temp;
int dataMHZ19(DynamicJsonDocument &doc)
{
  int CO2;
  /* note: getCO2() default is command "CO2 Unlimited". This returns the correct CO2 reading even
        if below background CO2 levels or above range (useful to validate sensor). You can use the
        usual documented command with getCO2(false) */

  CO2 = myMHZ19.getCO2(false, true); // Request CO2 (as ppm)

  Serial.print("mhz19_CO2_ppm: ");
  Serial.println(CO2);
  mhz19_Temp = myMHZ19.getTemperature(true, true); // Request Temperature (as Celsius)
  Serial.print("mhz19_temp: ");
  Serial.println(mhz19_Temp);

  doc["mhz19_co2_ppm"] = myMHZ19.getCO2(false, true);     // Request CO2 (as ppm)
  doc["mhz19_temp"] = myMHZ19.getTemperature(true, true); // Request temperature
  return 1;
}

int checkMHZ19()
{
  bool error = false;
  myMHZ19.verify();
  int mhz19_error = myMHZ19.errorCode;

  if (mhz19_error != 1 || mhz19_Temp == -273.15)
  {
    Serial.print("MHZ19 error");
    Serial.println(mhz19_error);
    send_log(false, "discovered problem with MHZ19C during system check. Recovery reset");
    myMHZ19.recoveryReset();
    error = true;
  }
  return error;
}