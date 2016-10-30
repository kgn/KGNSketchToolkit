
function expandFrame(frame, subFrame) {
    var newFrame = frame;
    if (newFrame === undefined) { return subFrame }
    if (subFrame.x < newFrame.x) { newFrame.x = subFrame.x }
    if (subFrame.y < newFrame.y) { newFrame.y = subFrame.y }
    if (subFrame.maxX > newFrame.maxX) { newFrame.width = subFrame.maxX-newFrame.x }
    if (subFrame.maxY > newFrame.maxY) { newFrame.height = subFrame.maxY-newFrame.y }
    return newFrame;
}

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
        group.lock = true;
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

        sliceFrame = expandFrame(sliceFrame, labelFrame);
        sliceFrame = expandFrame(sliceFrame, artboard.frame);
    });
    sliceFrame.inset(-exportPadding, -exportPadding);
    if (slice === undefined) {
        slice = group.newSlice({"name": sliceName});
    }
    slice.frame = sliceFrame;
    slice.moveToFront();

    group.adjustToFit();

    slice.select();    
}

// Commands

function main(context) {
    var sketch = context.api();
    var document = sketch.selectedDocument;
    var page = document.selectedPage;
    var labelOffset = 10, exportPadding = 10;
    exportPage(page, labelOffset, exportPadding);
}

// Tests

function testExpandFrame1(tester) {
    var sketch = context.api();
    var rect1 = new sketch.Rectangle();
    var rect2 = new sketch.Rectangle(0, 0, 100, 100);
    var expandedRect = expandFrame(rect1, rect2);
    tester.assertEqual(expandedRect.x, 0);
    tester.assertEqual(expandedRect.y, 0);
    tester.assertEqual(expandedRect.width, 100);
    tester.assertEqual(expandedRect.height, 100);    
}

function testExpandFrame2(tester) {
    var sketch = context.api();
    var rect1 = new sketch.Rectangle();
    var rect2 = new sketch.Rectangle(0, 0, 44, 100);
    var rect3 = new sketch.Rectangle(0, 0, 100, 44);
    var expandedRect = expandFrame(rect1, rect2);
    expandedRect = expandFrame(expandedRect, rect3);
    tester.assertEqual(expandedRect.x, 0);
    tester.assertEqual(expandedRect.y, 0);
    tester.assertEqual(expandedRect.width, 100);
    tester.assertEqual(expandedRect.height, 100);    
}

function testExpandFrameComplex(tester) {
    var sketch = context.api();
    var rect1 = new sketch.Rectangle(-100, -200, 10, 20);
    var rect2 = new sketch.Rectangle(0, 0, 44, 100);
    var rect3 = new sketch.Rectangle(200, 0, 100, 500);
    var expandedRect = expandFrame(rect1, rect2);
    expandedRect = expandFrame(expandedRect, rect3);
    tester.assertEqual(expandedRect.x, -100);
    tester.assertEqual(expandedRect.y, -200);
    tester.assertEqual(expandedRect.width, 400);
    tester.assertEqual(expandedRect.height, 700);    
}

var tests = {
    "suites" : {
        "Export Page": {
            "tests" : {
                testExpandFrame1,
                testExpandFrame2,
                testExpandFrameComplex
            }
        }
    }
}

function runTests() {
    log(context.api().tester.runUnitTests(tests));
}
// runTests()