const webpush = require('web-push');
const { sendNoti, checkInterval } = require('../sendNoti');
function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
module.exports = {
  run: function (id, data, olderData, userData, deviceMem) {
    if (data.am_temp > 25 && checkInterval(deviceMem, 'tempWarning')) {
      sendNoti('Too hot', `Watch out, it is too hot in here! ${data.am_temp}°C`, userData.subscription);
    }
  }
};
