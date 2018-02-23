var glob = require('glob');
var path = require('path');
var spawn = require('child_process').spawn;
var fs = require('fs');
var vmt = require('./vmt');
process.chdir('../');

var hero = process.argv[2] || '';
var pattern = hero ? ('heroes/' + hero): ('heroes/*');

var animationPrefix = {
  'razor': 'razor',
  'pudge': 'pudge',
  'phantom_assassin': 'phantom_assassin',
  'rubick': 'rubick',
  'sand_king': 'sand_king',
  'luna': 'luna',
  'siren': 'siren',
  'skywrath_mage': 'skywrath_mage',
  'sniper': 'sniper',
  'troll_warlord': 'tw',
  'undying': 'undying',
  'visage': 'visage',
  'warlock': 'warlock',
  'witchdoctor': 'witchdoctor',
  'tiny_01': 'tiny_1',
  'tiny_02': 'tiny_02',
  'tiny_03': 'tiny_03',
  'tiny_04': 'tiny_04',
  'nevermore': 'nevermore',
  'zuus': 'zuus'
};

var defaultAnimation = {
  'puck': 'portrait',
  'nerubian_assassin': 'idleMix3',
  'lich': 'run',
  'leshrac': 'idlePawGround',
  'shredder': 'portrait',
  'treant_protector': 'idle_allt_shake',
  'bane': 'run_alt',
  'zuus': 'idle_aggro',
  'sand_king': 'run',
  'sniper': 'run',
  'troll_warlord': 'idle_melee_alt'
};

var transparentMat = {
  'treant_protector': ['Material #57'],
  'ogre_magi': ['ogre_magi_cape'],
  'medusa': ['Material #90'],
  'enchantress': ['Material #57'],
  'abaddon': ['Material #118', 'Material #129']
};

function parseBaseName(path) {
  var baseName;
  if (path.indexOf('/') >= 0) {
    baseName = path.split(/\/+/).pop();
  }
  else {
    baseName = path.split(/\\+/).pop();
  }
  // Remove ext
  baseName = baseName.split('.')[0];
  return baseName;
}

glob(pattern, function (err, pathList) {
  pathList = pathList.filter(function (path) {
    return path !== 'heroes/heroes.json' &&
      path !== 'heroes/overview_cn.json' &&
      path !== 'heroes/overview_en.json';
  });
  var heroesList = [];

  function convert(current) {
    var dir = pathList[current];
    var heroName = path.basename(dir);
    console.log('Converting ' + heroName + '...');

    var matCandidates = [];
    glob(dir + '/textures/*.vmt', function (err, vmtList) {
      vmtList.forEach(function (vmtFile) {
        var res = vmt.parse(fs.readFileSync(vmtFile, 'utf-8'));
        if (res.customhero) {
          matCandidates.push(res.customhero);
        }
      });
      // Converting fbx to gltf
      var fbxPath = dir + '/' + heroName + '.FBX';
      var py = spawn('python3.3', ['../claygl/tools/fbx2gltf.py', fbxPath]);
      py.on('close', afterCloseConvert);
      py.stdout.setEncoding('utf-8');
      py.stderr.setEncoding('utf-8');
      py.stderr.on('data', function (data) {
        console.error(data);
      });
      py.stdout.on('data', function (data) {
        console.log(data);
      });
    });

    var afterCloseConvert = function () {
      if (fs.existsSync(dir + '/' + heroName + '.json')) {
        fs.unlinkSync(dir + '/' + heroName + '.json');
      }

      var gltfPath = dir + '/' + heroName + '.gltf';
      var gltfStr = fs.readFileSync(gltfPath, 'utf-8');
      var gltf = JSON.parse(gltfStr);

      var materials = {};
      var imagePath;
      var baseName;

      gltf.images.forEach(function (image) {
        imagePath = image.uri;
        image.uri = 'textures/' + parseBaseName(imagePath) + '.png';
      });
      // find material file
      gltf.materials.forEach(function (gltfMat) {
        var matName = gltfMat.name;
        try {
          var diffuseTextureIndex = gltfMat.pbrMetallicRoughness.baseColorTexture.index;
          var diffuseTexture = gltf.textures[diffuseTextureIndex];
          var imageName = diffuseTexture.source;
          imagePath = gltf.images[imageName].uri;
          if (imagePath.indexOf('/') >= 0) {
            baseName = imagePath.split(/\/+/).pop();
          }
          else {
            baseName = imagePath.split(/\\+/).pop();
          }
          baseName = baseName.split('.')[0];
          // Find the material;
          var configs = matCandidates.filter(function (item) {
            return parseBaseName(item.$basetexture).toLowerCase() === baseName;
          })[0];

          var material = {};
          if (configs) {
            [
              ['diffuseMap', '$basetexture'],
              ['normalMap', '$normalmap'],
              ['maskMap1', '$maskmap1'],
              ['maskMap2', '$maskmap2']
            ].forEach(function (item) {
              if (configs[item[1]] !== undefined) {
                material[item[0]] = dir + '/textures/' +
                  parseBaseName(configs[item[1]]).toLowerCase() + '.png';
              }
            });
            [
              ['u_SpecularExponent', '$specularexponent'],
              ['u_SpecularScale', '$specularscale'],
              ['u_SpecularColor', '$specularcolor'],
              ['u_RimLightScale', '$rimlightscale'],
              ['u_RimLightColor', '$rimlightcolor']
            ]
            .forEach(function (item) {
              if (configs[item[1]] !== undefined) {
                material[item[0]] = configs[item[1]];
              }
            });
            if (transparentMat[heroName]) {
              for (var i = 0; i < transparentMat[heroName].length; i++) {
                if (transparentMat[heroName][i] === matName) {
                  material.transparent = true;
                }
              }
            }
          }

          materials[matName] = material;
        }
        catch(e) {
          console.warn('can\'t find diffuse texture ');
          console.warn(e);
        }
      });

      fs.writeFileSync(
        gltfPath,
        JSON.stringify(gltf, false, 4),
        'utf-8'
      );
      fs.writeFileSync(
        dir + '/' + 'materials.json',
        JSON.stringify(materials, false, 4),
        'utf-8'
      );

      glob(dir + '/smd/**.smd', function (err, smdFiles) {
        var animations = {
          idle: [],
          attack: [],
          run: [],
          'default': null
        };
        smdFiles.forEach(function (file) {
          var animName = path.basename(file).split('.')[0];
          if (animationPrefix[heroName]) {
            animName = animName.substr((animationPrefix[heroName] + '-').length);
          }
          var anim = {
            name: animName,
            path: file
          };
          if (animName.toLowerCase().startsWith('idle')) {
            animations.idle.push(anim);
          }
          else if(animName.toLowerCase().startsWith('run')) {
            animations.run.push(anim);
          }
          else if(animName.toLowerCase().startsWith('attack')) {
            animations.attack.push(anim);
          }
          if (defaultAnimation[heroName]
            && animName === defaultAnimation[heroName]
          ) {
            animations.default = anim;
          }
        });
        if (!animations['default']) {
          animations['default'] = animations.idle[0];
        }
        fs.writeFileSync(
          dir + '/animations.json',
          JSON.stringify(animations, false, 4),
          'utf-8'
        );

        heroesList.push({
          name: heroName,
          root: dir,
          model: heroName + '.gltf',
          animations: 'animations.json'
        });

        if (current < pathList.length - 1) {
          convert(current+1);
        }
        else {
          // fs.writeFileSync(
          //     'heroes/heroes.json',
          //     JSON.stringify(heroesList, false, 4),
          //     'utf-8'
          // );
        }
      });
    };
  }
  convert(0);
});