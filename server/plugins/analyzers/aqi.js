const webpush = require('web-push');
const { sendNoti, checkInterval } = require('../sendNoti');

const co2Aqi = [{co2:[400,800], aqi:[0,50], cat: "Good"},
{co2:[800,1200], aqi:[50,100], cat: "Moderate"},
{co2:[1200,2000], aqi:[100,150], cat: "Unhealty for sensitive groups"},
{co2:[2000,5000], aqi:[150,200], cat: "Unhealty"},
{co2:[5000,10000], aqi:[200,300], cat: "Very unhealty"},
{co2:[10000,40000], aqi:[300,500], cat: "Hazardous"},
{co2:[40000,Infinity], aqi:[500, 1000], cat: "Dead"}
];
function map (x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
module.exports = {
  run: function (id, data, olderData, userData, deviceMem) {
    if (!data.mhz19_co2_ppm      ) {
      return;
    }
    let aqi = 0;
    let cat = '';
    const co2 = data.mhz19_co2_ppm    ;
    co2Aqi.forEach(category => {
      if(co2 >= category.co2[0] && co2 < category.co2[1]) {
        aqi = map(co2, category.co2[0], category.co2[1], category.aqi[0], category.aqi[1]);
        cat = category.cat;
      }
    });
    data.aqi = aqi;
    data.cat = cat;
  }
};
