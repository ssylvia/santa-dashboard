function PointAtts(title,description,type,url) {
	
	var _title = title;
	var _description = description;
	var _type = type;
	var _url = url;
	
	this.getTitle = function() {
		return _title;
	}
	
	this.getDescription = function() {
		return _description;
	}
	
	this.getType = function() {
		return _type;
	}
	
	this.getURL = function() {
		return _url;
	}
	
}