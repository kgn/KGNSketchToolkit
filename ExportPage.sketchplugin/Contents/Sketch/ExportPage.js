// Commands

function exportPage(page, labelOffset, exportPadding) {
    var group, groupName = "Export Page Group";
    var slice, sliceName = "Export Group Slice";

    var artboards = [];
    page.iterate(function(layer) {
        if (layer.name == groupName) {
            group = layer;
            return;
        }
        if (layer.isArtboard) {
            artboards.push(layer);
        }
    });

    if (group === undefined) {
        group = page.newGroup({"name": groupName});
    } else {
        group.layers.forEach(function(layer) {
            if (layer.name == sliceName) {
                slice = layer;
                return;
            }
            layer.remove();
        });
        group.frame = new sketch.Rectangle();
    }

    var sliceFrame;
    artboards.forEach(function(artboard) {
        var label = group.newText({"name": artboard.name});
        label.systemFontSize = 20;
        label.text = artboard.name;
        var labelFrame = label.frame;
        labelFrame.x = artboard.frame.x;
        labelFrame.y = artboard.frame.y-labelFrame.height-labelOffset;
        label.frame = labelFrame;

        if (sliceFrame === undefined) {
            sliceFrame = label.frame;
        }

        if (labelFrame.x < sliceFrame.x) { sliceFrame.x = labelFrame.x }
        if (labelFrame.y < sliceFrame.y) { sliceFrame.y = labelFrame.y }

        if (labelFrame.maxX > sliceFrame.maxX) { sliceFrame.width = labelFrame.maxX-sliceFrame.x }
        if (artboard.frame.maxX > sliceFrame.maxX) { sliceFrame.width = artboard.frame.maxX-sliceFrame.x }

        if (artboard.frame.maxY > sliceFrame.maxY) { sliceFrame.height = artboard.frame.maxY-sliceFrame.y }
    });
    sliceFrame.inset(-exportPadding, -exportPadding);
    if (slice === undefined) {
        slice = group.newSlice({"name": sliceName});
    }
    slice.frame = sliceFrame;
    slice.moveToFront();

    group.adjustToFit();
    group.lock = true;

    slice.select();    
}

function main(context) {
    var sketch = context.api();
    var document = sketch.selectedDocument;
    var page = document.selectedPage;
    var labelOffset = 10, exportPadding = 10;
    exportPage(page, labelOffset, exportPadding);
}

// Tests

var tests = {
    "suites" : {
        "Export Page": {
            "tests" : {

            }
        }
    }
}

function runTests() {
    log(context.api().tester.runUnitTests(tests));
}
// runTests()