function moveLayer(layer, amount) {
    if (amount < 0) {
        for (var i = 0; i < Math.abs(amount); ++i) {
            layer.moveForward();
        }
    } else if (amount > 0) {
        for (var i = 0; i < amount; ++i) {
            layer.moveBackward();
        }
    }
}

function layerName(prefix, count) {
    return prefix+" "+count;
}

function reorderLayers(layers, callback) {
    var indexOffset = layers[0].index;
    layers.forEach(function(layer, index) {
        // TODO: don't move beyond the image offset
        var moveOffset = layer.index-index-indexOffset;
        moveLayer(layer, moveOffset);
        if (callback) { 
            callback(layer, index);
        }
    });
}

// TODO: test this method
function sortLayers(layers) {
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
    return sortedLayers;
}

function organizeLayers(prefix, layers) {
    reorderLayers(sortLayers(layers), function(layer, index) {
        layer.name = layerName(prefix, index+1);
    });
}

// Commands

function main(context) {
    var sketch = context.api();
    var selection = sketch.selectedDocument.selectedLayers;
    if (selection.isEmpty) {
        sketch.message("Nothing selected; nothing to organize");
    } else {
        var prefix = sketch.getStringFromUser("Prefix name", "");
        organizeLayers(prefix, selection.nativeLayers);
    }
    sketch.message("Layers organized!");
}

// Tests

// test x vs y axis
// test no prefix
// make sure order and naming is what we expect

function testLayerName(tester) {
    tester.assertEqual(layerName("Layer", 1), "Layer 1");
    tester.assertEqual(layerName("Table Row", 12), "Table Row 12");
    tester.assertEqual(layerName("Cell", 123), "Cell 123");
}

function testMoveLayer(tester) {
    var sketch = context.api();
    var page = sketch.selectedDocument.selectedPage;
    var parent = page.newGroup();

    var layer1 = parent.newGroup({"name": "Group 1"});
    var layer2 = parent.newGroup({"name": "Group 2"});
    var layer3 = parent.newGroup({"name": "Group 3"});

    tester.assertEqual(layer3.index, 2);
    tester.assertEqual(layer2.index, 1);
    tester.assertEqual(layer1.index, 0);

    moveLayer(layer3, 2);

    tester.assertEqual(layer2.index, 2);
    tester.assertEqual(layer1.index, 1);
    tester.assertEqual(layer3.index, 0);

    moveLayer(layer1, -1);

    tester.assertEqual(layer1.index, 2);
    tester.assertEqual(layer2.index, 1);
    tester.assertEqual(layer3.index, 0);

    parent.remove();
}

function testReorderAllLayers(tester) {
    var sketch = context.api();
    var page = sketch.selectedDocument.selectedPage;
    var parent = page.newGroup();

    var layer1 = parent.newGroup({"name": "Group 1"});
    var layer2 = parent.newGroup({"name": "Group 2"});
    var layer3 = parent.newGroup({"name": "Group 3"});
    var layer4 = parent.newGroup({"name": "Group 4"});
    var layer5 = parent.newGroup({"name": "Group 5"});

    tester.assertEqual(layer5.index, 4);
    tester.assertEqual(layer4.index, 3);
    tester.assertEqual(layer3.index, 2);
    tester.assertEqual(layer2.index, 1);
    tester.assertEqual(layer1.index, 0);

    reorderLayers([layer5, layer4, layer3, layer2, layer1]);

    tester.assertEqual(layer1.index, 4);
    tester.assertEqual(layer2.index, 3);
    tester.assertEqual(layer3.index, 2);
    tester.assertEqual(layer4.index, 1);
    tester.assertEqual(layer5.index, 0);

    parent.remove();
}

function testReorderSomeLayers(tester) {
    var sketch = context.api();
    var page = sketch.selectedDocument.selectedPage;
    var parent = page.newGroup();

    var layer1 = parent.newGroup({"name": "Group 1"});
    var layer2 = parent.newGroup({"name": "Group 2"});
    var layer3 = parent.newGroup({"name": "Group 3"});
    var layer4 = parent.newGroup({"name": "Group 4"});
    var layer5 = parent.newGroup({"name": "Group 5"});

    tester.assertEqual(layer5.index, 4);
    tester.assertEqual(layer4.index, 3);
    tester.assertEqual(layer3.index, 2);
    tester.assertEqual(layer2.index, 1);
    tester.assertEqual(layer1.index, 0);

    reorderLayers([layer4, layer3, layer2]);

    tester.assertEqual(layer5.index, 4);
    tester.assertEqual(layer2.index, 3);
    tester.assertEqual(layer3.index, 2);
    tester.assertEqual(layer4.index, 1);
    tester.assertEqual(layer1.index, 0);

    parent.remove();
}

function testOrganizeLayers(tester) {
    var sketch = context.api();
    var parent = sketch.selectedDocument.selectedPage.newGroup();
    var prefix = "Table Row";

    var layers = [];
    var bottomLayer = parent.newGroup({"name": "Bottom Group"});
    var layer5 = parent.newGroup({"name": "Group 5", "frame": new Rectangle(0, 176, 100, 44)});
    layers.push(layer5);    
    var layer1 = parent.newGroup({"name": "Group 1", "frame": new Rectangle(0, 0, 100, 44)});
    layers.push(layer1);
    var layer4 = parent.newGroup({"name": "Group 4", "frame": new Rectangle(0, 132, 100, 44)});
    layers.push(layer4);
    var layer2 = parent.newGroup({"name": "Group 2", "frame": new Rectangle(0, 44, 100, 44)});
    layers.push(layer2);
    var layer3 = parent.newGroup({"name": "Group 3", "frame": new Rectangle(0, 88, 100, 44)});
    layers.push(layer3);
    var topLayer = parent.newGroup({"name": "Top Group"});
    
    tester.assertEqual(topLayer.index, 6); 
    tester.assertEqual(layer3.index, 5);
    tester.assertEqual(layer2.index, 4);
    tester.assertEqual(layer4.index, 3);
    tester.assertEqual(layer1.index, 2);
    tester.assertEqual(layer5.index, 1);   
    tester.assertEqual(bottomLayer.index, 0);

    organizeLayers(prefix, layers);

    tester.assertEqual(topLayer.index, 6);

    tester.assertEqual(layer1.name, layerName(prefix, 1));
    tester.assertEqual(layer1.index, 5);

    tester.assertEqual(layer2.name, layerName(prefix, 2));
    tester.assertEqual(layer2.index, 4);

    tester.assertEqual(layer3.name, layerName(prefix, 3));
    tester.assertEqual(layer3.index, 3);

    tester.assertEqual(layer4.name, layerName(prefix, 4));
    tester.assertEqual(layer4.index, 2);

    tester.assertEqual(layer5.name, layerName(prefix, 5));
    tester.assertEqual(layer5.index, 1);    

    tester.assertEqual(bottomLayer.index, 0);

    parent.remove();
}

var tests = {
    "suites" : {
        "OrganizeLayers": {
            "tests" : {
                testLayerName,
                testMoveLayer,
                testReorderAllLayers,
                testReorderSomeLayers,
                //testOrganizeLayers
            }
        }
    }
}

function runTests() {
    log(context.api().tester.runUnitTests(tests));
}
runTests()