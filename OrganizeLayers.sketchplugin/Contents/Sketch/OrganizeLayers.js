// TODO: improve plugin for selections that extend beyond groups

function layerName(prefix, count) {
    return prefix+" "+count;
}

function moveLayer(layer, amount) {
    if (amount < 0) {
        for (var i = 0; i < Math.abs(amount)-1; ++i) {
            layer.moveForward();
        }
    } else if (amount > 0) {
        for (var i = 0; i < amount; ++i) {
            layer.moveBackward();
        }
    }
}

function reorderLayers(layers, callback) {
    var indexStart = layers[layers.length-1].index;
    layers.forEach(function(layer, index) {
        var desiredIndex = index+indexStart;
        var moveAmount = layer.index-desiredIndex;
        moveLayer(layer, moveAmount);
        if (callback) { 
            callback(layer, index);
        }
    });
}

function sortLayers(layers) {
    var sortedLayers = [];
    layers.forEach(function(layer, index) {
        var insertIndex;
        sortedLayers.forEach(function(sortedLayer, sortedIndex) {
            if (insertIndex === undefined) {
                if (layer.frame.y < sortedLayer.frame.y) {
                    insertIndex = sortedIndex;
                } else if (layer.frame.x < sortedLayer.frame.x) {
                    insertIndex = sortedIndex;
                }
            }
        });
        if (insertIndex !== undefined) {
            sortedLayers.splice(insertIndex, 0, layer);
        } else {
            sortedLayers.push(layer);
        }
    });  
    return sortedLayers.reverse();
}

function organizeLayers(layers, prefix) {
    reorderLayers(sortLayers(layers), function(layer, index) {
        if (prefix.length > 0) {
            layer.name = layerName(prefix, layers.length-index);
        }
    });
}

// Commands

function main(context) {
    var sketch = context.api();
    var selection = sketch.selectedDocument.selectedLayers;
    if (selection.isEmpty) {
        sketch.message("Nothing selected; nothing to organize");
    } else {
        var prefix = sketch.getStringFromUser("Prefix name");
        organizeLayers(selection.layers, prefix.trim());
        sketch.message("Layers organized!");
    }
}

// Tests

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

    moveLayer(layer1, -2);

    tester.assertEqual(layer1.index, 2);
    tester.assertEqual(layer2.index, 1);
    tester.assertEqual(layer3.index, 0);

    parent.remove();
}

function testSortLayersVertically(tester) {
    var sketch = context.api();
    var page = sketch.selectedDocument.selectedPage;
    var parent = page.newGroup();

    var size = 100;
    var layers = [];
    var layer5 = parent.newGroup({"name": "Group 5", "frame": new sketch.Rectangle(size*4, 0, size, size)});
    layers.push(layer5);    
    var layer1 = parent.newGroup({"name": "Group 1", "frame": new sketch.Rectangle(size*0, 0, size, size)});
    layers.push(layer1);
    var layer4 = parent.newGroup({"name": "Group 4", "frame": new sketch.Rectangle(size*3, 0, size, size)});
    layers.push(layer4);
    var layer2 = parent.newGroup({"name": "Group 2", "frame": new sketch.Rectangle(size*1, 0, size, size)});
    layers.push(layer2);
    var layer3 = parent.newGroup({"name": "Group 3", "frame": new sketch.Rectangle(size*2, 0, size, size)});
    layers.push(layer3);

    var sortedLayers = sortLayers(layers);

    tester.assertEqual(sortedLayers[4], layer1);
    tester.assertEqual(sortedLayers[3], layer2);
    tester.assertEqual(sortedLayers[2], layer3);
    tester.assertEqual(sortedLayers[1], layer4);
    tester.assertEqual(sortedLayers[0], layer5);

    parent.remove();    
}

function testSortLayersHorizontally(tester) {
    var sketch = context.api();
    var page = sketch.selectedDocument.selectedPage;
    var parent = page.newGroup();

    var size = 100;
    var layers = [];
    var layer5 = parent.newGroup({"name": "Group 5", "frame": new sketch.Rectangle(0, size*4, size, size)});
    layers.push(layer5);    
    var layer1 = parent.newGroup({"name": "Group 1", "frame": new sketch.Rectangle(0, size*0, size, size)});
    layers.push(layer1);
    var layer4 = parent.newGroup({"name": "Group 4", "frame": new sketch.Rectangle(0, size*3, size, size)});
    layers.push(layer4);
    var layer2 = parent.newGroup({"name": "Group 2", "frame": new sketch.Rectangle(0, size*1, size, size)});
    layers.push(layer2);
    var layer3 = parent.newGroup({"name": "Group 3", "frame": new sketch.Rectangle(0, size*2, size, size)});
    layers.push(layer3);

    var sortedLayers = sortLayers(layers);

    tester.assertEqual(sortedLayers[4], layer1);
    tester.assertEqual(sortedLayers[3], layer2);
    tester.assertEqual(sortedLayers[2], layer3);
    tester.assertEqual(sortedLayers[1], layer4);
    tester.assertEqual(sortedLayers[0], layer5);

    parent.remove();    
}

function testReorderSimple2Layers(tester) {
    var sketch = context.api();
    var page = sketch.selectedDocument.selectedPage;
    var parent = page.newGroup();

    var layer1 = parent.newGroup({"name": "Group 1"});
    var layer2 = parent.newGroup({"name": "Group 2"});

    tester.assertEqual(layer2.index, 1);
    tester.assertEqual(layer1.index, 0);

    reorderLayers([layer2, layer1]);

    tester.assertEqual(layer1.index, 1);
    tester.assertEqual(layer2.index, 0);

    parent.remove();
}

function testReorderSimple3Layers(tester) {
    var sketch = context.api();
    var page = sketch.selectedDocument.selectedPage;
    var parent = page.newGroup();

    var layer1 = parent.newGroup({"name": "Group 1"});
    var layer2 = parent.newGroup({"name": "Group 2"});
    var layer3 = parent.newGroup({"name": "Group 3"});

    tester.assertEqual(layer3.index, 2);
    tester.assertEqual(layer2.index, 1);
    tester.assertEqual(layer1.index, 0);

    reorderLayers([layer3, layer2, layer1]);

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

// TODO: test no prefix
function testOrganizeLayers(tester) {
    var sketch = context.api();
    var parent = sketch.selectedDocument.selectedPage.newGroup();
    var prefix = "Table Row";

    var size = 100;
    var layers = [];
    var bottomLayer = parent.newGroup({"name": "Bottom Group"});
    var layer5 = parent.newGroup({"name": "Group 5", "frame": new sketch.Rectangle(0, size*4, size, size)});
    layers.push(layer5);    
    var layer1 = parent.newGroup({"name": "Group 1", "frame": new sketch.Rectangle(0, size*0, size, size)});
    layers.push(layer1);
    var layer4 = parent.newGroup({"name": "Group 4", "frame": new sketch.Rectangle(0, size*3, size, size)});
    layers.push(layer4);
    var layer2 = parent.newGroup({"name": "Group 2", "frame": new sketch.Rectangle(0, size*1, size, size)});
    layers.push(layer2);
    var layer3 = parent.newGroup({"name": "Group 3", "frame": new sketch.Rectangle(0, size*2, size, size)});
    layers.push(layer3);
    var topLayer = parent.newGroup({"name": "Top Group"});
    
    tester.assertEqual(topLayer.index, 6);
    tester.assertEqual(layer3.index, 5);
    tester.assertEqual(layer2.index, 4);
    tester.assertEqual(layer4.index, 3);
    tester.assertEqual(layer1.index, 2);
    tester.assertEqual(layer5.index, 1);   
    tester.assertEqual(bottomLayer.index, 0);

    organizeLayers(layers, prefix);

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

                testSortLayersVertically,
                testSortLayersHorizontally,

                testReorderSimple2Layers,
                testReorderSimple3Layers,
                testReorderAllLayers,
                testReorderSomeLayers,

                testOrganizeLayers
            }
        }
    }
}

function runTests() {
    log(context.api().tester.runUnitTests(tests));
}
// runTests()