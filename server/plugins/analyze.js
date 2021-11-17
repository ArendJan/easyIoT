const fs = require('fs');
const path = require('path');
const files = fs.readdirSync(path.join(__dirname, './analyzers/'));
const analyzers = [];
files.forEach(file => {
  if (!file.endsWith('.js')) {
    return;
  }
  try {
    const analyzer = require(path.join(__dirname, './analyzers/', file));
    analyzers.push(analyzer);
  } catch (e) {
    console.log(e);
  }
});

async function runAnalyzers (id, data, olderData, userData, deviceMem) {
  analyzers.forEach(analyzer => {
    try {
      analyzer.run(id, data, olderData, userData, deviceMem);
    } catch (e) {
      console.log(e);
    }
  });
}

module.exports = {
  run: runAnalyzers
};
