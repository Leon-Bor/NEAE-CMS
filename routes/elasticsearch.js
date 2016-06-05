var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error',
    requestTimeout: 15000
});

var mapping = {
    init: function() {
        this.cms()
    },
    cms: function() {
        client.indices.create({
            index: 'cms'
        })
    },
}

var ES = {
    // Get data from DB
    get: {
        page: function(id, done){
            client.get({
                index: 'cms',
                type: 'page',
                id: id
            }, function(error, resp) {
                done(resp);
            });
        },
        section: function(id, done){
            client.get({
                index: 'cms',
                type: 'section',
                id: id
            }, function(error, resp) {
                done(resp);
            });
        },
        navigation: function(id, done){
            client.get({
                index: 'cms',
                type: 'navigation',
                id: id
            }, function(error, resp) {
                done(resp);
            });
        },
        multiple_sections: function(ids, done){
            
            var docs = []

            for (var i = 0; i < ids.length; i++) {
                docs.push({_index: 'cms', _type: 'section', _id: ids[i]})
            }

            client.mget({
              body: {
                docs: docs
              }
            }, function(error, response){
                done(response)
            });

        },
        all_from_type: function(type, done){
            client.search({
              index: 'cms',
              type: type,
              size: 1000,
              body: {
                query: {
                  "match_all": {} 
                }
              }
            }, function (error, response) {
                done(response)
            });
        },
        pages_containing_sections: function(_id, done){
            client.search({
              index: 'cms',
              type: 'page',
              size: 1000,
              body: {
                        "query": {
                            "match": {
                               "sections": _id
                            }
                        }
                    }
            }, function (error, response) {
                done(response)
            });
        },
    },
    // Update or edit existing data
    update: {
    	page: function(_id,data,done){
            client.update({
                index: 'cms',
                type: 'page',
                id: _id,
                refresh: true,
                body: {
                	doc: data
                }
            }).then(function(resp) {
                done(resp);
            }, function(err) {
                console.trace(err.message);
            });
    	},
        section: function(_id,data,done){
            client.update({
                index: 'cms',
                type: 'section',
                id: _id,
                refresh: true,
                //version: data._version,
                body: {
                    doc: data
                }
            }).then(function(resp) {
                done(resp);
            }, function(err) {
                console.trace(err.message);
            });
        },
        navigation: function(_id,data,done){
            client.update({
                index: 'cms',
                type: 'navigation',
                id: _id,
                refresh: true,
                //version: data._version,
                body: {
                    doc: data
                }
            }).then(function(resp) {
                done(resp);
            }, function(err) {
                console.trace(err.message);
            });
        },
    },
    // Create a document in elasticsearch
    create: {
        page: function(page, done) {

            client.create({
                index: 'cms',
                type: 'page',
                body: {
                    url: page.url,
                    online: false,
                    model: [],
                    sections: [],
                    languages: {
                        default: {
                            pagetitle: page.pagetitle,
                            metaTags: "",
                            metaDescription: "",
                            htmlHead: "",
                            html: "", 
                        }

                    }

                }
            }).then(function(resp) {
                done(resp);
            }, function(err) {
                console.trace(err.message);
            });
        },
        section: function(section, done) {

            var lang = {
                        default:{
                            html: "Write or paste content here...",
                        }
                    };

            client.create({
                index: 'cms',
                type: 'section',
                body: {
                    name: section.name,
                    standart_grid_width: section.standart_grid_width,
                    classes: "col-md-" + section.standart_grid_width,
                    wrapperClasses: "",
                    languages: lang
                    
                }
            }).then(function(resp) {
                done(resp);
            }, function(err) {
                console.trace(err.message);
            });
        },
        navigation: function(navigation, done) {

            var createNav = {
                index: 'cms',
                type: 'navigation',
                body: {
                    name: navigation.name,
                    languages: navigation.languages
                    
                }
            }

            if(navigation.id){
                createNav.id = navigation.id;
            }

            client.create(createNav).then(function(resp) {
                done(resp);
            }, function(err) {
                console.trace(err.message);
            });
        },
    },
    delete: {
        section: function(_id,done){
            client.delete({
              index: 'cms',
              type: 'section',
              id: _id,
              refresh: true,
            }, function (error, response) {

                  done(response)

            });
        },
        page: function(_id,done){
            client.delete({
              index: 'cms',
              type: 'page',
              id: _id,
              refresh: true,
            }, function (error, response) {

                  done(response)

            });
        },
        
    },
    exist: function (index, type, id, done) {
    
        var ex = {}
        if(index){
            ex.index = index;
        }
        if(type){
            ex.type = type;
        }
        if(id){
            ex.id = id;
        }

        client.exists(ex, function (error, exists) {
          if (exists === true) {
            done(true)
          } else {
            done(false)
          }
        });
    }
}

module.exports = ES;