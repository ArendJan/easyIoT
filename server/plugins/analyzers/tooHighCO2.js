const webpush = require('web-push');
const { sendNoti, checkInterval } = require('../sendNoti');
function map (x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
module.exports = {
  run: function (id, data, olderData, userData, deviceMem) {
    if (!data.mhz19_co2_ppm
      ) {
      return;
    }
    if (data.mhz19_co2_ppm
      < 500) {
      return;
    }
    const degradation = map(data.mhz19_co2_ppm
      , 500, 1500, 0, 60);
    if (degradation > 40 && checkInterval(deviceMem, 'co2BrainPower')) {
      sendNoti('Watch out!', `You have ${degradation.toFixed(0)}% less brainpower because of high CO2 level(${data.mhz19_co2_ppm      } ppm)!`, userData.subscription);
    }
  }
};
