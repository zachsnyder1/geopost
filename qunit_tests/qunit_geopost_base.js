QUnit.module('Test geopost_base.js functions');
QUnit.test('test writeTrans', function(assert) {
	var testfeat = new ol.Feature(new ol.geom.Point([0, 0]));
	result = OL_OBJ.writeTrans([testfeat]);
	expected = "<Transaction xmlns=\"http://www.opengis.net/wfs\" service=\"WFS\" version=\"1.1.0\" xsi:schemaLocation=\"http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><Insert><entries xmlns=\"/geopost\"><geometry><Point xmlns=\"http://www.opengis.net/gml\" srsName=\"EPSG:3857\"><pos>0 0</pos></Point></geometry></entries></Insert></Transaction>";
	assert.equal(result, expected, 'WFS-t XML renders properly');
});
QUnit.test('test rescaleView', function(assert) {
	var fixture = $("#qunit-fixture");
	var mapId = 'map';
	var map = $('<div></div>').
		attr('id', mapId).
		appendTo(fixture);
	
	$(document).ready(function () {
		// make the map
		OL_OBJ.map = new ol.Map({
			target: 'map',
			layers: [],
			view: OL_OBJ.view,
			interactions: []
		});
		// Make a source, add feature, call rescaleView
		var oldcenter = OL_OBJ.view.getCenter(); // Time 1
		var coords1 = [1, 2];
		var coords2 = [5, 10];
		var newfeat1 = new ol.Feature(new ol.geom.Point(coords1));
		var newfeat2 = new ol.Feature(new ol.geom.Point(coords2));
		var src = new ol.source.Vector();
		src.addFeature(newfeat1);
		OL_OBJ.rescaleView(src);
		src.addFeature(newfeat2);
		// FINALLY, ASSERT VIEW NOT CENTERED ON [0,0]
		var newcenter = OL_OBJ.view.getCenter(); // Time 2
		assert.notEqual(newcenter[0], oldcenter[0], 'view recentered');
		assert.notEqual(newcenter[1], oldcenter[1], 'view recentered');
	});
});
QUnit.test('test resetView', function(assert) {
	var fixture = $("#qunit-fixture");
	var mapId = 'map';
	var map = $('<div></div>').
		attr('id', mapId).
		css('height', '100px').
		appendTo(fixture);
	var done = assert.async();
	
	$(document).ready(function () {
		// make the map
		OL_OBJ.map = new ol.Map({
			target: 'map',
			layers: [],
			view: OL_OBJ.view,
			interactions: []
		});
		// Get size, resize, then get size again.
		var size1 = OL_OBJ.map.getSize();
		map.css('height', '200px');
		OL_OBJ.resetView();
		setTimeout(function() {
			var size2 = OL_OBJ.map.getSize();
			assert.notEqual(size1, size2, 'viewport change is registered');
			done();
		}, 300);
	});
});
QUnit.test('test toggleInter', function(assert) {
	var fixture = $("#qunit-fixture");
	var mapId = 'map';
	var map = $('<div></div>').
		attr('id', mapId).
		appendTo(fixture);
	var btn = $('<div></div>').
		addClass('btn-success').
		appendTo(fixture);
	var done1 = assert.async();
	var done2 = assert.async();
	var done3 = assert.async();
	var done4 = assert.async();
	
	$(document).ready(function () {
		// make the map
		OL_OBJ.map = new ol.Map({
			target: 'map',
			layers: [],
			view: OL_OBJ.view,
			interactions: [OL_OBJ.dragpan]
		});
		// make interaction, set toggle
		var inter = new ol.interaction.Select({
			condition: ol.events.condition.click,
			layers: []
		});
		var active = false;
		btn.on('click', OL_OBJ.toggleInter(inter, active, btn));
		
		// FIRST, ASSERT BTN HAS CLASS 'btn-success' AND MAP HAS ONLY DRAGPAN
		var inters1 = OL_OBJ.map.getInteractions();
		inters1.forEach(function(interEl) {
			if (interEl == OL_OBJ.dragpan) {
				done1();
			} else if (interEl == inter) {
				assert.ok(false, 'BEFORE: map doesn\'t have test interaction');
			}
		});
		assert.ok(btn.hasClass('btn-success'), 'BEFORE: btn has "btn-success" class');
		assert.notOk(btn.hasClass('btn-danger'), 'BEFORE: btn doesn\'t have \'btn-danger\' class');
		
		// TOGGLE FIRST TIME
		btn.click();
		
		// AFTER, ASSERT TOGGLE SUCCESS
		var inters2 = OL_OBJ.map.getInteractions();
		inters2.forEach(function(interEl) {
			if (interEl == OL_OBJ.dragpan) {
				assert.ok(false, 'AFTER: map doesn\'t have dragpan');
			} else if (interEl == inter) {
				done2();
			}
		});
		assert.ok(btn.hasClass('btn-danger'), 'AFTER: btn has "btn-danger" class');
		assert.notOk(btn.hasClass('btn-success'), 'AFTER: btn doesn\'t have \'btn-success\' class');
		
		// TOGGLE SECOND TIME
		btn.click();
		
		// BACK AGAIN, ASSERT BTN HAS CLASS 'btn-success' AND MAP HAS ONLY DRAGPAN
		var inters3 = OL_OBJ.map.getInteractions();
		inters3.forEach(function(interEl) {
			if (interEl == OL_OBJ.dragpan) {
				done3();
			} else if (interEl == inter) {
				assert.ok(false, 'BACK AGAIN: map doesn\'t have test interaction');
			}
		});
		assert.ok(btn.hasClass('btn-success'), 'BACK AGAIN: btn has "btn-success" class');
		assert.notOk(btn.hasClass('btn-danger'), 'BACK AGAIN: btn doesn\'t have \'btn-danger\' class');
		
		done4();
	});
});
