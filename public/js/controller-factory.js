app.factory('getSections', function($http) {
  var return_service = {
    async: function() {
      // $http returns a promise, which has a then function, which also returns a promise
      var promise = $http({
		  method: 'GET',
		  url: '/cms/sections/all'
		}).then(function (response) {
        // The then function here is an opportunity to modify the response
        // The return value gets picked up by the then in the controller.
        return response.data.hits.hits;
      });
      // Return the promise to the controller
      return promise;
    }
  };
  return return_service;
});
