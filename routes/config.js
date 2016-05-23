
var jsonfile = require('jsonfile')
var file = './config.json'

//Global variable
config = {}

var cfg = {
	init : function() {
		this.read();		
	},
	save : function () {
		jsonfile.writeFileSync(file, config);
	},
	read : function () {
		config = jsonfile.readFileSync(file);
	}

}

cfg.init();


console.log(config)

module.exports = cfg;