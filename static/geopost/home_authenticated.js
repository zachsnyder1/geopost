$(document).ready(function () {	
	/*
	/  -- INTERACTION(S) --
	*/
	OL_OBJ.select = new ol.interaction.Select({
		condition: ol.events.condition.click,
		layers: [OL_OBJ.entries]
	});
	
	/*
	/  -- UPDATE MAP WITH NEW ELEMENTS --
	*/
	// Adding elements to map
	OL_OBJ.map.addInteraction(OL_OBJ.select);
	// Readjusting the view
	OL_OBJ.rescaleView(OL_OBJ.entriessource);
	OL_OBJ.resetView();
	
	/*
	/  -- MAIN --
	*/
	// On Select, Display Info
	OL_OBJ.select.on('select', function (evt) {
		targetEntry = evt.target.getFeatures().item(0);
		// Display title and text of entry
		$('#title').text(targetEntry.get('title'));
		$('#body').text(targetEntry.get('body'));
		$('#info').modal('show');
		OL_OBJ.retrievePhoto(targetEntry.get('uuid'), $('#photo'));
		// Update the edit and delete button 'click' listeners
		// to point to newly OL_OBJ.selected entry:
		$('#edit-btn').on('click', function() {
			var base_url = $('#geopost-entry').attr('data-geopost-entry');
			var curr_fid = targetEntry.get('fid');
			window.location = base_url + '?fid=' + curr_fid;
		});
		$('#delete-btn').on('click', function() {
			OL_OBJ.wfsOperation = 'DELETE';
			var wfsxml =  OL_OBJ.writeTrans([targetEntry]);
			var uuid = targetEntry.get('uuid');
			$('#wfsxmlInput').attr('value', wfsxml);
			$('#uuidInput').attr('value', uuid);
			$('#submit-btn').click();
		});
	});
	// Deselect entry when modal is hidden
	$('#info').on('hide.bs.modal', function (e) {
		OL_OBJ.select.getFeatures().clear();
	});
	// Side bar opens/closes on click
	$('#toolbar-toggle').on('click', function() {
		$('#toolbar').toggle(200);
	});
});