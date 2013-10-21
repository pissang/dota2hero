var glob = require('glob');
var path = require('path');
var spawn = require('child_process').spawn;
var fs = require('fs');
var vmt = require('./vmt');

var fixImagePath = true;
var updateAnimation = true;

function parseBaseName(path) {
    if (path.indexOf('/') >= 0) {
        var baseName = path.split(/\/+/).pop();
    } else {
        var baseName = path.split(/\\+/).pop();
    }
    // Remove ext
    baseName = baseName.split(".")[0];
    return baseName;
}

glob('heroes/*', function(err, pathList) {
    pathList = pathList.filter(function(path) {
        return path !== 'heroes/heroes.json' &&
                path !== 'heroes/overview_cn.json' &&
                path !== 'heroes/overview_en.json';
    })
    var heroesList = [];

    function convert(current) {
        var dir = pathList[current];
        var heroName = path.basename(dir);
        console.log("Converting " + heroName + "...");

        var matCandidates = [];
        glob(dir + '/textures/*.vmt', function(err, vmtList) {
            vmtList.forEach(function(vmtFile) {
                var res = vmt.parse(fs.readFileSync(vmtFile, 'utf-8'));
                if (res.CustomHero) {
                    // WTF
                    if (res.CustomHero.$basetexture) {
                        res.CustomHero.$baseTexture = res.CustomHero.$basetexture;
                    }
                    matCandidates.push(res.CustomHero);
                }
            });
            var py = spawn('python3.2', ['fbx2gltf.py', fbxPath]);
            py.on('close', afterCloseConvert);
        });

        // Converting fbx to gltf
        var fbxPath = dir + '/' + heroName + '.fbx';
        var py = spawn('python3.2', ['fbx2gltf.py', fbxPath]);

        var afterCloseConvert = function() {
            var gltfPath = dir + '/' + heroName + '.json';
            var gltfStr = fs.readFileSync(gltfPath, 'utf-8');
            var gltf = JSON.parse(gltfStr);

            var materials = {};
            for (var name in gltf.images) {
                var imagePath = gltf.images[name].path;
                gltf.images[name] = {
                    path : 'textures/' + parseBaseName(imagePath) + '.png'
                }
            }
            // find material file
            for (var matName in gltf.materials) {
                var values = gltf.materials[matName].instanceTechnique.values;
                var diffuseValue = values.filter(function(item) {
                    return item.parameter === 'diffuse';
                })[0];
                var diffuseTextureName = diffuseValue.value;
                try{
                    var diffuseTexture = gltf.textures[diffuseTextureName];
                    var imageName = diffuseTexture.source;
                    var imagePath = gltf.images[imageName].path;
                    if (imagePath.indexOf('/') >= 0) {
                        var baseName = imagePath.split(/\/+/).pop();
                    } else {
                        var baseName = imagePath.split(/\\+/).pop();
                    }
                    baseName = baseName.split(".")[0];
                    // Find the material;
                    var configs = matCandidates.filter(function(item) {
                        return parseBaseName(item.$baseTexture).toLowerCase() === baseName;
                    })[0];

                    var material = {};
                    if (configs) {
                        [
                            ['diffuseMap', '$baseTexture'],
                            ['normalMap', '$normalmap'],
                            ['maskMap1', '$masknmap1'],
                            ['maskMap2', '$maskmap2']
                        ].forEach(function(item) {
                            if (configs[item[1]] !== undefined) {
                                material[item[0]] = dir + '/textures/' +
                                    parseBaseName(configs[item[1]]).toLowerCase() + '.png';
                            }
                        });
                        [
                            ['u_SpecularExponent', '$SPECULAREXPONENT'], 
                            ['u_SpecularScale', '$SPECULARSCALE'], 
                            ['u_SpecularColor', '$SPECULARCOLOR'], 
                            ['u_RimLightScale', '$RIMLIGHTSCALE'],
                            ['u_RimLightColor', '$RIMLIGHTCOLOR']
                        ]
                        .forEach(function(item) {
                            if (configs[item[1]] !== undefined) {
                                material[item[0]] = configs[item[1]];
                            }
                        });
                    }
                    materials[matName] = material;
                } catch(e) {
                    console.warn("can't find diffuse texture " + diffuseTextureName);
                    console.warn(e);
                }
            }

            fs.writeFileSync(
                gltfPath,
                JSON.stringify(gltf, false, 4),
                'utf-8'
            );
            fs.writeFileSync(
                dir + "/" + "materials.json",
                JSON.stringify(materials, false, 4),
                'utf-8'
            );

            var defaultAnimation = '';
            glob(dir + '/smd/**.smd', function(err, smdFiles) {
                if (updateAnimation) {
                    var animations = {
                        idle : [],
                        attack : [],
                        run : []
                    }
                    smdFiles.forEach(function(file) {
                        var animName = path.basename(file).split('.')[0];
                        if (animName.toLowerCase().indexOf('idle') == 0) {
                            animations.idle.push({
                                name : animName,
                                path : file
                            });
                        } else if(animName.toLowerCase().indexOf('run') == 0) {
                            animations.run.push({
                                name : animName,
                                path : file
                            });
                        } else if(animName.toLowerCase().indexOf('attack') == 0) {
                            animations.attack.push({
                                name : animName,
                                path : file
                            })
                        }
                    });
                    fs.writeFileSync(
                        dir + '/animations.json',
                        JSON.stringify(animations, false, 4),
                        'utf-8'
                    );
                }

                heroesList.push({
                    name : heroName,
                    root : dir,
                    model : heroName + '.json',
                    fix : heroName + '_fix.json',
                    animations : 'animations.json'
                });

                if (current < pathList.length - 1) {
                    convert(current+1);
                } else {
                    fs.writeFileSync(
                        'heroes/heroes.json',
                        JSON.stringify(heroesList, false, 4),
                        'utf-8'
                    );
                }
            });
        };
    }
    convert(0);
});