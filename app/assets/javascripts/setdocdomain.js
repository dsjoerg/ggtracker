// Proxino.log("gg.js domain was " + document.domain);
// weird, was ggtracker.com even though script was served via CDN
document.domain = /(\w+)(.\w+)?$/.exec(location.hostname)[0];
// Proxino.log("now gg.js domain is " + document.domain);
