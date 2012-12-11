LocationsService.prototype.constructor = LocationsService;

function LocationsService(csv) {

	var _csv = csv;
	var _arr;
	var _self;
	var _loaded = false;
	
	_self = this;
	
	$.ajax({
	  type: 'GET',
	  url: _csv,
	  cache: false,
	  success: function(text){ 
		parseCSV(text);	
		_loaded = true;
		$(_self).trigger("load");
	  }
	});	

	// **********
	// methods...
	// **********
	

	this.executeQuery = function() {
		var graphics = [];
		var pt,sms,attr,graphic;
		$.each(_arr,function(index,value){
			pt = esri.geometry.geographicToWebMercator(
				new esri.geometry.Point(
					[value.long,value.lat],
					new esri.SpatialReference({ wkid:4326}))
			);	
			
			sms =  new esri.symbol.SimpleMarkerSymbol();
			attr = new PointAtts(value.title,value.description,value.type,value.url);
			graphic = new esri.Graphic(pt,sms,attr);	
			graphics.push(graphic);
		});
		$(_self).trigger("complete",[graphics]);
	}
	
	this.isLoaded = function() {
		return _loaded;
	}
	
	// *****************
	// private functions
	// *****************

	parseCSV = function(text) {
		
		var title,description,type,url,lat,long;
		
		var lines = CSVToArray(text)
		var fields = lines[0];
		
		var values;
		
		_arr = [];
		
		for (var i = 1; i < lines.length; i++) {
			
			values = lines[i];
			if (values.length == 1) {
				break;
			}
	
			title = values[fields.indexOf("Title")];
			description = values[fields.indexOf("Description")];
			type = values[fields.indexOf("Type")];
			url = values[fields.indexOf("URL")];
			long = values[fields.indexOf("Long")];
			lat = values[fields.indexOf("Lat")];
						
			_arr.push({title:title,description:description,type:type,url:url,long:long,lat:lat});
	
		}
		
	}
		
	// This will parse a delimited string into an array of
	// arrays. The default delimiter is the comma, but this
	// can be overriden in the second argument.
	// courtesy of Ben Nadel www.bennadel.com

	function CSVToArray( strData, strDelimiter ){
		// Check to see if the delimiter is defined. If not,
		// then default to comma.
		strDelimiter = (strDelimiter || ",");
		 
		// Create a regular expression to parse the CSV values.
		var objPattern = new RegExp(
		(
		// Delimiters.
		"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
		 
		// Quoted fields.
		"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
		 
		// Standard fields.
		"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);
		 
		 
		// Create an array to hold our data. Give the array
		// a default empty first row.
		var arrData = [[]];
		 
		// Create an array to hold our individual pattern
		// matching groups.
		var arrMatches = null;
		 
		 
		// Keep looping over the regular expression matches
		// until we can no longer find a match.
		while (arrMatches = objPattern.exec( strData )){
		 
		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];
		 
		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
		strMatchedDelimiter.length &&
		(strMatchedDelimiter != strDelimiter)
		){
		 
		// Since we have reached a new row of data,
		// add an empty row to our data array.
		arrData.push( [] );
		 
		}
		 
		 
		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){
		 
		// We found a quoted value. When we capture
		// this value, unescape any double quotes.
		var strMatchedValue = arrMatches[ 2 ].replace(
		new RegExp( "\"\"", "g" ),
		"\""
		);
		 
		} else {
		 
		// We found a non-quoted value.
		var strMatchedValue = arrMatches[ 3 ];
		 
		}
		 
		 
		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
		}
		 
		// Return the parsed data.
		return( arrData );
	}
 	
}

