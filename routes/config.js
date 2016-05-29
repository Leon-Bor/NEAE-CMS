
var jsonfile = require('jsonfile')
var file = './config.json'

var cfg = {
	config : {},
	init : function() {
		this.read();		
	},
	save : function () {
		jsonfile.writeFileSync(file, this.config);
	},
	read : function () {
		this.config = jsonfile.readFileSync(file);
	}

}

module.exports = cfg;