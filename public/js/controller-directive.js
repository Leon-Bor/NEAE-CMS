
app.directive("addrow", function($compile){
	return function(scope, element, attrs){
		element.bind("click", function(){

			$(".drop-message").hide();
			var template = "" +
			"<li class='drag-in row' draggable='true'>"+
				//"<div class='menu-bar'>"+
				//"<i class='fa fa-times close-btn' ng-click='removeRow($event)'></i>"+
				// //	"<i class='fa fa-chevron-down close-btn' ng-click='moveRowDown($event)' ></i> "+
				// //	"<i class='fa fa-chevron-up close-btn' ng-click='moveRowUp($event)' ></i>"+
				// "</div>"+
				"<ol class='page_sections'>"+
				"</ol>"+
			"</li>"
			angular.element(document.getElementsByClassName('page')).append($compile(template)(scope));


		});
	};
});

