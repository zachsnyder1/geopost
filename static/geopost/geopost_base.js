// OBJECT FOR SCOPING GLOBAL RESOURCES
OL_OBJ = {};
/*
/  -- STRING CONSTANTS --
*/
OL_OBJ.wrksp = "geopost";
OL_OBJ.featNs = "/" + OL_OBJ.wrksp;
OL_OBJ.featType = "entries";
OL_OBJ.defaultSRS = "EPSG:3857";
OL_OBJ.ZSDomain = 'https://zach-site.com';
OL_OBJ.GSDomain = 'https://zach-site.com';
OL_OBJ.wfsOperation = 'CREATE'; // Default WFS-t operation is insertion
/*
/ -- REUSED MAP COMPONENTS --
*/
// TILE LAYER
OL_OBJ.tile = new ol.layer.Tile({
	source: new ol.source.OSM()
});
// ENTRIES SOURCE
OL_OBJ.entriessource = new ol.source.Vector({
	url: OL_OBJ.GSDomain + '/geoserver' + OL_OBJ.featNs + '/ows?service=' +
		'WFS&version=2.0.0&request=GetFeature&typeName=' + OL_OBJ.wrksp + 
		':' + OL_OBJ.featType + '&srsname=EPSG:4326&outputFormat=' +
		'application/json',
	format: new ol.format.GeoJSON()
});
// ENTRIES LAYER
OL_OBJ.entries = new ol.layer.Vector({
	source: OL_OBJ.entriessource,
	style: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 9,
			fill: new ol.style.Fill({color: 'yellow'})
		})
	})
});
// THE VIEW
OL_OBJ.view = new ol.View({
	center: [0, 0],
	zoom: 3,
	maxZoom: 16
});
// DRAGPAN INTERACTION
OL_OBJ.dragpan = new ol.interaction.DragPan();
// WFS FORMAT OBJECT
OL_OBJ.wfst = new ol.format.WFS({
	featureNS: OL_OBJ.featNs,
	featureType: OL_OBJ.featType
});
/*
/ -- USEFUL FUNCTIONS --
*/
// wrapper for ol.format.WFS writeTransaction call
OL_OBJ.writeTrans = function (pntArray) {
	// WFS transaction format object
	var options = {
		gmlOptions: {srsName: OL_OBJ.defaultSRS}, 
		featureNS: OL_OBJ.featNs,
		featureType: OL_OBJ.featType
	};
	var node;
	if (OL_OBJ.wfsOperation == 'CREATE') {
		node = OL_OBJ.wfst.writeTransaction(pntArray, null, null, options);
	} else if (OL_OBJ.wfsOperation == 'UPDATE') {
		node = OL_OBJ.wfst.writeTransaction(null, pntArray, null, options);
	} else if (OL_OBJ.wfsOperation == 'DELETE') {
		node = OL_OBJ.wfst.writeTransaction(null, null, pntArray, options);
	}
	return new XMLSerializer().serializeToString(node);
};
// Scale View to Extent of A Layer
OL_OBJ.rescaleView = function (lyrSrcObj) {
	lyrSrcObj.on('change', function (e) {
		if (lyrSrcObj.getState() == 'ready') {
			extent = lyrSrcObj.getExtent();
			OL_OBJ.view.fit(extent, OL_OBJ.map.getSize());
		}
	});
};
// Reset View to Clear Distortion
OL_OBJ.resetView = function () {
	setTimeout(function(){OL_OBJ.map.updateSize();}, 200);
};
// Retrieve a photo from the bucket, attach to img element
OL_OBJ.retrievePhoto = function (uuid, imgElem) {
	imgElem.attr('src', '/static/geopost/loading.jpg');
	$.ajax({
		url: OL_OBJ.ZSDomain + '/projects/geopost/photo/' + uuid,
		success: function(data, status, xhr) {
			srcStr = 'data:' + xhr.getResponseHeader('Content-Type') + 
				';base64,' + data;
			imgElem.attr('src', srcStr);
		},
		error: function(xhr) {
			console.log("ERROR RETRIEVING PHOTO");
		}
	});
};
// interaction toggle handler for buttons
OL_OBJ.toggleInter = function (interaction, active, btn) {
	return function() {
		if (active === false) {
			OL_OBJ.map.removeInteraction(OL_OBJ.dragpan);
			OL_OBJ.map.addInteraction(interaction);
			btn.removeClass('btn-success');
			btn.addClass('btn-danger');
			active = true;
		} else {
			OL_OBJ.map.removeInteraction(interaction);
			OL_OBJ.map.addInteraction(OL_OBJ.dragpan);
			btn.removeClass('btn-danger');
			btn.addClass('btn-success');
			active = false;
		}
	};
};
// collect fid from url query string, if present
OL_OBJ.entryFID = function() {
	var qstrArray = window.location.search.split('?');
	for (i = 1; i < qstrArray.length; i++) {
		var arg = qstrArray[i].split('=');
		if (arg[0] == 'fid') {
			return arg[1];
		}
	}
	return undefined;
}();
/*
/ ON DOCUMENT READY:
*/
try {
	QUnit = QUnit;
} catch (e) {
	$(document).ready(function () {
		// ...MAKE THE MAP
		OL_OBJ.map = new ol.Map({
			target: 'map',
			layers: [OL_OBJ.tile/*, OL_OBJ.entries*/],
			view: OL_OBJ.view,
			interactions: [OL_OBJ.dragpan],
			controls: ol.control.defaults({
				attributionOptions: ({
            		collapsible: false
          		})
          	})
		});
	});
}

