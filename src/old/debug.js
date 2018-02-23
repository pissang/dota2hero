import { Shader, Material, Geometry, Mesh, geometry } from 'claygl';

'use strict';

var lineShader = new Shader({
    vertex: Shader.source('buildin.basic.vertex'),
    fragment: Shader.source('buildin.basic.fragment')
});
var createLine = function(pos, color) {
    var mat = new Material({
        shader: lineShader
    });
    mat.set('color', color);
    var lineGeo = new Geometry();
    var lineGeoVertices = lineGeo.attributes.position.value;
    lineGeoVertices.push([0, 0, 0], pos);

    return new Mesh({
        geometry: lineGeo,
        material: mat,
        mode: Mesh.LINES,
        lineWidth: 1
    });
};
/**
 * Debug Axis
 * @type {DebugAxis}
 */
var DebugAxis = Node.derive(
    {
        size: 10
    },
    function() {
        this.add(createLine([this.size, 0, 0], [1, 0, 0]));
        this.add(createLine([0, this.size, 0], [0, 1, 0]));
        this.add(createLine([0, 0, this.size], [0, 0, 1]));
    }
);
heroViewer.createDebugAxis = function(nodeList, size) {
    var root = new Node();
    nodeList.forEach(function(node) {
        var axis = new DebugAxis({
            size: size
        });
        axis.autoUpdateLocalTransform = false;
        node.on('afterupdate', function() {
            axis.localTransform.copy(node.worldTransform);
        });
        root.add(axis);
    });
    return root;
};

heroViewer.createDebugSkeleton = function(skeleton, linkNode, qtek) {
    var qtek3d = qtek['3d'];
    var root = new Node();
    var sphereGeo = new geometry.Sphere({
        radius: 2
    });
    var sphereMat = new Material({
        shader: new Shader({
            vertex: Shader.source('buildin.basic.vertex'),
            fragment: Shader.source('buildin.basic.fragment')
        })
    });
    sphereMat.set('color', [0.7, 0.7, 0.7]);

    var jointDebugSpheres = [];
    skeleton.joints.forEach(function(joint) {
        var parentJoint = skeleton.joints[joint.parentIndex];
        var sphere = new Mesh({
            geometry: sphereGeo,
            material: sphereMat,
            autoUpdateLocalTransform: false
        });
        root.add(sphere);

        var lineStart = new qtek.math.Vector3();
        var lineEnd = new qtek.math.Vector3();
        var lineGeo = new Geometry();
        var lineGeoVertices = lineGeo.attributes.position.value;
        lineGeoVertices.push(lineStart._array, lineEnd._array);
        var line = new Mesh({
            geometry: lineGeo,
            material: sphereMat,
            mode: Mesh.LINES,
            lineWidth: 2
        });
        root.add(line);

        joint.on('afterupdate', function() {
            var parentSphere = jointDebugSpheres[joint.parentIndex];
            sphere.localTransform
                .copy(linkNode.worldTransform)
                .multiply(joint.worldTransform);
            if (parentSphere) {
                sphere.getWorldPosition(lineStart);
                parentSphere.getWorldPosition(lineEnd);
            }
            lineGeo.dirty('position');
        });
        jointDebugSpheres.push(sphere);
    });

    return root;
};
