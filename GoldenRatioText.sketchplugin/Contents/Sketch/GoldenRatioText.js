// Commands

function main(context) {
    var sketch = context.api();
    var document = sketch.selectedDocument;
    var selection = document.selectedLayers;

    var ratio = 1.61803398875;
    selection.iterate(function(layer) {
        if (!layer.isText) {
            return;
        }

        var fontSize = layer.fontSize;
        var textWidth = layer.frame.width;
        log(layer.lineHeight);
        layer.lineHeight = Math.round(fontSize * (ratio - (1 / (2 * ratio)) * (1 - textWidth / ((fontSize * ratio)*(fontSize * ratio)))));
        log(layer.lineHeight);
    });
}
// main(context);

// Tests

var tests = {
    "suites" : {
        "Golden Ratio Text": {
            "tests" : {

            }
        }
    }
}

function runTests() {
    log(context.api().tester.runUnitTests(tests));
}
// runTests();
