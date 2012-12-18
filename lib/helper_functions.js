function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function getParameterByName( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function isMobile() {
	var android = navigator.userAgent.match(/Android/i) ? true : false;
	var blackberry = navigator.userAgent.match(/BlackBerry/i) ? true : false;
	var ios = navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
	var windows = navigator.userAgent.match(/IEMobile/i) ? true : false;
	return (android || blackberry || ios || windows);
}

function findLayer(map,name) {
	var layer;
	var found;
	for (var i = 0; i < map.graphicsLayerIds.length; i++) {
		layer = map.getLayer(map.graphicsLayerIds[i]);
		if (layer.name == name) {
			found = layer;
		  	break;
		}  
	}	
	return found;
}

function getGraphicsExtent(graphics) {
  // accepts an array of graphic points and returns extent
  var minx = Number.MAX_VALUE;
  var miny = Number.MAX_VALUE;
  var maxx = - Number.MAX_VALUE;
  var maxy = - Number.MAX_VALUE;
  var graphic;
  for (var i = 0; i < graphics.length; i++) {
	  graphic = graphics[i];
	  if (graphic.geometry.x > maxx) maxx = graphic.geometry.x;
	  if (graphic.geometry.y > maxy) maxy = graphic.geometry.y;
	  if (graphic.geometry.x < minx) minx = graphic.geometry.x;
	  if (graphic.geometry.y < miny) miny = graphic.geometry.y;
  }
  return new esri.geometry.Extent({"xmin":minx,"ymin":miny,"xmax":maxx,"ymax":maxy,"spatialReference":{"wkid":102100}});;
}

function getViewportDimensions() {
	var viewportwidth;
	var viewportheight;
  
	// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
	
	if (typeof window.innerWidth != 'undefined')
	{
		viewportwidth = window.innerWidth,
		viewportheight = window.innerHeight
	}
	
	// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
	
	else if (typeof document.documentElement != 'undefined'
	&& typeof document.documentElement.clientWidth !=
	'undefined' && document.documentElement.clientWidth != 0)
	{
		viewportwidth = document.documentElement.clientWidth,
		viewportheight = document.documentElement.clientHeight
	}
	
	// older versions of IE
	
	else
	{
		viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
		viewportheight = document.getElementsByTagName('body')[0].clientHeight
	}
	return [viewportwidth,viewportheight]
}