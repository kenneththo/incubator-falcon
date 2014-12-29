exports.config = {
  chromeDriver: '../../../node_modules/protractor/selenium/chromedriver',
  //seleniumAddress: 'http://localhost:4444/wd/hub',
//  specs: ['LoginE2E.js','ClusterE2E.js','ProcessE2E.js'],
  specs: ['LoginE2E.js','ClusterE2E.js'],
  capabilities: {
    'browserName': 'chrome'
  },
  jasmineNodeOpts: {
    showColors: true
  }
};