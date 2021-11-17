# Easy IoT tutorial
This tutorial will explain how to install the required things for the easy iot framework and how to add devices, sensors and how to analyze data.

# Install
This tutorial is only tested on Ubuntu 20.04, but should work on any modern OS. No user-interface is needed on the server, therefore it can run on a server(VPS) or on your desktop/laptop. 

Using an actual server gives more freedom to see your data from anywhere and have the devices also anywhere instead of only in your own network.
- nodejs
- postgres
- sw
- nginx
- pm2

## NodeJS
To install NodeJS run:
```
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```
this will install NodeJS version 16, the latest lts.

## PM2
run
```
sudo npm i -g pm2
```
to install pm2. This will manage the server and restart it when it crashes and start it at boot.

## Nginx
Nginx is the reverse proxy used to host using a (sub)domain instead of an ip and port. If you'll use it in your own network only, then you can omit this step.

```
sudo apt install -y nginx
```

When it is installed, create a config file for the Nginx server:
```
sudo nano /etc/nginx/sites-enabled/easyiot.conf
```
and paste the following configuration:
```
server {

       server_name SERVERNAME;

       location / {

 # Simple requests
    if ($request_method ~* "(GET|POST)") {
      add_header "Access-Control-Allow-Origin"  *;
    }

    # Preflighted requests
    if ($request_method = OPTIONS ) {
      add_header "Access-Control-Allow-Origin"  *;
      add_header "Access-Control-Allow-Methods" "GET, POST, OPTIONS, HEAD";
      add_header "Access-Control-Allow-Headers" "Authorization, Origin, X-Requested-With, Content-Type, Accept";
      return 200;
    }

                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
       }
    listen [::]:80 ipv6only=on;
    listen 80;
}

```
Replace ```SERVERNAME``` with your domain or remove that line if you don't have a domain and want to accept all incoming http requests and redirect them to the easy iot server.
If you removed the servername, you have to run ```sudo rm /etc/nginx/sites-enabled/default``` to make sure that the default server won't interfere.
Exit ```nano``` using ctrl-x y enter.
test the configuration with ```sudo nginx -t```
When this succeeds, run
```
sudo systemctl reload nginx
```
This should print nothing and return directly.

(optionally you can install ufw to add a firewall)

## Postgres
Postgres is the database system used for easy_iot. Any other database software could be used, however this would require you to change some of the sql code.

Install the software:
```
sudo apt install -y postgresql postgresql-contrib
```

Then run
```
sudo -u postgres createdb easyiot
sudo -u postgres psql -d easyiot
```
in the new terminal enter(the whole part at once):
```
CREATE TABLE IF NOT EXISTS public.data
(
    data json NOT NULL,
    "deviceID" integer NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    "time" timestamp with time zone DEFAULT now(),
    CONSTRAINT data_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;
ALTER TABLE public.data
    OWNER to postgres;

CREATE TABLE IF NOT EXISTS public.devices
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    "userID" integer DEFAULT '-1'::integer,
    password text COLLATE pg_catalog."C.UTF-8" NOT NULL DEFAULT substr(md5((random())::text), 0, 25),
    name text COLLATE pg_catalog."default" NOT NULL DEFAULT ''::text,
    memory json,
    CONSTRAINT devices_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.devices
    OWNER to postgres;

CREATE TABLE IF NOT EXISTS public.session
(
    sid character varying COLLATE pg_catalog."default" NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL,
    CONSTRAINT session_pkey PRIMARY KEY (sid)
)

TABLESPACE pg_default;

ALTER TABLE public.session
    OWNER to postgres;
-- Index: IDX_session_expire

-- DROP INDEX public."IDX_session_expire";

CREATE INDEX "IDX_session_expire"
    ON public.session USING btree
    (expire ASC NULLS LAST)
    TABLESPACE pg_default;
CREATE TABLE IF NOT EXISTS public.users
(
    email text COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    subscription json,
    CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.users
    OWNER to postgres;

```
This creates the required tables.

run ```\dt``` to check that there are 4 tables. Use ```ALTER USER postgres PASSWORD 'verynicepassword';
``` to set a password. This is required otherwise the server will not be able to connect to the database. Use ```\q``` to quit the database terminal.

This is not the safest way to setup the postgres system, because it does not take roles and access into account. If you want a more secure system, take a look at https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart and ufw.




## easy iot software
Download and install the easy iot code from GitHub using 
```sh
sudo apt install -y git
git clone https://github.com/ArendJan/easyIoT.git
cd easyIoT/server
npm i
cd ../webapp/easyIoT/
npm i
nano src/consts.js
# edit the src/consts.js file to match the domain/ip+domain of the webserver
npm run build
cp dist/ ../../server/public -r
cd ../../server
nano conn/sql.js
# edit this file to have the correct host, database and password
nano settings.js
# edit this file such that webappurl equals the domain/ip and port that you want to access your website on. 
# Set dev to false. This should be the same as the consts.js file
npm start
```




You can now open your browser to see that the server is started. It should show the application that completely works.

To have the server start on boot and restart when it crashed, use ctrl-c to exit ```npm start``` and run ```pm2 start index.js```. Follow the instructions of pm2 when it is the first time starting it. This is ```pm2 startup``` and running the generated command.

To stop the server run ```pm2 stop index```.

## Encryption
To add encryption(SSL certificate) to your server, follow https://certbot.eff.org/ . This is only possible when you have an actual domain you control.

## Notifications
To enable the notifications, follow [this single part of the tutorial](https://www.section.io/engineering-education/push-notification-in-nodejs-using-service-worker/#generate-vapid-keys) and set the publicVapidKey variable in webapp\easyIoT\src\static\client.js and the variables in server\index.js on lines 11-15.  

# Hardware

To retrieve data you'll need some hardware that is connected to the network and has some sensors. We opted to use the ESP32 chips because they are cheap, have a lot of functionality and are easy to use. The code is written in C/C++ Arduino code(because of the load of libraries available) in Visual Studio Code using Platformio.

## First setup
- Install VSCode: https://code.visualstudio.com/download
- Install the Platformio IDE: https://marketplace.visualstudio.com/items?itemName=platformio.platformio-ide
- Open the easy_iot ESP code folder in VSCode
- Wait for Platformio to install everything(click on alien head and it should display at least build and upload buttons)
- Upload the code to your ESP32

## Changing sensors and settings
To change the server and password of your device, take a look in ```src/main.cpp``` lines 19-21. The ```serverName``` must contain ```/push/<ID>```, where the ID is replaced for ID of the device. The password is the password that corresponds with that ID. If you use https for your server, you have to change the ```root_ca``` string. Follow this tutorial for the certificate: https://techtutorialsx.com/2017/11/18/esp32-arduino-https-get-request/ 

You don't have to set your wifi settings, because the ESP32 will start an access point with a website to enter your network details. 

### Sensors
The sensors and sensor readings are done in a kind of framework. 
// TODO::::::::::::::::::::::::::::::::::::::::: add link to report
To add a new sensor, you have to create the ```include/<sensor>.hpp``` and ```src/<sensor>.cpp``` files.

Copy the following header example to your header file and change ```<sensor>``` to your sensor name or something unique.
```
#ifndef <sensor>_sens
#define <sensor>_sens
#include <Arduino.h>
#include <ArduinoJson.h>
#include "sensorFramework.hpp"
// add any other includes if required

// any of these 3 functions is optional, when not used, also remove from object
int data<sensor>(DynamicJsonDocument &doc);
void init<sensor>();
int check<sensor>();

// this ordering is required by the compiler
const sensor <sensor> = {.dataFun = data<sensor>, .initFun = init<sensor>, .checkFun = check<sensor>};

#endif
```

This header signals to the other files which functions are implemented. You don't need to implement all the functions when it is not required. Our heapSensor only has a data function. When a sensor doesn't have a specific function, it is skipped in that step.

Copy the following things to your ```src/<sensor>.cpp``` file:

```
#include <Arduino.h>
#include <ArduinoJson.h>
// sensor specific includes

// some global variables

int data<sensor>(DynamicJsonDocument& doc)
{
    // add any sensor reading functions here and store it in the doc 'array'
    doc["some_output_var"] = 3;
}
void init<sensor>()
{
    // begin the sensor?
}

int check<sensor>() {
  // return 0 when ok, otherwise return something else
  // you can call send_log(error?, "text"); 
}

```

The function names should match the names in the header file. For each sensor you need to make such a set of files.

#### Adding sensor to main
Go to ```src/main.cpp``` and add ```#include "<sensor>.hpp"``` at the top. This way the sensor is added to the code. To actually invoke the functions you need to add the ```<sensor>``` object(const sensor ... in the header file) to the sensors array of line 62. The ordering of the array defines the order of calling the init, data and checking functions. When your sensor needs data from another sensor, add it at a higher index in the array.

### Readers
The same framework is done with readers that can read data coming from the server. This is the same data sent to the server + any data the server added to the data object. Look at the ```ledWriter.{cpp}/{hpp}``` files to build your own reader. The readers list is defined in ```src/main.cpp``` below the sensors array.

## Adding devices
Each device must have a unique id to identify and separate the information of them. To create a new id and password, request the <serverurl>/api/addDevice to generate them. Copy the id and password to the code and keep the first 5 characters of the password to connect it to an account on the webapp.

# Adding features
After installing the software on your server and creating the embedded software you can make changes to the server and webapp. This part will explain the multiple types of changes.

## Analyzers
Each analyzer is defined in a single file(could have more functionality in one) and is imported when the server is started.

An analyzer only has to have a run function as any inintializing can be done at start. An example analyzer can be seen below.

```js
const webpush = require('web-push');
const { sendNoti, checkInterval } = require('../sendNoti');

module.exports = {
    run: function (id, data, olderData, userData, deviceMem) {
        if (!data.co2_ppm) {
            return;
        }
        if (data.co2_ppm < 500) {
            return;
        }
        let degradation = map(data.co2_ppm, 500, 1500, 0, 60);
        if (degradation > 40 && checkInterval(deviceMem, 'co2BrainPower')) {
            sendNoti('Watch out!', `You have ${degradation.toFixed(0)}% less brainpower because of high CO2 level(${data.co2_ppm} ppm)!`, userData.subscription);
        }
    }
};
```
The run function gets the id of the device, the current data receiving data of the device, a list of the previous X data frames, the user data and the settings of the device. The data can be written to and is stored and sent back to the device. Therefore don't add delays or long functions in an analyzer. The device memory is writable and also stored for the next execution. The sendNoti function accepts a title and a text to send to the user if they have notifications enabled. The checkInterval function makes sure that not every sensor reading triggers a notification.

Any NodeJS code can be run and has no restrictions, so you can do anything, but beware of security and time-wise risks.

## Webapp
The webapp is written in Vue.js, a framework to easily create webapps in. The webapp by default only shows the last X time data items in a graph and the last values. 

To easily edit the webapp and see the changes directly, you can change the ```
server/settings.js``` to have dev = true, resulting in the webappurl to be http://localhost:8080/. Then run ```npm start autoload``` in the server folder to start the server and let it restart when any of its files have changed.

Then start the webapp in the webapp/easyIoT folder in another cmd by running ```npm run serve```. When you change anything in the webapp or server, it will reload it and let you change it easily. When you are finished you can run ```npm run build``` and copy the webapp dist folder to the server public folder and upload the server folder to your server. Reload the server by running ```pm2 restart 0```(or the id of your application in the ```pm2 status``` list)
