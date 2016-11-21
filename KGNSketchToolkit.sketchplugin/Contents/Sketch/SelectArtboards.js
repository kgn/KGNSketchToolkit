function main(context) {
	var sketch = context.api();
	var document = sketch.selectedDocument;
	var selection = document.selectedLayers;

	var artboards = [];
	selection.iterate(function(layer) {
	    artboards.push(layer.parentArtboard);
	});
	selection.clear();
	artboards.forEach(function(artboard) {
	    artboard.addToSelection();
	});
}