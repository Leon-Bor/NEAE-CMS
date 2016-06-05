var express = require('express');
var accepts = require('accepts')
var router = express.Router();
var ES = require('./elasticsearch');
var cfg = require('./config')


var routes = {
	pageContent: {},
	init: function () {
		this.reloadAllPages()
	},
	reloadAllPages: function (done){

		var that = this;

		//Includes all CMS Get routes
		var pageArray = ['/']
		
		// Load all content for pages
		ES.get.all_from_type("page", function(resp){
			ES.get.navigation("main",function(main_nav) {		

				if(resp.hits != undefined && main_nav){

					//Update Page Content to newest version
					for (var i = 0; i < resp.hits.hits.length; i++) {

						pageArray.push(resp.hits.hits[i]._source.url);
						that.pageContent[resp.hits.hits[i]._source.url] = resp.hits.hits[i];
						that.pageContent[resp.hits.hits[i]._source.url]._sourceNavigation = main_nav._source
					}

					console.log("--- Load all pages ---")

					// Set/ Re-Set all routes
					router.get( pageArray , function(req, res, next) {

						var lang = accepts(req).language(cfg.config.languages)
						req.originalUrl = req.originalUrl.split("?")[0];

						//Force Language to query.lang if exists
						if(req.query.lang){
							if(cfg.config.supported_lang.indexOf(req.query.lang)){
								lang = req.query.lang;
							}
						}

						//Get the right language which is requested in the browser or via query
						if(lang == false || cfg.config.multi_lang == false || lang == cfg.config.default_lang){
							lang = "default"

							that.pageContent[req.originalUrl].language = cfg.config.default_lang;
						}else{
							that.pageContent[req.originalUrl].language = lang;
						}

						//Set the right language
						that.pageContent[req.originalUrl].lang = lang;
						that.pageContent[req.originalUrl].default_lang = cfg.config.default_lang;

						// Render page if set to Online, or preview is clicked and also exist
						if(that.pageContent[req.originalUrl]._source.online == true || req.query.preview == that.pageContent[req.originalUrl]._id){
							res.render('page', that.pageContent[req.originalUrl]);
						}else{
							throw new Error('This page does not exist.');
						}

					});
				}

			})
		})
	},
}


module.exports = {routes: routes, router: router};
