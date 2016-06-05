var express = require('express');
var accepts = require('accepts')
var router = express.Router();
var ES = require('./elasticsearch');
var FC = require('./functions');
var dirTree = require('directory-tree');
var fs = require('fs');
var multer = require('multer');
var passport = require('passport')
var routes = require('./routes').routes;
/* 
  	GET REQUEST

    Consinder that angular is also using the GET routes. Becarefull, that
  	angular and the node.js don't use the same for showing sites/parts.

*/

router.get('/cms', FC.isAuth, function (req, res) {
    res.render('cms')
});

// Get all pages
router.get("/cms/pages/all", FC.isAuth, function(req, res, next) {
  ES.get.all_from_type("page",function(resp){
    res.json(resp)
  }) 
});
// Get all sections
router.get("/cms/sections/all", FC.isAuth, function(req, res, next) {
  ES.get.all_from_type("section",function(resp){
    res.json(resp)
  }) 
});


// Get all images
router.get("/cms/all-images", FC.isAuth, function(req, res, next) {

var images = fs.readdirSync('./public/uploads')
res.json(images)

});

//get specific file
router.get('/cms/get-file', FC.isAuth, function(req, res, next) {

  fs.readFile(req.query.url, 'utf8', function (err, data) {
          if (err) throw err;
          var file = {
            data: data,
            path: req.query.url
          }
            res.json(file)
          }
      );

});

// Get navigation
router.get("/cms/navigation/:id", FC.isAuth, function(req, res, next) {

  ES.get.navigation(req.params.id, function(data) {
    data = FC.updateLanguages(data)

    res.json(data)
  })



});

// get sass folder and file structure
router.get('/cms/sass-folder', FC.isAuth, function(req, res, next) {
  var filteredTree = dirTree('./sass', ['.scss']);
  res.json(filteredTree)
});

// get page id
router.get('/cms/page/:id', FC.isAuth, function(req, res, next) {
  ES.get.page(req.params.id, function(data){
    data = FC.updateLanguages(data)
    res.json(data)
  })
});


/* 
  POST REQUEST
*/
router.post('/cms/section/:id', FC.isAuth, function(req, res, next) {
  ES.get.section(req.params.id, function(data){


    data = FC.updateLanguages(data)

    res.json(data)
  })
});

// Create new Section
router.post('/cms/section', FC.isAuth, function(req, res, next) {
  ES.create.section(req.body, function(resp){
    res.redirect("/cms/section/"+resp._id)
  }) 
});

// get all sections for page
router.post('/cms/multiple-sections', FC.isAuth, function(req, res, next) {
  ES.get.multiple_sections(req.body, function(resp){
    res.json(resp)
  }) 
});

// Save section changes to DB
router.post('/cms/section/:id/save', FC.isAuth, function(req, res, next) {

  ES.update.section(req.params.id, req.body._source, function(){
    ES.get.pages_containing_sections(req.params.id, function (resp) {
      if(resp.hits.total > 0){
        resp.hits.hits.forEach(function(hit, index){
          FC.parseGrid(hit, function(page_obj){
            ES.update.page(page_obj._id, page_obj._source, function(){

              if(index === resp.hits.hits.length - 1){
                  
                  // get rid of the timeout
                  setTimeout(function() {

                    routes.reloadAllPages();
                    res.json(200);

                  }, 1000);
              }

            })
          })
        })

      }else{
        routes.reloadAllPages();
        res.json(200);
      }
    })
  })


});

// delete section from DB
router.post('/cms/section/:id/delete', FC.isAuth, function(req, res, next) {

  ES.get.pages_containing_sections(req.params.id, function (resp) {
    if(resp.hits.total == 0){
      ES.delete.section(req.params.id,function(){
        res.json(200)
      })
    }else{
      res.json(400)
    }

  })
});

// delete section from DB
router.post('/cms/page/:id/delete', FC.isAuth, function(req, res, next) {

  ES.delete.page(req.params.id,function(){
    routes.reloadAllPages();
    res.json(200)
  })
  
});

// Save page changes to DB
router.post('/cms/page/:id/save', FC.isAuth, function(req, res, next) {

    FC.parseGrid(req.body, function(page_obj){

      ES.update.page(req.params.id, page_obj._source, function(){
        routes.reloadAllPages();
        res.json(200)
      })

    })

  
});



// create new page
router.post('/cms/page', FC.isAuth, function(req, res, next) {
	ES.create.page(req.body, function(resp){
    routes.reloadAllPages();
		res.redirect("/cms/page-grid/"+resp._id);
	}) 
});


// delete file
router.post('/cms/delete-file', FC.isAuth, function(req, res, next) {

  fs.exists(req.body.url, function(exists) {
    if(exists) {
      fs.unlinkSync(req.body.url);
      res.json(200)
    } else {
      res.json(404)
    }
  });

});

//save file
router.post('/cms/save-file', FC.isAuth, function(req, res, next) {

  var temp = req.body.data

  if(req.body.path.indexOf(".json") > -1){
    temp = JSON.stringify(req.body.data)
  }

  fs.writeFile(req.body.path, temp , function(err) {
      if(err) {
          return console.log(err);
      }

      res.json({name: req.body.name})
  }); 

});

//save navigation
router.post('/cms/save-navigation', FC.isAuth, function(req, res, next) {

  var parsedNav = FC.parseNavGrid(req.body.navigation)

  ES.update.navigation(req.body._id, parsedNav._source, function(resp) {
    routes.reloadAllPages();
    res.json(200)
  })
  
});

// Upload images
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null,  Date.now() + "_" + file.originalname )
  }
})

var upload = multer({
  storage: storage
}).single('image');

// upload image
router.post('/upload', FC.isAuth, upload, function(req, res, next) {

  res.redirect('/cms/image-upload')

});


// Needs to be the last one, to catch all other URL which are not defined
router.get('/cms/*', FC.isAuth, function (req, res) {
    res.render('cms')
});

module.exports = router;
