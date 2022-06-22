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
		$('#title').text(targetEntry.get('title'));
		$('#body').text(targetEntry.get('body'));
		$('#info').modal('show');
		OL_OBJ.retrievePhoto(targetEntry.get('uuid'), $('#photo'));
		console.log("Feature ID: " + targetEntry.getId().split(".")[1]);
	});
	// DeOL_OBJ.select entry when modal is hidden
	$('#info').on('hide.bs.modal', function (e) {
		OL_OBJ.select.getFeatures().clear();
	});
});
