const webpush = require('web-push');
const {NOTI_INTERVAL} = require('./../settings');
function sendNoti(title, body, subscription) {
    if (subscription === undefined) {
        return;
    }
    const payload = JSON.stringify({ title: title, body: body });
    webpush.sendNotification(subscription, payload).catch(err => console.error(err));
}

function checkInterval(deviceMem, key) {
    if(!deviceMem[key]) {
        deviceMem[key] = new Date().getTime();
        return true;
    }
    const diff = (new Date() - new Date(deviceMem[key]) )/1000; // seconds time diff
    if(diff >= NOTI_INTERVAL) {
        deviceMem[key] = new Date().getTime();
        return true;
    }
    return false;
}


module.exports = {sendNoti, checkInterval};