// Testacular configuration
// Generated on Tue Sep 18 2012 14:23:54 GMT+0200 (CEST)


// base path, that will be used to resolve files and exclude
basePath = '';


// list of files / patterns to load in the browser
//
// I know it's hard to debug when we're including the asset pipelined gg.js
// An alternative would be to include all dependencies in order, but we'd have
// to compile the EJS templates as well then.
// Rails.application.assets['gg.js'].dependencies.collect{|p| puts "'#{p.pathname.to_s.gsub(Rails.root.to_s + '/', '')}',"}

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'http://localhost:3000/assets/gg.js',
  'spec/js/*_spec.js',
  'spec/js/**/*_spec.js'
];


// list of files to exclude
exclude = [
  
];


// test results reporter to use
// possible values: dots || progress
reporter = 'progress';


// web server port
port = 8080;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_DEBUG;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari
// - PhantomJS
browsers = ['Chrome'];


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
