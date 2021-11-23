const webpush = require('web-push');
const { sendNoti, checkInterval } = require('../sendNoti');
const THRESHOLD = 1000;
module.exports = {
  run: function (id, data, olderData, userData, deviceMem) {
    if (!data.mhz19_co2_ppm
        ) {
      return;
    }
    const xTimeAgo = (new Date()).getTime() - 60/*min */*60/*sec*/*1000/*ms */;
    const olderDataCopy = olderData.filter(v => !!v.data.mhz19_co2_ppm
        && v.time > xTimeAgo);
 
    const values = olderDataCopy.map(v => v.data.mhz19_co2_ppm
        );
 
    values.push(data.mhz19_co2_ppm
        );
    const exceeded = values.some((v)=>v>THRESHOLD);
    if (!exceeded) {
      if (checkInterval(deviceMem, 'good')) {
        sendNoti('Good', `The last hour you had a good CO2 level 👍`, userData.subscription);
      }
    }
  }
};
