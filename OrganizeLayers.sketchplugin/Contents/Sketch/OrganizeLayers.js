function moveForward(layer, amount) {
    for (var i = 0; i < amount; ++i) {
        layer.moveForward()
    }
}

function organizeLayers(prefix, layers) {
    var sortedLayers = [];
    layers.forEach(function(layer, index) {
        var insertIndex;
        sortedLayers.forEach(function(newLayer, newIndex) {
            if (layer.frame.y < newLayer.frame.y) {
                insertIndex = newIndex;
            }
        });
        if (insertIndex) {
            sortedLayers.splice(insertIndex, 0, layer);
        } else {
            sortedLayers.push(layer);
        }
    });

    var indexOffset = sortedLayers[0].index;
    sortedLayers.forEach(function(layer, index){
        layer.name = prefix+" "+(index+1);
        moveForward(layer, indexOffset-layer.index-index);
    });
}

// Commands

var onRun = function (context) {
    var sketch = context.api();
    var selection = sketch.selectedDocument.selectedLayers;
    if (selection.isEmpty) {
        sketch.message("Nothing selected; nothing to organize");
    } else {
        var prefix = sketch.getStringFromUser("Prefix name", "");
        organizeLayers(prefix, selection.nativeLayers);
    }
}

// Tests

// test x vs y axis
// test no prefix
// make sure order and naming is what we expect

function testOrganizeLayers1(tester) {
    var page = sketch.selectedDocument.selectedPage;
    var parent = page.newGroup();
    var prefix = "Table Row";

    var bottomLayer = parent.newGroup({"name":"Bottom Group"});
    var layer3 = parent.newGroup({"name":"Group 3", "frame": new Rectangle(0, 88, 100, 44)});
    var layer2 = parent.newGroup({"name":"Group 2", "frame": new Rectangle(0, 44, 100, 44)});
    var layer4 = parent.newGroup({"name":"Group 4", "frame": new Rectangle(0, 132, 100, 44)});
    var layer1 = parent.newGroup({"name":"Group 1", "frame": new Rectangle(0, 0, 100, 44)});
    var topLayer = parent.newGroup({"name":"Top Group"});
    
    organizeLayers(prefix, [layer1, layer2, layer3, layer4]);

    tester.assertEqual(topLayer.index, 5);

    tester.assertEqual(layer1.name, prefix+" 1");
    tester.assertEqual(layer1.index, 4);

    tester.assertEqual(layer2.name, prefix+" 2");
    tester.assertEqual(layer2.index, 3);

    tester.assertEqual(layer3.name, prefix+" 3");
    tester.assertEqual(layer3.index, 2);

    tester.assertEqual(layer4.name, prefix+" 4");
    tester.assertEqual(layer4.index, 1);

    tester.assertEqual(bottomLayer.index, 0);

    parent.remove();
}

var tests = {
    "suites" : {
        "OrganizeLayers": {
            "tests" : {
                testOrganizeLayers1
            }
        }
    }
}

function runTests() {
    log(sketch.tester.runUnitTests(tests));
}
