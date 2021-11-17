const dev = true;
const webappURL = dev ? 'http://localhost:8080' : 'https://airquality.arend-jan.com';
const NOTI_INTERVAL = 5 * 60; // 5 min
module.exports = { serverURL: webappURL, NOTI_INTERVAL };
