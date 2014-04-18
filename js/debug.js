(function() {

    'use strict';

    var qtek3d = qtek['3d'];
    var heroViewer = heroViewer || {};

    var lineShader = new qtek3d.Shader({
        vertex : qtek3d.Shader.source("buildin.basic.vertex"),
        fragment : qtek3d.Shader.source("buildin.basic.fragment")
    });
    var createLine = function(pos, color) {
        var mat = new qtek3d.Material({
            shader : shader
        });
        mat.set("color", color);
        var lineGeo = new qtek3d.Geometry();
        var lineGeoVertices = lineGeo.attributes.position.value;
        lineGeoVertices.push([0, 0, 0], pos);

        return new qtek3d.Mesh({
            geometry : lineGeo,
            material : mat,
            mode : qtek3d.Mesh.LINES,
            lineWidth : 1
        });
    }
    /**
     * Debug Axis
     * @type {DebugAxis}
     */
    var DebugAxis = qtek3d.Node.derive({
        size : 10
    }, function() {
        this.add(createLine([this.size, 0, 0], [1, 0, 0]));
        this.add(createLine([0, this.size, 0], [0, 1, 0]));
        this.add(createLine([0, 0, this.size], [0, 0, 1]));
    });
    heroViewer.createDebugAxis = function(nodeList, size) {
        var root = new qtek3d.Node;
        nodeList.forEach(function(node) {
            var axis = new DebugAxis({
                size : size
            });
            axis.autoUpdateLocalTransform = false;
            node.on("afterupdate", function() {
                axis.localTransform.copy(node.worldTransform);
            });
            root.add(axis);
        });
        return root;
    }

    heroViewer.createDebugSkeleton = function(skeleton, linkNode, qtek) {
        var qtek3d = qtek['3d'];
        var root = new qtek3d.Node();
        var sphereGeo = new qtek3d.geometry.Sphere({
            radius : 2
        });
        var sphereMat = new qtek3d.Material({
            shader : new qtek3d.Shader({
                vertex : qtek3d.Shader.source("buildin.basic.vertex"),
                fragment : qtek3d.Shader.source("buildin.basic.fragment")
            })
        });
        sphereMat.set("color", [0.7, 0.7, 0.7]);

        var jointDebugSpheres = [];
        skeleton.joints.forEach(function(joint) {
            var parentJoint = skeleton.joints[joint.parentIndex];
            var sphere = new qtek3d.Mesh({
                geometry : sphereGeo,
                material : sphereMat,
                autoUpdateLocalTransform : false
            });
            root.add(sphere);

            var lineStart = new qtek.math.Vector3();
            var lineEnd = new qtek.math.Vector3();
            var lineGeo = new qtek3d.Geometry();
            var lineGeoVertices = lineGeo.attributes.position.value;
            lineGeoVertices.push(lineStart._array, lineEnd._array);
            var line = new qtek3d.Mesh({
                geometry : lineGeo,
                material : sphereMat,
                mode : qtek3d.Mesh.LINES,
                lineWidth : 2
            });
            root.add(line);

            joint.on("afterupdate", function() {
                var parentSphere = jointDebugSpheres[joint.parentIndex];
                sphere.localTransform.copy(linkNode.worldTransform).multiply(joint.worldTransform);
                if (parentSphere) {
                    sphere.getWorldPosition(lineStart);
                    parentSphere.getWorldPosition(lineEnd);
                }
                lineGeo.dirty('position');
            });
            jointDebugSpheres.push(sphere);
        });

        return root;
    }
})();