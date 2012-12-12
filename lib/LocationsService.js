function LocationsService() {
	
	var _self = this;
	var _loaded = false;
	var _requests;
	var _graphics;

	setTimeout(function(){
		_loaded = true;
		$(_self).trigger("load");
	},500);

	// **********
	// methods...
	// **********
	
	this.executeQuery = function(queryTypes) {
		_requests = [];
		_graphics = [];
		var request;
		$.each(queryTypes,function(index,value) {
			request = new FlickrRequest(value,value);
			_requests.push(request);
			$(request).bind("complete", processFlickrResults);
		});
		$.each(_requests,function(index,value){value.execute()});
	}
	
	this.isLoaded = function() {
		return _loaded;
	}
	
	// *****************
	// private functions
	// *****************
	
	function processFlickrResults(event,graphics) {
		_graphics = _graphics.concat(graphics);
		if ($.grep(_requests,function(n,i){return n.isComplete()}).length == _requests.length) {
			$(_self).trigger("complete",[_graphics]);
		}
	};
	
}

