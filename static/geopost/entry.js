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
			if (e.feature.getId().split(".")[1] == OL_OBJ.entryFID) {
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