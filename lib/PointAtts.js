function PointAtts(title,description,type,url,format) {
	
	var _title = title;
	var _description = description;
	var _type = type;
	var _url = url;
	var _format = format;
	
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
	
	this.getFormat = function() {
		return _format;
	}
	
}

PointAtts.FORMAT_TYPE_PHOTO = "photo";
PointAtts.FORMAT_TYPE_VIDEO = "video";

PointAtts.RESULT_TYPE_SANTA = "santa";
PointAtts.RESULT_TYPE_LIGHTS = "lights";
PointAtts.RESULT_TYPE_TREE = "tree";
PointAtts.RESULT_TYPE_HOLIDAYS = "holidays";
