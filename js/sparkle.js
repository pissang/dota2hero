(function() {

    'use strict';

    var qtek3d = qtek['3d'];
    var app = angular.module("heroViewer");
    var SIZE = 32;

    function generateSprite(color){
        var size = 128;

        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(size/2, size/2, 60, 0, Math.PI * 2, false) ;
        ctx.closePath();

        ctx.restore();
        var gradient = ctx.createRadialGradient(
            size/2, size/2, 0, size/2, size/2, size/2
        );
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0.0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        return canvas;
    }
    
    var compositor;
    var scene = new qtek3d.Scene();
    var camera = new qtek3d.camera.Perspective({
        aspect : window.innerWidth / window.innerHeight
    });
    camera.position.z = 1;

    var updatePositionNode;
    var fxLoader = new qtek.loader.FX();
    fxLoader.load('assets/fx/sparkle.json');
    fxLoader.on('load', function(_compositor) {
        compositor = _compositor;
        updatePositionNode = compositor.findNode('updatePosition');

        // // Scene
        // var geo = new qtek3d.Geometry();
        // for (var i = 0; i < SIZE; i++) {
        //     for (var j = 0; j < SIZE; j++) {
        //         geo.attributes.position.value.push([i / SIZE, j / SIZE, 0]);
        //     }
        // }
        // var mat = new qtek3d.Material({
        //     shader : new qtek3d.Shader({
        //         vertex : Shader.source("sparkle.vertex"),
        //         fragment : Shader.source("sparkle.fragment")
        //     }),
        //     transparent : true,
        //     depthTest : false,
        //     blend : function(_gl){
        //         _gl.blendEquation(_gl.FUNC_ADD);
        //         _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE);
        //     }
        // });
        // var spiritTexture = new qtek3d.texture.Texture2D();
        // spiritTexture.image = generateSprite();
        // mat.set("spiritTexture", spiritTexture);
        // mat.set("color", [0.5, 0.3, 0.1]);

        // var particleSystem = new qtek3d.Mesh({
        //     geometry : geo,
        //     material : mat,
        //     mode : qtek3d.Mesh.POINTS
        // });
        // scene.add(particleSystem);
    });

    app.provider("sparkle", function() {
        var sparkle = {
            render : function(renderer, deltaTime) {
                if (compositor) {
                    updatePositionNode.setParameter('deltaTime', deltaTime);
                    // compositor.render(renderer);
                    // renderer.render(scene, )
                }
            }
        };
        
        this.$get = function () {
            return sparkle;
        }
    });
})();