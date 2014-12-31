exports.config = {
  chromeDriver: '../../../node_modules/protractor/selenium/chromedriver',
  specs: ['LoginE2E.js','FeedE2E.js'],
  capabilities: {
    'browserName': 'chrome'
  },
  jasmineNodeOpts: {
    showColors: true
  }
};