// base.js
var TestScript = (function() {
	// Not run during QUnit test
	function main() {
		var projDropdownID = '#projects-dropdown';
		var navCollapseID = '#nav-collapse';
		var navCollapseButtonID = '#nav-coll-button';
		var noJsMessageID = '#no-js-message';
		// Hide the no-js-message
		$(noJsMessageID).hide();
		// Get rid of margin on header
		$('header').attr('style', 'margin-top: 0px; ');
		// Collapse the navbar (from no-js state)
		collapseNavbar({ 
			navCollapseID: navCollapseID, 
			button: navCollapseButtonID 
		});
		// Highlight the active link
		addActiveLink();
	}
	
	// Collapse navbar and close dropdowns
	function collapseNavbar(elemObj) {
		$(elemObj.navCollapseID).
			removeClass('in').
			attr('aria-expanded', 'false');
		$(elemObj.button).addClass('collapsed');
		$(elemObj.button).attr('aria-expanded', 'false');
	}
	
	// Set active link in navbar
	function addActiveLink() {
		"use strict";
		$('a[href="' + window.location.pathname + '"]').
			parent().
			addClass('active');
	}
	
	//  If not QUnit test, run main().
	//  If QUnit test, export the testable functions.
	try {
		if (QUnit) {
			// Export functions for testing...
			var Base = {};
			Base.addActiveLink = addActiveLink;
			Base.collapseNavbar = collapseNavbar;
	
			return Base;
		}
	} catch (e) {
		if (e instanceof ReferenceError) {
			$(document).ready(function() {
				main();
			});
		} else {
			throw e;
		}
		
	}
})();
// projects_base.js
var TestScript = (function() {
	// Not run during QUnit test
	function main() {
		var subNavID = "project-subnav";
		var subnavDelay = 300;
		var subnavDuration = 700;
		var activeIconFadeDuration = 800;
		// Hide project subnav so it is in jQuery queue for slide down
		$("#" + subNavID).hide();
		// Lighten and flash infinitely the $ cursor
		subNavActiveLink(activeIconFadeDuration);
		// Slide subnav down
		slideSubNavDown(subNavID, subnavDelay, subnavDuration);
	}
	
	// Causes the .subnav-link-active-icon to fade in and out
	// infinitely
	function subNavActiveLink(duration) {
		function infiniteFade() {
			$(this).fadeOut(duration, function() {
				$(this).fadeIn(duration, infiniteFade);
			});
		}
		setTimeout(function() {
			$('.subnav-link').each(function() {
				if ($(this).parent().hasClass('active')) {
					$(this).
						children("div").
						children('.subnav-link-active-icon').
						fadeIn(duration, infiniteFade);
				}
			});
		}, 0);
	}
	
	// Slide the subnav down 
	function slideSubNavDown(subNavID, delay, duration) {
		setTimeout(function() {
			$('#' + subNavID).slideDown(duration, function() {});
		}, delay);
	}
	
	//  If not QUnit test, run main().
	//  If QUnit test, export the testable functions.
	try {
		if (QUnit) {
			// Export functions for testing...
			var ProjectsBase = {};
			ProjectsBase.slideSubNavDown = slideSubNavDown;
			ProjectsBase.subNavActiveLink = subNavActiveLink;
	
			return ProjectsBase;
		}
	} catch (e) {
		if (e instanceof ReferenceError) {
			$(document).ready(function() {
				main();
			});
		} else {
			throw e;
		}
		
	}
})();
// OBJECT FOR SCOPING GLOBAL RESOURCES
OL_OBJ = {};
/*
/  -- STRING CONSTANTS --
*/
OL_OBJ.wrksp = "geopost";
OL_OBJ.featNs = "/" + OL_OBJ.wrksp;
OL_OBJ.featType = "entries2";
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
			layers: [OL_OBJ.tile, OL_OBJ.entries],
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


$(document).ready(function () {
	/*
	/  -- LAYERS --
	*/
	// Dummy Draw Source (so that modifying feature of 
	// the actual draw source doesn't rescale the view)
	var dummytempsrc = new ol.source.Vector({});
	// Draw Entry source
	var tempentrysrc = new ol.source.Vector({});
	// Draw Entry layer
	var tempentry = new ol.layer.Vector({
		source: tempentrysrc,
		style: new ol.style.Style({
			image: new ol.style.Circle({
				radius: 12,
				fill: new ol.style.Fill({
					color: 'red'
				})
			})
		})
	});
	
	/*
	/  -- INTERACTIONS --
	*/
	// SELECT
	var select = new ol.interaction.Select({
		condition: ol.events.condition.click,
		layers: [tempentry]
	});
	// MODIFY
	var modify = new ol.interaction.Modify({
		features: select.getFeatures()
	});
	// DRAW
	var draw = new ol.interaction.Draw({
		source: tempentrysrc,
		type: 'Point'
	});
	
	/*
	/  -- MISC. PREP --
	*/
	var newentry; // Holds new entry point
	// when done modifying, update newpoint to new coordinates
	modify.on('modifyend', function(evt) {
		newpoint = evt.features.item(0);
	});
	
	/*
	/  -- UPDATE MAP WITH NEW ELEMENTS --
	*/
	// Adding elements to map
	OL_OBJ.map.addInteraction(select);
	OL_OBJ.map.addLayer(tempentry);
	
	/*
	/  -- MAIN --
	*/
	// the editing buttons
	var drawbtn = $('#drawbtn');
	var modbtn = $('#modbtn');
	// the form elements
	var form = $('#the-form');
	var titleInput = $('#title');
	var bodyInput = $('#body');
	var uuidInput = $('#uuid');
	var fidInput = $('#fid');
	var wfsxmlInput = $('#wfsxml');
	var dummySubmitBtn = $('#dummy-submit');
	var submitBtn = $('#submit-btn');
	// BOOLS indicating whether interactions are attached to the map
	var drawActive = false;
	var modActive = false;
	// IF EDITING EXITING ENTRY:
	if (OL_OBJ.entryFID) {
		// HIDE DRAW BUTTON
		drawbtn.hide();
		// ADD FID TO FID INPUT ON FORM
		fidInput.attr('value', OL_OBJ.entryFID);
		// FIND FEATURE BEING EDITED:
		OL_OBJ.entriessource.on('addfeature', function(e) {
			if (e.feature.get('fid') == OL_OBJ.entryFID) {
				// move feature to tempentry source,
				// also copy to the dummy temp source
				// and reference by newpoint var
				tempentrysrc.addFeature(e.feature);
				dummytempsrc.addFeature(e.feature.clone());
				OL_OBJ.entriessource.removeFeature(e.feature);
				newpoint = e.feature;
				// select it
				select.getFeatures().push(e.feature);
				// POPULATE THE FORM WITH ITS ATTRIBUTES
				titleInput.val(e.feature.get('title'));
				bodyInput.val(e.feature.get('body'));
				// STORE UUID
				OL_OBJ.entryUUID = e.feature.get('uuid');
			}
		});
		// set WFS operation to update
		OL_OBJ.wfsOperation = 'UPDATE';
		// rescale view to dummy draw source
		OL_OBJ.rescaleView(dummytempsrc);
	// ELSE, IF CREATING NEW ENTRY:
	} else {
		// HIDE MODIFY GEOM BUTTON
		modbtn.hide();
		// Connect DRAW interaction to draw button:
		drawbtn.on('click', OL_OBJ.toggleInter(draw, drawActive, drawbtn));
		// on drawend display the form 
		draw.on('drawend', function(evt) {
			OL_OBJ.map.removeInteraction(draw);
			OL_OBJ.map.addInteraction(OL_OBJ.dragpan);
			drawbtn.hide();
			modbtn.show();
			newpoint = evt.feature;
		});
		// MAKE AND STORE NEW UUID
		OL_OBJ.entryUUID = uuid.v4();
		// rescale view to entries source
		OL_OBJ.rescaleView(OL_OBJ.entriessource);
	}
	// Connect MODIFY interaction to modify geom button
	modbtn.on('click', OL_OBJ.toggleInter(modify, modActive, modbtn));
	// Dummy Submit Btn: on click prepare and subit form
	dummySubmitBtn.on('click', function(evt) {
		select.getFeatures().clear();
		newpoint.set('uuid', OL_OBJ.entryUUID);
		newpoint.set('title', titleInput.val());
		newpoint.set('body', bodyInput.val());
		var wfsxml =  OL_OBJ.writeTrans([newpoint]);
		wfsxmlInput.attr('value', wfsxml);
		uuidInput.attr('value', OL_OBJ.entryUUID);
		submitBtn.click();
	});
	// Side bar opens/closes on click
	$('#toolbar-toggle').on('click', function() {
		$('#toolbar').toggle(200);
	});
	// Readjust the view
	OL_OBJ.resetView();
});