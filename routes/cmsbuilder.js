var ES = require('./elasticsearch');

var cmsbuilder = {
	init: function () {
		var that = this;
		ES.exist("cms",'navigation',"main",function (argument) {
			//If Nav does not exist => create one
			if(!argument){
				that.createNavi()
			}
		})

	},
	createNavi: function () {
		//
        var navigation = {
        	languages: {
		            default:{
		            	html: "",
		            	model: [{
		                name: "Home",
		                type: "link",
		                url: "/",
		                external: false,
		                dropdown: false,
		                items:[]
		            },
		            {
		                name: "Voteitup",
		                type: "dropdown",
		                url: "http://voteitup.net",
		                external: false,
		                dropdown: true,

		                items:[{
			                name: "Voteitup",
			                type: "external-link",
			                url: "http://voteitup.net",
			                external: true,
			                items:[]
		                },
		                {
			                name: "Voteitup Create Playlist",
			                type: "external-link",
			                url: "http://play.voteitup.net?host=true",
			                external: true,
			                items:[]
		                }]
		            }],
	        	},
	        },
        	name: "main",
        	id: "main"

        };

        ES.create.navigation(navigation, function (argument) {
        	console.log("Create Main Navigation.")
        })

	},
	createSection: function (argument) {
		// body...
	},
	createPage: function (argument) {
		// body...
	},
	setConfig: function (argument) {
		// body...
	}
} 

module.exports = cmsbuilder;