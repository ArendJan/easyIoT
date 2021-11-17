#ifndef air_hhh
#define air_hhh
#include <Arduino.h>
void sendData();

extern const char* serverName;
extern const char *root_ca;
extern const char* password;
void systemCheck();
bool prefix(const char *pre, const char *str);
#define DEBUGGING true

#endif