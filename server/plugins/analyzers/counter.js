const webpush = require('web-push');
const { sendNoti, checkInterval } = require('../sendNoti');

function findLineByLeastSquares (values_x, values_y) { // https://dracoblue.net/dev/linear-least-squares-in-javascript/
  let sum_x = 0;
  let sum_y = 0;
  let sum_xy = 0;
  let sum_xx = 0;
  let count = 0;

  /*
     * We'll use those variables for faster read/write access.
     */
  let x = 0;
  let y = 0;
  const values_length = values_x.length;

  if (values_length != values_y.length) {
    throw new Error('The parameters values_x and values_y need to have same size!');
  }

  /*
     * Nothing to do.
     */
  if (values_length === 0) {
    return { a: 1, b: 1 };
  }

  /*
     * Calculate the sum for each of the parts necessary.
     */
  for (var v = 0; v < values_length; v++) {
    x = values_x[v];
    y = values_y[v];
    sum_x += x;
    sum_y += y;
    sum_xx += x * x;
    sum_xy += x * y;
    count++;
  }

  /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
  const a = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
  const b = (sum_y / count) - (a * sum_x) / count;
  return { a, b };
  /*
     * We will make the x and y result line now
     */
  const result_values_x = [];
  const result_values_y = [];

  for (var v = 0; v < values_length; v++) {
    x = values_x[v];
    y = x * a + b;
    result_values_x.push(x);
    result_values_y.push(y);
  }

  return [result_values_x, result_values_y];
}

// kitchen, for 1, 2 and 3 people in the room, the gradients were:
const gradientsKitchen = [2.7, 14.1, 27.5]; // delta ppm/min
// or bedroom:
const gradientBedroom = [0.7, 6.7, 14.7];

module.exports = {
  run: function (id, data, olderData, userData, deviceMem) {
    if (!data.mhz19_co2_ppm
      ) {
      return;
    }
    const olderDataCopy = olderData.filter(v => !!v.data.mhz19_co2_ppm).slice(0, 100); // only take values with co2 value and 100 last frames = 5-10min
    const times = olderDataCopy.map(v => (v.time.getTime() / 1000) / 60);
    times.reverse();
    times.push((new Date()).getTime() / 1000 / 60);
    const values = olderDataCopy.map(v => v.data.mhz19_co2_ppm);
    values.reverse();
    values.push(data.mhz19_co2_ppm);
    const gradientCurr = findLineByLeastSquares(times, values);
    if (gradientCurr.a < 0) {
      // return;
    }
    const gradientX = Array(gradientsKitchen.length).fill(0).map((v, i) => i + 1);
    // switched, to have gradient per person instead of person per gradient.
    const gradientPerPerson = findLineByLeastSquares(gradientsKitchen, gradientX);
    
    const peopleNum = gradientPerPerson.a * gradientCurr.a + gradientPerPerson.b;
    
    const exp = Math.floor(peopleNum);
    if (exp > 1 && exp !== deviceMem.peopleNum) {
      if (checkInterval(deviceMem, 'peoplenum')) {
        sendNoti('Amount of people', `Expected amount op people in the room: ${exp}`, userData.subscription);
      }
    }
    deviceMem.peopleNum = exp;
  }
};
