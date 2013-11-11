(function() {

    'use strict';

    var qtek3d = qtek['3d'];
    var Shader = qtek3d.Shader;
    var app = angular.module("heroViewer");

    var scene = new qtek3d.Scene();
    var camera = new qtek3d.camera.Perspective({
        aspect : window.innerWidth / window.innerHeight,
        far : 1000,
        near : 1
    });
    camera.position.set(0, 0, 120);

    var planeMesh = new qtek3d.Mesh({
        geometry : new qtek3d.geometry.Plane(),
        material : new qtek3d.Material({
            shader : qtek3d.shader.library.get('buildin.lambert')
        })
    });
    planeMesh.material.set('color', [0.3, 0, 0]);
    planeMesh.scale.set(10000, 10000, 1);
    scene.add(planeMesh);

    var light = new qtek3d.light.Point({
        range : 300
    });
    light.position.z = 50;
    light.position.y = -40;
    scene.add(light);
    
    app.provider("background", function() {
        var background = {
            render : function(renderer, deltaTime) {
                renderer.clear = qtek3d.Renderer.COLOR_BUFFER_BIT | qtek3d.Renderer.DEPTH_BUFFER_BIT;
                camera.aspect = renderer.canvas.width / renderer.canvas.height;
                renderer.render(scene, camera);
                renderer.clear = qtek3d.Renderer.DEPTH_BUFFER_BIT;
            }
        };
        
        this.$get = function () {
            return background;
        }
    });
})();