#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://peaceful-bastion-8967.herokuapp.com"

var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr)) {
    console.log("%s does not exists. Exiting.", instr);
    process.exit(1);
  }

  return instr;
};

var cheerioHtmlFile = function(htmlfile) {
  return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};

  for(var ii  in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  
  return out;
};

var clone = function(fn) {
  return fn.bind({});
};

var checkUrl = function(url) {
  rest.get(url).on('complete', function(result) {
    if(result instanceof Error) {
      return 'Error: ' + result.message;
      this.retry(5000);
    }
    else {
      return result;
    }
  });
};

if(require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url>', 'URL to index.html', clone(checkUrl), URL_DEFAULT)
    .parse(process.argv);

  var checkJson = checkHtmlFile(program.file, program.checks);
  var outJson = JSON.stringify(checkJson, null, 4);

  fs.writeFile("results.json", outJson, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("The file was saved");
    }
  });
  console.log(outJson);
} else {
  exports.checkHtmlFile = checkHtmlFile;
}
