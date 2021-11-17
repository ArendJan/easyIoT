// degrees Celcius to Fahrenheit
module.exports = {
  run: function (id, data, olderData) {
    data.far = data.temp * 1.8 + 32;
  }
};
