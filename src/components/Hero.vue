<template>
<div>
  <div id="viewport"></div>
  <div id="overview" v-if="heroDetail">
    <div class="portrait">
      <img :src="heroDetail.portrait" />
      <h2>{{ heroDetail.title }}</h2>
    </div>
    <div class="abilities">
      <ul>
        <li v-for="ability in heroDetail.abilities" :key="ability.name">
          <img :src="ability.icon" />
          <div class="ability-detail">
            <h4>{{ ability.title }}</h4>
            <p>{{ ability.detail }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div id="toolbar">
    <a class="mini ui black button icon" href="#/heroes" title="Back">
      <i class="icon grid layout"></i>
    </a>
    <div class="ui black mini button icon" @click="resetView()" title="Reset View">
      <i class="icon unhide"></i>
    </div>
    <div class="mini ui black button icon" @click="toggleSettings()" title="Settings">
      <i class="icon settings"></i>
    </div>
    <div class="mini ui black button icon" @click="showAbout()" title="About">
      <i class="icon info letter"></i>
    </div>
  </div>
  <!-- <div id="log">
    <div>FPS : {{log.fps}}</div>
    <div>Frame time : {{log.frameTime}}</div>
    <div>Vertices : {{log.vertexNumber}}</div>
    <div>Faces : {{log.faceNumber}}</div>
  </div> -->
  <div id="settings" class="ui right sidebar">
    <div class="ui label">Shadow Quality</div>
    <div id="ShadowQuality" dropdown class="ui labeled icon top right pointing dropdown purple mini button">
      <i class="dropdown icon"></i>
      <span class="text">High</span>
      <div class="menu">
        <div class="item">Low</div>
        <div class="item">High</div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import {
  application,
  plugin,
  Vector3,
  Shader,
  util,
  animation
} from 'claygl';
import readSMD from '../common/readSMD';
import glslCode from './hero.glsl';
import store from '../store';

Shader.import(glslCode);

const heroShader = new Shader(Shader.source('clay.standard.vertex'), Shader.source('hero.fragment'));
let app;

export default {
  name: 'Hero',

  data() {
    return store;
  },

  computed: {
    heroDetail() {
      return this.heroList.find(item => {
        return item.name === this.$route.params.heroName
      });
    }
  },

  methods: {
    resetView() {

    },
    toggleSettings() {

    },
    showAbout() {

    }
  },

  mounted() {

    const heroName = this.$route.params.heroName;

    app = application.create(this.$el.querySelector('#viewport'), {

      graphic: {
        shadow: true
      },

      init (app) {
        const camera = app.createCamera([40, 10, 40], [0, 8, 0]);

        app.createDirectionalLight([-10, -10, -5]);
        app.createAmbientLight('#fff', 0.2);

        this._control = new plugin.OrbitControl({
          domElement: app.container,
          target: camera
        });

        return Promise.all([
          this._loadRocks(app),
          this._loadHero(app, heroName),
          this._loadAnimation(app, heroName)
        ]).then(result => {
          for (let skeleton of this._modelResult.skeletons) {
            skeleton.addClip(this._currentClip);
            app.timeline.addClip(this._currentClip);
          }
        });
      },

      _loadRocks (app) {
        return app.loadModel('assets/rock/rocks.gltf').then(result => {
          let rockMaterial = app.createMaterial({
            shader: heroShader,
            diffuseMap: 'assets/rock/textures/badside_rocks001.png',
            maskMap2: 'assets/rock/textures/badside_rocks001_spec.png',
            textureFlipY: false
          });
          let rootNode = result.rootNode;
          rootNode.position.set(-5, 0, 0);
          rootNode.scale.set(0.15, 0.15, 0.15);

          for (let mesh of result.meshes) {
            mesh.geometry.generateTangents();
            mesh.material = rockMaterial;
          };
        });
      },

      _loadHero (app, heroName) {
        const heroRootPath = 'heroes/' + heroName + '/';
        return Promise.all([
          app.loadModel(heroRootPath + heroName + '.gltf'),
          fetch(heroRootPath + 'materials.json').then(response => response.json())
        ]).then(result => {
          const modelResult = result[0];
          const materialResult = result[1];

          modelResult.rootNode.scale.set(0.15, 0.15, 0.15);

          // Override the materials
          let newMaterials = {};
          for (let matName in materialResult) {
            let matConfig = Object.assign({
              shader: heroShader,
              textureFlipY: false
            }, materialResult[matName]);
            let newMat = app.createMaterial(matConfig);
            newMaterials[matName] = newMat;
          }
          for (let mesh of modelResult.meshes) {
            mesh.geometry.generateTangents();
            mesh.material = newMaterials[mesh.material.name];
            util.mesh.splitByJoints(mesh, 30, true);
            // mesh.material.define('fragment', 'RENDER_NORMAL');
          }

          this._modelResult = modelResult;
        });
      },

      _loadAnimation (app, heroName) {
        const heroRootPath = 'heroes/' + heroName + '/';
        return fetch(heroRootPath + 'animations.json')
          .then(response => response.json())
          .then(animations => {
            let defaultAnim = animations['default'] || animations['idle'][0];
            return this._loadAnimationClip(app, defaultAnim.path);
          });
      },

      _loadAnimationClip (app, animationPath) {
        return fetch(animationPath)
          .then(response => response.text())
          .then(smdData => {
            const clip = readSMD(smdData);
            this._currentClip = clip;
            return clip;
          });
      },

      loop(app) {
        this._control.update(app.frameTime);
      }
    });
  },

  destroyed() {
    if (app) {
      app.dispose();
      app = null;
    }
  }
}
</script>


<style lang="scss">
#overview {
  color: #D9D9D9;
  width: 200px;
  margin: 20px;
  text-align: center;
  position: absolute;
  z-index: 1;
  .portrait {
    img {
      width: 200px;
      box-shadow: 0 0 10px #000;
    }
    h2 {
      font-size: 18px;
    }
  }

  .abilities {
    li {
      cursor: pointer;
      margin: 10px;
      float: left;
      position: relative;
      img {
        width: 60px;
        float: left;
        margin:5px;
        border-radius: 5px;
        border: 4px solid #757890;
      }
      .ability-detail {
        position: absolute;
        text-align: left;
        left: 75px;
        width: 150px;
        background-color: rgba(0, 0, 0, 0.7);
        padding: 20px;
        display: none;
        z-index: 10;

        h4 {
          margin:2px;
        }
      }

      &:hover {
        .ability-detail {
          display: block;
        }
      }
    }
  }
}

#log {
  position: absolute;
  z-index: 100;
  right:50px;
  top: 60px;
  color:white;
  width:200px;

  text-align: right;
  line-height: 20px;
  font-size: 14px;
}

#settings {
  background-color: #300808;
  box-shadow: inset 0 0 30px #000;
  padding-top: 20px;

  .label {
    margin:3px 20px;
    padding:1px;
    background:none;
    color: white;
  }
  .button {
    margin:10px;
    display: block;
    text-align: left;
    font-size: 12px;
  }

  width:200px!important;
  &.active{
    margin-left: -200px!important;
  }
}

#viewport {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

</style>
