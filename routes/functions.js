

var express = require('express');
var router = express.Router();
var ES = require('./elasticsearch');
var cfg = require('./config');


var functions = {

		isAuth: function(req,res,next){

			if (req.user){

				next();
			} else {
				res.redirect('/login');
			}
		},
		parseGrid : function (page, done){

		var that = this;
		var sections = []

		for (var i = 0; i < page._source.model.length; i++) {

			for (var j = 0; j < page._source.model[i].rows.length; j++) {

				for (var k = 0; k < page._source.model[i].rows[j].items.length; k++) {

				  var el = page._source.model[i].rows[j].items[k]

				  if(sections.indexOf(el._id) == -1){
				    sections.push(el._id)
				  }
				  
				}
			}
		}

		ES.get.multiple_sections(sections, function(response){
			var sectionTable = {}
			
			if(response.docs){
				for (var i = 0; i < response.docs.length; i++) {
				  sectionTable[response.docs[i]._id] = response.docs[i]._source
				}		
			}


			if(cfg.config.multi_lang == "true"){




				for (var i = 0; i < cfg.config.supported_lang.length; i++) {
					var lang = cfg.config.supported_lang[i];

					for (var section in sectionTable) {

						sectionTable[section].languages[lang] = sectionTable[section].languages[lang] || {}
						sectionTable[section].languages[lang].html = sectionTable[section].languages["default"]

					}

					if(cfg.config.default_lang != cfg.config.supported_lang[i]){
						page._source.languages[lang] = page._source.languages[lang] || {}
						page._source.languages[lang]['html'] = page._source.languages[lang]['html'] || "";

						page._source.languages[lang]['html'] = that.jsonToHtml(lang, sectionTable, page)						
					}

				}

				page._source.languages["default"]['html'] = that.jsonToHtml("default", sectionTable, page)

			}else{
				page._source.languages["default"]['html'] = that.jsonToHtml("default", sectionTable, page)
			}

			page._source.sections = sections;
			done(page)

		})

	},
	arrayToClassString: function (array) {
	
		var classString = "";

		for (var i = 0; i < array.length; i++) {
			if(i == 0){
				classString += array[i]
			}else{
				classString += " " + array[i]
			}
			
		}

		return classString;

	},

	jsonToHtml: function (lang, sectionTable, page) {
		var that = this;
		var html = "";
		var container = page._source.model;
		for (var i = 0; i < container.length; i++) {

			if( container[i].wrapperClasses != "" ){
				html += "<div class='"+ container[i].wrapperClasses +"'>";
			}

			html += "<div class='"+ container[i].classes +"'>";

			var row = page._source.model[i].rows;
			for (var j = 0; j < row.length; j++) {

				if( row[j].wrapperClasses != "" ){
					html += "<div class='"+ row[j].wrapperClasses +"'>";
				}

				html += "<div class='"+ row[j].classes +"'>";
				
				var item = page._source.model[i].rows[j].items;
				for (var k = 0; k < item.length; k++) {
					
					if( item[k].wrapperClasses != "" ){
						html += "<div class='"+ item[k].wrapperClasses +"'>";
					}

				    html += "<div class='" + item[k].classes + "'>";
				    
				    if(sectionTable[item[k]._id]['languages'][lang] == undefined){
				    	html += "Update section languages"
				    }else{
				    	html += sectionTable[item[k]._id]['languages'][lang]['html'];
				    }
				    
				    html += "</div>";
					if( item[k].wrapperClasses != "" ){
						html += "</div>";
					}
				}
				html += "</div>";
				if( row[j].wrapperClasses != "" ){
					html += "</div>";
				}
			}
			html += "</div>";
			if( container[i].wrapperClasses != "" ){
				html += "</div>";
			}
		}

		return html;
	},
	updateLanguages: function (data, type) {
	    // add missing languages

	    for (var i = 0; i < cfg.config.supported_lang.length; i++) {
	      if(data._source.languages[cfg.config.supported_lang[i]] == undefined && cfg.config.supported_lang[i] != cfg.config.default_lang){
	        data._source.languages[cfg.config.supported_lang[i]] = data._source.languages['default']

	      }
	    }

	    //delete old languages
	    for (var s in data._source.languages) {
	      if(s == "default"){

	      }
	      else if(cfg.config.multi_lang == "false"){
	      	delete data._source.languages[s]
	      }
	      else if(s == cfg.config.default_lang){
	        delete data._source.languages[s]
	      }
	      else if( cfg.config.supported_lang.indexOf(s) > -1){

	      }
	      else{
	        delete data._source.languages[s]
	      }
	    }




	    return data;
	},
	parseNavGrid: function(navigation) {

		for(var nav in navigation._source.languages){
			var html = '';
			html += '<ul class="nav navbar-nav">'
			for (var i = 0; i < navigation._source.languages[nav].model.length; i++) {

				if(navigation._source.languages[nav].model[i].dropdown == false){
					html += '<li class="nav-element"><a href="'+navigation._source.languages[nav].model[i].url+'">'+navigation._source.languages[nav].model[i].name+'</a></li>'
				}else{
	
					html += '<li class="dropdown">'
					html += '<a href="#" class="dropdown-toggle" data-toggle="dropdown">'+navigation._source.languages[nav].model[i].name+'<b class="caret"></b></a>'
					html += '<ul class="dropdown-menu">'

					for (var j = 0; j < navigation._source.languages[nav].model[i].items.length; j++) {
						html += '<li><a href="'+navigation._source.languages[nav].model[i].items[j].url+'">'+navigation._source.languages[nav].model[i].items[j].name+'</a></li>'
					}
					html += '</ul>'
					html += '</li>'
					html += '</ul>'
				}

			}
			html += '</ul>'
			navigation._source.languages[nav].html = html;
		}
		return navigation
	}
}











module.exports = functions;