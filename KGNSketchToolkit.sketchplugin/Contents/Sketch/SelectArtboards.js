function main(context) {
	var sketch = context.api();
	var document = sketch.selectedDocument;
	var selection = document.selectedLayers;

	var artboards = [];
	selection.iterate(function(layer) {
		// TODO: add parentArtboard to SketchAPI
	    artboards.push(layer._object.parentArtboard());
	});
	selection.clear();
	artboards.forEach(function(artboard) {
	    artboard.select_byExpandingSelection(true, true);
	});
}