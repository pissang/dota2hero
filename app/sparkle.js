(function() {

    'use strict';

    var Shader = qtek.Shader;
    var app = angular.module("heroViewer");

    function generateSprite(){
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
        gradient.addColorStop(0, 'rgba(255,239,179,1)');
        gradient.addColorStop(0.34, 'rgba(255,212,157,1)');
        gradient.addColorStop(0.7, 'rgba(130,55,55,0.51)');
        gradient.addColorStop(1.0, 'rgba(130,55,55,0.0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        return canvas;
    }

    var Value = qtek.math.Value;
    var Vector3 = qtek.math.Vector3;
    var particleSystem = new qtek.particleSystem.ParticleRenderable();
    var emitter = new qtek.particleSystem.Emitter({
        max : 5000,
        amount : 10,
        life : Value.constant(2),
        spriteSize : Value.constant(200 * window.devicePixelRatio || 1),
        position : Value.random3D(new Vector3(-100, -30, 50), new Vector3(100, -40, 90)),
        velocity : Value.random3D(new Vector3(-20, 0, -10), new Vector3(20, 20, 10))
    });
    particleSystem.addEmitter(emitter);
    particleSystem.material.set('color', [1, 1, 1]);
    particleSystem.material.shader.enableTexture('sprite');
    particleSystem.material.set('sprite', new qtek.Texture2D({
        image : generateSprite()
    }));

    var scene = new qtek.Scene();
    var camera = new qtek.camera.Perspective({
        aspect : window.innerWidth / window.innerHeight,
        far : 1000,
        near : 1
    });
    camera.position.set(0, 0, 120);
    scene.add(particleSystem);
    
    app.provider("sparkle", function() {
        var sparkle = {
            render : function(renderer, deltaTime) {
                particleSystem.updateParticles(deltaTime);
                camera.aspect = renderer.canvas.width / renderer.canvas.height;
                renderer.render(scene, camera);
            }
        };
        
        this.$get = function () {
            return sparkle;
        }
    });
})();