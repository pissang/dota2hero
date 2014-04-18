(function() {

    'use strict';

    var Shader = qtek.Shader;
    var app = angular.module("heroViewer");

    var scene = new qtek.Scene();
    var camera = new qtek.camera.Perspective({
        aspect : window.innerWidth / window.innerHeight,
        far : 1000,
        near : 1
    });
    camera.position.set(0, 0, 120);

    var planeMesh = new qtek.Mesh({
        geometry : new qtek.geometry.Plane(),
        material : new qtek.Material({
            shader : qtek.shader.library.get('buildin.lambert')
        })
    });
    planeMesh.material.set('color', [0.3, 0, 0]);
    planeMesh.scale.set(10000, 10000, 1);
    scene.add(planeMesh);

    var light = new qtek.light.Point({
        range : 300
    });
    light.position.z = 50;
    light.position.y = -40;
    scene.add(light);
    
    app.provider("background", function() {
        var background = {
            render : function(renderer, deltaTime) {
                renderer.clear = qtek.Renderer.COLOR_BUFFER_BIT | qtek.Renderer.DEPTH_BUFFER_BIT;
                camera.aspect = renderer.canvas.width / renderer.canvas.height;
                renderer.render(scene, camera);
                renderer.clear = qtek.Renderer.DEPTH_BUFFER_BIT;
            }
        };
        
        this.$get = function () {
            return background;
        }
    });
})();