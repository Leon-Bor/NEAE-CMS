var jsonfile = require('jsonfile')
var file = './config.json'
var WatchJS = require("watchjs")
var watch = WatchJS.watch;
var unwatch = WatchJS.unwatch;
var callWatchers = WatchJS.callWatchers;

var cfg = {
	config : {},
	init : function() {
		this.read();
		watch(this.config, function(){
		    console.log("some attribute of ex3 changes!");
		});
	},
	save : function () {
		jsonfile.writeFileSync(file, this.config);
	},
	read : function () {
		this.config = jsonfile.readFileSync(file);
	}

}

module.exports = cfg;