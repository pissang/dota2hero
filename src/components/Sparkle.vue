<template>
  <div id="sparkle">
    <canvas></canvas>
  </div>
</template>

<script>

import {
  application,
  Shader,
  particle as ps,
  Texture2D,
  Value,
  Vector3
} from 'claygl';

function generateSprite(){
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 60, 0, Math.PI * 2, false) ;
  ctx.closePath();

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0, size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, 'rgba(255,239,179,1)');
  gradient.addColorStop(0.34, 'rgba(255,212,157,1)');
  gradient.addColorStop(0.7, 'rgba(130,55,55,0.51)');
  gradient.addColorStop(1.0, 'rgba(130,55,55,0.0)');
  ctx.fillStyle = gradient;
  ctx.fill();

  return canvas;
}

export default {

  mounted() {
    application.create(this.$el.querySelector('canvas'), {
      init (app) {
        app.createCamera([0, 0, 120]);

        const particleRenderable = new ps.ParticleRenderable();
        const emitter = new ps.Emitter({
          max: 5000,
          amount: 10,
          life: Value.constant(2),
          spriteSize: Value.constant(200 * window.devicePixelRatio || 1),
          position: Value.random3D(new Vector3(-100, -30, 50), new Vector3(100, -40, 90)),
          velocity: Value.random3D(new Vector3(-20, 0, -10), new Vector3(20, 20, 10))
        });
        particleRenderable.addEmitter(emitter);
        particleRenderable.material.set('color', [1, 1, 1]);
        particleRenderable.material.set('sprite', new Texture2D({
          image: generateSprite()
        }));

        app.scene.add(particleRenderable);
      },

      loop (app) {
        particleRenderable.updateParticles(frameTime);
      }
    });
  }
}
</script>
