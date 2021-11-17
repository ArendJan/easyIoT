const webpush = require('web-push');
const { sendNoti, checkInterval } = require('../sendNoti');


function findLineByLeastSquares(values_x, values_y) { // https://dracoblue.net/dev/linear-least-squares-in-javascript/
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return [ [], [] ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;
    return m; // we only want the gradient in this analyzer
}

module.exports = {
    run: function (id, data, olderData, userData, deviceMem) {
        if (!data.co2_ppm) {
            return;
        }
        const olderDataCopy = olderData.filter(v=> !!v.data.co2_ppm).slice(0, 100); // only take values with co2 value and 100 last frames
        const times = olderDataCopy.map(v=>v.time.getTime()/1000);
        times.reverse();
        times.push((new Date()).getTime()/1000)
        const values = olderDataCopy.map(v=>v.data.co2_ppm);
        values.reverse();
        values.push(data.co2_ppm);
        const gradient = findLineByLeastSquares(times, values);
        
        if (checkInterval(deviceMem, 'co2gradient')) {
            sendNoti('Jojo', `Curr ${gradient} gradient`, userData.subscription);
        }
    }
};

