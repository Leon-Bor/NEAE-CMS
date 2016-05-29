var app = angular.module('app', ['ngRoute','dndLists']);

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


app.config(['$routeProvider','$locationProvider','$compileProvider',
	function($routeProvider, $locationProvider,$compileProvider) {
	//$compileProvider.debugInfoEnabled(false);

	$routeProvider.
	when('/cms/dashboard', {
	templateUrl: '/ng-views/dashboard.html',
	controller: 'dashboard'
	}).
	when('/cms/pages', {
	templateUrl: '/ng-views/pages.html',
	controller: 'pages'
	}).
	when('/cms/page-grid/:id', {
	templateUrl: '/ng-views/page-grid.html',
	controller: 'page-grid'
	}).
	when('/cms/page-edit/:id', {
	templateUrl: '/ng-views/page-edit.html',
	controller: 'page-edit'
	}).	
	when('/cms/sections', {
	templateUrl: '/ng-views/sections.html',
	controller: 'sections'
	}).
	when('/cms/section/:id', {
	templateUrl: '/ng-views/section.html',
	controller: 'section'
	}).
	when('/cms/navigation', {
	templateUrl: '/ng-views/navigation.html',
	controller: 'navigation'
	}).
	when('/cms/image-upload', {
	templateUrl: '/ng-views/image-upload.html',
	controller: 'image-upload'
	}).
	when('/cms/sass-editor', {
	templateUrl: '/ng-views/sass-editor.html',
	controller: 'sass-editor'
	}).
	when('/cms/scaffhold', {
	templateUrl: '/ng-views/scaffhold.html',
	controller: 'scaffhold'
	}).
	when('/cms/settings', {
	templateUrl: '/ng-views/settings.html',
	controller: 'settings'
	}).

	otherwise({
	redirectTo: '/cms/dashboard'
	});
	// use the HTML5 History API
        $locationProvider.html5Mode(true);
}]);


app.controller('dashboard', ['$scope', '$http',
  function ($scope, $http) {
    // $http.get('phones/phones.json').success(function(data) {
    //   $scope.phones = data;
    // });

 }]);

app.controller('pages', ['$scope', '$http', '$routeParams','$location',
  function ($scope, $http, $routeParams, $location) {

  	init();
  	function init(){
		$http({
		  method: 'GET',
		  url: '/cms/pages/all'
		}).then(function successCallback(response) {
			$scope.pages = response.data.hits.hits;
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});



  	}

  	$scope.deletePage = function(_id){
		$http({
		  method: 'POST',
		  url: '/cms/page/'+ _id +'/delete',
		  refresh: false,
		}).then(function successCallback(response) {
			if(response.data == 200){
				init();
			}
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});
  	}

  	$scope.toggleOnline = function (index) {

  		$scope.pages[index]._source.online = !$scope.pages[index]._source.online;

		$http({
		  method: 'POST',
		  url: '/cms/page/'+ $scope.pages[index]._id +'/save',
		  data: $scope.pages[index],
		}).then(function successCallback(response) {
			if(response.data == 200){
				$location.path('/cms/pages')
			}
			if($scope.pages[index]._source.online == true){
				showalert("Page is now ONLINE ","alert-success")
			}else{
				showalert("Page is now OFFLINE ","alert-warning")
			}
			
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});
  	}

 }]);

app.controller('page-grid', ['$scope', '$http', '$routeParams','$location','$compile','getSections',
  function ($scope, $http, $routeParams, $location, $compile, getSections) {

  	init();
  	function init(){

  		$scope.optionsModal = {};

		$http({
		  method: 'POST',
		  url: '/cms/page/'+$routeParams.id
		}).then(function successCallback(response) {
			$scope.page = response.data;
			$scope.model = $scope.page._source.model;

			//$('.page').append($scope.page._source.raw_grid)
			
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});


		getSections.async().then(function(d) {
			$scope.sections = d;
			$scope.dndSections = [];

			for (var i = 0; i < d.length; i++) {
				d[i]

				$scope.dndSections.push({label: d[i]._source.name, classes: d[i]._source.classes , wrapperClasses: d[i]._source.wrapperClasses ,standart_grid_width: d[i]._source.standart_grid_width, _id:d[i]._id})
			}

		});


					/* DRAG AND DROP */
			    $scope.dragoverCallback = function(event, index, external, type, test) {
			        $scope.logListEvent('dragged over', event, index, external, type);
			        // Disallow dropping in the third row. Could also be done with dnd-disable-if.

			        return true;
			    };

			    $scope.dropCallback = function(event, index, item, external, type, allowedType) {
			        $scope.logListEvent('dropped at', event, index, external, type);
			        clearInterval(hoverIntverval);

			        if (external) {
			            if (allowedType === 'itemType' && !item.label) return false;
			            if (allowedType === 'containerType' && !angular.isArray(item)) return false;
			        }
			        return item;
			    };

			    var hoverIntverval;
			    $scope.placeholderWidth = function(id){
			    	var calced = id / 12 * 100;

					//hoverIntverval = setInterval(function(){ $('.dndPlaceholder').css("width", calced + "%") }, 300);

			    }

			    $scope.logEvent = function(message, event) {
			    };

			    $scope.logListEvent = function(action, event, index, external, type) {
			        var message = external ? 'External ' : '';
			        message += type + ' element is ' + action + ' position ' + index;
			    };

			   

			    $scope.dndGridComponents = [];
			    $scope.dndGridComponents.push(
			    	{type: "rowType", grid:"row", classes: "row", wrapperClasses: "", items:[]},
			    	{type: "containerType", grid:"container", classes: "container", wrapperClasses: "", rows:[]},
			    	{type: "containerType", grid:"container-fluid", classes: "container-fluid", wrapperClasses: "", rows:[]}
			    );


			    $scope.$watch('model', function(model) {
			        $scope.modelAsJson = angular.toJson(model, true);
			    }, true);

  	}


    $scope.savePage = function(){

    	$scope.page._source.model = $scope.model;

		$http({
		  method: 'POST',
		  url: '/cms/page/'+ $scope.page._id +'/save',
		  data: $scope.page,
		}).then(function successCallback(response) {
			 showalert("Page saved!","alert-success")
			 $('#optionsModal').modal('hide')
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});


    }

	$scope.removeRow = function (id){
		$('div[data-row-number="' + id + '"]').remove();
		if($("div[data-row-number]").size() == 0){
			$(".drop-message").show();
		}

	}


	$scope.addCol = function (gridWidth, name){

		var placeholderCLass = ""
		if(name.indexOf('Placeholder') > -1){
			placeholderCLass = "placeholder";
		}
		var newCol ="<div data-section-name='"+name+"' data-col-width='"+gridWidth+"' dragable='true' class='col-md-" + gridWidth + " col-drop "+placeholderCLass+"'><button class='btn btn-default clean-grid' onclick='$(this).parent().remove()'>x</button>"+name+" </div>"

		return newCol;
	}

	$scope.optionsModal = function (element, index, parent, grandParent) {
		console.log(element, index, parent, grandParent)
		if(element == "container"){
			$scope.optionsModal.wrapperClasses = $scope.model[index].wrapperClasses
			$scope.optionsModal.classes = $scope.model[index].classes
		}
		else if(element == "row"){
			$scope.optionsModal.wrapperClasses = $scope.model[parent].rows[index].wrapperClasses
			$scope.optionsModal.classes = $scope.model[parent].rows[index].classes
		}else{
			$scope.optionsModal.wrapperClasses = $scope.model[grandParent].rows[parent].items[index].wrapperClasses
			$scope.optionsModal.classes = $scope.model[grandParent].rows[parent].items[index].classes

		}

		$scope.optionsModal.element = element;
		$scope.optionsModal.index = index;
		$scope.optionsModal.parent = parent;
		$scope.optionsModal.grandParent = grandParent;

	}
	
	$scope.saveModalOptions = function () {
		if($scope.optionsModal.element == "container"){
			$scope.model[$scope.optionsModal.index].wrapperClasses = $scope.optionsModal.wrapperClasses
			$scope.model[$scope.optionsModal.index].classes = $scope.optionsModal.classes 
		}
		else if($scope.optionsModal.element == "row"){
			$scope.model[$scope.optionsModal.parent].rows[$scope.optionsModal.index].wrapperClasses = $scope.optionsModal.wrapperClasses
			$scope.model[$scope.optionsModal.parent].rows[$scope.optionsModal.index].classes = $scope.optionsModal.classes

		}else{
			$scope.model[$scope.optionsModal.grandParent].rows[$scope.optionsModal.parent].items[$scope.optionsModal.index].wrapperClasses = $scope.optionsModal.wrapperClasses
			$scope.model[$scope.optionsModal.grandParent].rows[$scope.optionsModal.parent].items[$scope.optionsModal.index].classes = $scope.optionsModal.classes

		}

		$scope.savePage()
	}

 }]);



app.controller('page-edit', ['$scope', '$http', '$routeParams','$location',
  function ($scope, $http, $routeParams, $location) {

  	init();
  	function init(){

		$http({
		  method: 'POST',
		  url: '/cms/page/'+$routeParams.id
		}).then(function successCallback(response) {
			$scope.current_language = "default";

			$scope.page = response.data;
			console.log($scope.page )

			if(editor){

				editor.setValue($scope.page._source.languages[$scope.current_language].htmlHead, -1)

			}

			$scope.$watchCollection('current_language', function(newLang, oldLang) {

				if(editor){
					console.log(newLang + oldLang)
					$scope.page._source.languages[oldLang].htmlHead = editor.getValue();
					
					if(!$scope.page._source.languages[newLang].htmlHead){
						$scope.page._source.languages[newLang].htmlHead = "";
					}
					editor.setValue($scope.page._source.languages[newLang].htmlHead, -1)
				}

			});
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});
  	}



    $scope.savePage = function(){


    	$scope.page._source.languages[$scope.current_language].htmlHead = editor.getValue();

		$http({
		  method: 'POST',
		  url: '/cms/page/'+ $scope.page._id +'/save',
		  data: $scope.page,
		}).then(function successCallback(response) {
			 showalert("Page saved!","alert-success")
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
			showalert("Saving page failed!","alert-danger")
		});


    }

 }]);


app.controller('sections', ['$scope', '$http', '$routeParams','$location','getSections',
  function ($scope, $http, $routeParams, $location, getSections) {

  	init();
  	function init(){
		getSections.async().then(function(d) {
		$scope.sections = d;
		});
  	}

  	$scope.deleteSection = function(_id){
		$http({
		  method: 'POST',
		  url: '/cms/section/'+ _id +'/delete',
		  refresh: false,
		}).then(function successCallback(response) {
			if(response.data == 200){
				init();
			}else{
				showalert("This section is still in use.", "alert-danger")
			}
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});
  	}

 }]);

app.controller('section', ['$scope', '$http', '$routeParams','$location',
  function ($scope, $http, $routeParams, $location) {


  	function init(){
  		$scope.current_language = "default";
  		

		$http({
		  method: 'POST',
		  url: '/cms/section/'+$routeParams.id
		}).then(function successCallback(response) {
			$scope.section = response.data;
			
			if(tinyMCE.activeEditor){
				tinyMCE.activeEditor.setContent($scope.section._source.languages[$scope.current_language].html);
			}

			$scope.$watchCollection('current_language', function(newLang, oldLang) {

				if(tinyMCE.activeEditor){
					$scope.section._source.languages[oldLang].html = tinyMCE.activeEditor.getContent()
					tinyMCE.activeEditor.setContent( $scope.section._source.languages[$scope.current_language].html )
				}
			});

		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});



  	}


    $scope.saveSection = function(){

    	$scope.section._source.languages[$scope.current_language].html = tinyMCE.activeEditor.getContent();

		$http({
		  method: 'POST',
		  url: '/cms/section/'+ $scope.section._id +'/save',
		  data: $scope.section
		}).then(function successCallback(response) {
			if(response.data == 200){
				showalert("Section saved.", "alert-success")
			}
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});	
    }



  	init();
 }]);

app.controller('navigation', ['$scope', '$http', '$routeParams','$location',
  function ($scope, $http, $routeParams, $location) {

  	function init(){

  		$scope.current_language = "default";
  		$scope.navElementType = "link";
  		$scope.navigations = {}
  		getNavigation();
  		getPages();
  	}

    $scope.dropCallback = function(event, index, item, external, type, allowedType) {
        $scope.logListEvent('dropped at', event, index, external, type);
        clearInterval(hoverIntverval);

        // if (external) {
        //     if (allowedType === 'itemType' && !item.label) return false;
        //     if (allowedType === 'containerType' && !angular.isArray(item)) return false;
        // }
        return item;
    };


  	function getNavigation() {
  			$http({
			  method: 'GET',
			  url: '/cms/navigation/main',
			}).then(function successCallback(response) {

				console.log(response.data)
				$scope.navigations = response.data
				
			}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
				showalert("Could not load navigations!", "alert-danger")
			});
  	}

  	function getPages(argument) {
		$http({
		  method: 'GET',
		  url: '/cms/pages/all'
		}).then(function successCallback(response) {
			$scope.pages = response.data.hits.hits;

			if($scope.pages.length > 0){
				$scope.selectedPage = $scope.pages[0]._source.languages.default.pagetitle
			}

		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});
  	}

  	$scope.saveNavigation = function(argument) {
  			$http({
			  method: 'POST',
			  url: '/cms/save-navigation',
			  data: {
			  	navigation: $scope.navigations,
			  	_id: "main"
			  }
			}).then(function successCallback(response) {

				showalert("Navigations saved.", "alert-success")
				
			}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
				showalert("Save failed!", "alert-danger")
			});
  	}

  	$scope.addElement = function(navElementType,navElementName,selectedPage,navElementUrl) {
  		if(navElementType == "link"){
  			$scope.navigations._source.languages[$scope.current_language].model.push({
				name: navElementName,
				type: "link",
				url: selectedPage,
				external: false,
				dropdown: false,
				items:[]
  			})
  		}else if(navElementType == "external-link"){
  			$scope.navigations._source.languages[$scope.current_language].model.push({
				name: navElementName,
				type: "external-link",
				url: navElementUrl,
				external: true,
				dropdown: false,
				items:[]
  			})
  		}else if(navElementType == "dropdown"){
  			$scope.navigations._source.languages[$scope.current_language].model.push({
				name: navElementName,
				type: "dropdown",
				url: "",
				external: false,
				dropdown: true,
				items:[]
  			})
  		}else{
  			showalert("Error: Element does not exist.", "alert-danger")
  		}
  		
  	}


  	init();
 }]);


app.controller('image-upload', ['$scope', '$http', '$routeParams','$location',
  function ($scope, $http, $routeParams, $location) {

  	
  	function init(){
			$http({
			  method: 'GET',
			  url: '/cms/all-images',
			}).then(function successCallback(response) {


				var host = "http://"+window.location.hostname;

				if(window.location.port != 80){
					host += ":" + window.location.port;
				}

				$scope.host = host;

				$scope.images = response.data;


				
			}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
				showalert("Could not load images!", "alert-danger")
			});
  		
  	}

  	$scope.delete = function (url) {

  		url = "./public/uploads/" + url

		$http({
		  method: 'POST',
		  url: '/cms/delete-file',
		  data: {
		  	url: url
		  }
		}).then(function successCallback(response) {

			if(response.data == 200){
				showalert("Image deleted.", "alert-success")
				setTimeout(function(){
					window.location.href = "/cms/image-upload"; 
				}, 1000);
			}else{
				showalert("Image not deleted.", "alert-warning")
			}		
			
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
			showalert("Something went wrong!", "alert-danger")
		});
  	}

  	init();

 }]);

app.controller('sass-editor', ['$scope','$rootScope', '$http', '$routeParams','$location',
  function ($scope, $rootScope, $http, $routeParams, $location) {

  	init();
  	function init(){
  		$scope.active_file = "";

  		if(!$rootScope.open_sass_files){
  			$rootScope.open_sass_files = [];
  		}
  		

		$http({
		  method: 'GET',
		  url: '/cms/sass-folder'
		}).then(function successCallback(response) {
		
			$scope.sass = response.data;
			$scope.sass_files = {}

			var main_url = "";

			if($rootScope.open_sass_files.length > 0){

				for (var i = 0; i < $rootScope.open_sass_files.length; i++) {

					$scope.getSassFile($rootScope.open_sass_files[i]);
					
				}

			}else{
				do {
				    for (var i = 0; i < $scope.sass.children.length; i++) {
				    	if($scope.sass.children[i].name.indexOf(".scss") > -1){
				    		main_url = $scope.sass.children[i].path

				    		$scope.getSassFile(main_url, $scope.sass.children[i].name);

				    		return ;
				    	}
				    	
				    }
				}
				while (main_url == "");
			}



			

		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});
  	}


  	$scope.getSassFile = function(path, name) {


  		if(!$scope.sass_files[path]){
			$http({
			  method: 'GET',
			  url: '/cms/get-file?url='+path
			}).then(function successCallback(response) {

				response.data.name = name || response.data.path.split('/').pop();
				
				$scope.sass_files[response.data.path] = response.data;
				if(editor){
					if($scope.active_file != ""){
						$scope.sass_files[$scope.active_file].data = editor.getValue();
					}

					editor.setValue(response.data.data, -1)

				}
				$scope.open_sass_files.push(path)
				$scope.active_file = path;
			}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
			});
  		}else{
  			$scope.sass_files[$scope.active_file].data = editor.getValue();
  			editor.setValue($scope.sass_files[path].data, -1)
  			$scope.active_file = path;
  		}


  	}

  	$scope.saveSassFiles = function() {
  		if($scope.active_file != ""){
			$scope.sass_files[$scope.active_file].data = editor.getValue();
		}

  		for (var file in $scope.sass_files) {
  			console.log()
			$http({
			  method: 'POST',
			  url: '/cms/save-file',
			  data: {
			  	path: $scope.sass_files[file].path,
			  	data: $scope.sass_files[file].data,
			  	name: $scope.sass_files[file].name
			  }
			}).then(function successCallback(response) {

				showalert(response.data.name+ " saved.", "alert-success")
				
			}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
				showalert("Saving failed!", "alert-danger")
			});
  		}

  	}

  	$scope.saveCurrentSassFile = function() {
  		if($scope.active_file != ""){
			$scope.sass_files[$scope.active_file].data = editor.getValue();
		}

		$http({
		  method: 'POST',
		  url: '/cms/save-file',
		  data: {
		  	path: $scope.sass_files[$scope.active_file].path,
		  	data: $scope.sass_files[$scope.active_file].data,
		  	name: $scope.sass_files[$scope.active_file].name
		  }
		}).then(function successCallback(response) {

			showalert(response.data.name+ " saved.", "alert-success")
			
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
			showalert("Saving failed!", "alert-danger")
		});

  	}

  	$scope.changeFile = function(path) {
  		if($scope.active_file != ""){
			$scope.sass_files[$scope.active_file].data = editor.getValue();
		}

		editor.setValue($scope.sass_files[path].data, -1) 
		$scope.active_file = path
  	}

  	$scope.closeFile = function(path) {
  	
  		if($scope.open_sass_files.length <= 1){
  			showalert("You can not close all tabs.", "alert-warning")
  		}else{

  			var index = $scope.open_sass_files.indexOf(path);
  			if (index > -1) {
			    $scope.open_sass_files.splice(index, 1);
			}

  			delete $scope.sass_files[path];
  			editor.setValue($scope.sass_files[$scope.open_sass_files[$scope.open_sass_files.length -1]].data, -1)
  			$scope.active_file = $scope.sass_files[$scope.open_sass_files[$scope.open_sass_files.length -1]].path;
  			console.log($scope.active_file)
  		}
  		


  	}

 }]);

app.controller('scaffhold', ['$scope','$rootScope', '$http', '$routeParams','$location',
  function ($scope, $rootScope, $http, $routeParams, $location) {

  	
  	function init(){
  		$scope.active_file = "";

  		$rootScope.open_files = [];
  		$rootScope.open_files = ['views/page.ejs','views/page-parts/header.ejs','views/page-parts/footer.ejs','views/page-parts/nav.ejs', 'public/js/page.js'];
  		
		
		$scope.files = {}
		var main_url = "";

		for (var i = 0; i < $rootScope.open_files.length; i++) {
			$scope.getFile($rootScope.open_files[i])
		}


  	}
  	

  	$scope.getFile = function(path, name) {


  		if(!$scope.files[path]){
			$http({
			  method: 'GET',
			  url: '/cms/get-file?url='+path
			}).then(function successCallback(response) {

				response.data.name = name || response.data.path.split('/').pop();
				
				$scope.files[response.data.path] = response.data;
				if(editor){
					if($scope.active_file != ""){
						$scope.files[$scope.active_file].data = editor.getValue();
					}

					editor.setValue(response.data.data, -1)

				}
				$scope.active_file = path;
			}, function errorCallback(response) {
			// called asynchronously if an error occurs
			// or server returns response with an error status.
			});
  		}else{
  			$scope.files[$scope.active_file].data = editor.getValue();
  			editor.setValue($scope.files[path].data, -1)
  			$scope.active_file = path;
  		}


  	}

  	$scope.saveCurrentFile = function() {
  		if($scope.active_file != ""){
			$scope.files[$scope.active_file].data = editor.getValue();
		}

		$http({
		  method: 'POST',
		  url: '/cms/save-file',
		  data: {
		  	path: $scope.files[$scope.active_file].path,
		  	data: $scope.files[$scope.active_file].data,
		  	name: $scope.files[$scope.active_file].name
		  }
		}).then(function successCallback(response) {

			showalert(response.data.name+ " saved.", "alert-success")
			
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
			showalert("Saving failed!", "alert-danger")
		});

  	}

  	$scope.changeFile = function(path) {
  		if($scope.active_file != ""){
			$scope.files[$scope.active_file].data = editor.getValue();
		}



		editor.setValue($scope.files[path].data, -1) 
		$scope.active_file = path

		if($scope.active_file.indexOf(".js") > -1){
			editor.getSession().setMode("ace/mode/javascript");
		}else{
			editor.getSession().setMode("ace/mode/ejs");
		}

  	}
	init();
 }]);


app.controller('settings', ['$scope', '$http', '$routeParams','$location',
  function ($scope, $http, $routeParams, $location) {


  	function init(){

		$http({
		  method: 'GET',
		  url: '/cms/get-file?url=config.json'
		}).then(function successCallback(response) {

			$scope.settings = JSON.parse(response.data.data);

			$scope.$watchCollection('settings.default_lang', function() {
				var index = $scope.settings.supported_lang.indexOf($scope.settings.default_lang)
				if(index > -1){
					
				}else{
					$scope.settings.supported_lang.push($scope.settings.default_lang);
				}
				
			});

		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});



  	}
  	$scope.getFile = function(path, name) {

		$http({
		  method: 'GET',
		  url: '/cms/get-file?url='+path
		}).then(function successCallback(response) {

			$scope.settings = JSON.parse(response.data.data);

		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		});

  	}

  	$scope.saveSettings = function() {
		$http({
		  method: 'POST',
		  url: '/cms/save-file',
		  data: {
		  	path: "config.json",
		  	data: $scope.settings,
		  	name: "config.json"
		  }
		}).then(function successCallback(response) {

			showalert("Settings saved.", "alert-success")
			
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
			showalert("Saving failed!", "alert-danger")
		});

  	}

  	$scope.savePassword = function() {
		$http({
		  method: 'POST',
		  url: '/password',
		  data: {
		  	cms_password: $scope.cms_password,
		  	cms_password_re: $scope.cms_password_re
		  }
		}).then(function successCallback(response) {
			console.log(response)
			if(response.data.error == 0){
				showalert("Password changed.", "alert-success")
			}else if(response.data.error == 100){
				showalert("Passwords does not match.", "alert-warning")
			}else if(response.data.error == 101){
				showalert("Password can't be empty.", "alert-warning")
			}else{
				showalert("Changing the password failed!", "alert-danger")
			}
			
			
		}, function errorCallback(response) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
			showalert("Chaning the password failed!", "alert-danger")
		});

  	}

  	$scope.addLanguage = function(lang) {
  		var index = $scope.settings.supported_lang.indexOf(lang)
  		if(index > -1){
  			showalert("Already added.", "alert-warning")
  		}else{
  			$scope.settings.supported_lang.push(lang)
  		}
  	}

  	$scope.removeLanguage = function (lang) {
  		if($scope.settings.default_lang == lang){
  			showalert("You cannot remove the default language", "alert-warning")
  		}else{
  			var index = $scope.settings.supported_lang.indexOf(lang)

  			if(index > -1){
  				$scope.settings.supported_lang.splice(index, 1)
  			}
  		}
  	}


  	init();
 }]);


 function showalert(message,alerttype) {

    var icon;


    switch (alerttype) {
        case "alert-success":
            icon = "fa fa-check";
            break;
        case "alert-info":
            icon = "fa fa-info";
            break;
        case "alert-warning":
            icon = "fa fa-exclamation-circle";
            break;
        case "alert-danger":
            icon = "fa fa-exclamation-triangle";
            break;
        default:
            // noop
    }

    var random = parseInt(Math.random()*10000);

    $('#error_popup').append('<div id="alertdiv'+random+'" class="alert ' +  alerttype + '"><a class="close" data-dismiss="alert">×</a><span><i class="'+icon+'" style="padding-right:5px;"></i>'+message+'</span></div>')

    setTimeout(function() { 

        $("#alertdiv"+random).fadeOut( 1000, "linear")
        setTimeout(function() { 
            $("#alertdiv"+random).remove();
        }, 1000);

    }, 5000);
  }





