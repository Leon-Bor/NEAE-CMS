var express = require('express');
var accepts = require('accepts')
var router = express.Router();
var ES = require('./elasticsearch');

pageContent = {};
reloadAllPages = function (done){

	var pageArray = ['/']
	
	ES.get.all_from_type("page", function(resp){
		ES.get.navigation("main",function(main_nav) {
			// body...
		

			if(resp.hits != undefined && main_nav){
				for (var i = 0; i < resp.hits.hits.length; i++) {

					pageArray.push(resp.hits.hits[i]._source.url);
					pageContent[resp.hits.hits[i]._source.url] = resp.hits.hits[i];
					pageContent[resp.hits.hits[i]._source.url]._sourceNavigation = main_nav._source
				}

				console.log("--- Load all pages ---")

				/* GET home page. */
				router.get( pageArray , function(req, res, next) {

					req.originalUrl = req.originalUrl.split("?")[0];

					var lang = accepts(req).language(config.languages)

					if(req.query.lang){
						if(config.supported_lang.indexOf(req.query.lang)){
							lang = req.query.lang;
						}
					}

					if(lang == false || config.multi_lang == false || lang == config.default_lang){
						lang = "default"

						pageContent[req.originalUrl].language = config.default_lang;
					}else{
						pageContent[req.originalUrl].language = lang;
					}

					pageContent[req.originalUrl].lang = lang;
					pageContent[req.originalUrl].default_lang = config.default_lang;
					if(pageContent[req.originalUrl]._source.online == true || req.query.preview == pageContent[req.originalUrl]._id){
						res.render('page', pageContent[req.originalUrl]);
					}else{
						throw new Error('This page does not exist.');
					}

				});
			}

		})
	})
}

reloadAllPages();





module.exports = router;
