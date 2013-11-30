(function(){
    
    'use strict';

    var qtek3d = qtek['3d'];
    var heroLoader = new qtek.loader.GLTF();

    var app = angular.module("heroViewer");

    // Create camera
    var camera = new qtek3d.camera.Perspective({
        aspect : window.innerWidth / window.innerHeight,
        far : 1000
    });
    camera.position.set(40, 10, 40);
    camera.lookAt(new qtek.core.Vector3(0, 8, 0));
    
    // Mouse control
    var control = new qtek3d.plugin.OrbitControl({
        target : camera,
        domElement : document.getElementById("ViewPort"),
        sensitivity : 0.4,
        minDistance : 40,
        maxDistance : 70,
        maxRollAngle : Math.PI / 4,
        minRollAngle : -0.1
    });
    control.enable();

    var shadowMapPass = new qtek3d.prePass.ShadowMap({
        useVSM : true
    });

    // Create scene
    var scene = new qtek3d.Scene();
    var heroRootNode = new qtek3d.Node();
    heroRootNode.rotation.rotateX(-Math.PI/2);
    heroRootNode.scale.set(0.1, 0.1, 0.1);
    scene.add(heroRootNode);
    var light = new qtek3d.light.Directional({
        intensity : 0.7,
        shadowCamera : {
            left : -25,
            right : 25,
            top : 25,
            bottom : -25,
            near : 0,
            far : 50,
        },
        shadowResolution : 512,
        shadowBias : 0.02
    });
    light.position.set(10, 20, 5);
    light.lookAt(new qtek.core.Vector3(0, 10, 0), new qtek.core.Vector3(0, 0, 1));

    scene.add(light);
    scene.add(new qtek3d.light.Ambient({
        intensity : 0.2
    }));

    var rockLoader = new qtek.loader.GLTF();
    var heroFragShader;
    var rockNode;
    rockLoader.on('load', function(_scene) {
        rockNode = _scene.childAt(0);
        rockNode.rotation.rotateX(-Math.PI/2);
        rockNode.position.set(-5, -3.2, 0);
        rockNode.scale.set(0.15, 0.15, 0.15);
         var mat = rockNode.childAt(0).material;
        var shader = mat.shader;
        shader.setFragment(heroFragShader);
        // reattach
        mat.attachShader(shader);
        shader.enableTexture('maskMap2');
        shader.enableTexture('diffuseMap');
        shader.define('vertex', 'IS_SPECULAR_MAP');
        var specularTexture = new qtek3d.texture.Texture2D();
        var diffuseTexture = new qtek3d.texture.Texture2D();
        specularTexture.load('assets/rock/textures/badside_rocks001_spec.png');
        diffuseTexture.load('assets/rock/textures/badside_rocks001.png');
        mat.set('maskMap2', specularTexture);
        mat.set('diffuseMap', diffuseTexture);

        rockNode.visible = false;
        scene.add(rockNode);
    });

    app.controller('hero', function(
        $scope, $http, $routeParams,
        renderer, SMDParser, getResourcePath, cache, animation, background, config
    ) {
        var heroName = $routeParams.name;
        if (!cache.has('overview')) {
            $http.get(getResourcePath('heroes/overview_cn.json'))
                .success(function(data) {
                    cache.set('overview', data);
                    $scope.heroList = data;
                    $scope.heroList.forEach(function(item) {
                        if (item.name === heroName) {
                            $scope.overview = item;
                        }
                    });
                });
        } else {
            $scope.heroList = cache.get('overview');
            $scope.heroList.forEach(function(item) {
                if (item.name === heroName) {
                    $scope.overview = item;
                }
            });
        }
        $scope.showAbout = function() {
            $("#About").toggleClass('show');
        }
        $scope.toggleSettings = function() {
            $("#Settings").sidebar('toggle');
        }
        $scope.resetView = function() {
            camera.position.set(40, 10, 40);
            camera.lookAt(new qtek.core.Vector3(0, 8, 0), new qtek.core.Vector3(0, 1, 0));
        }
        $scope.config = config;

        $scope.$watch('config.shadow', function(obj) {
            shadowMapPass.dispose(renderer);
            shadowMapPass.useVSM = obj.softShadow === 'vsm';
            light.shadowResolution = obj.resolution;
        }, true);

        if (rockNode) {
            rockNode.visible = true;
        } else {
            rockLoader.on('load', function() {
                rockNode.visible = true;
            });
        }

        var heroRootPath = "heroes/" + heroName + "/";
        var materials = {};

        if (heroRootNode) {
            renderer.disposeNode(heroRootNode);
        }
        $http.get(getResourcePath(heroRootPath + 'materials.json'))
        .then(function(result) {
            materials = result.data;
            return $http.get('assets/shaders/hero.essl');
        })
        .then(function(result) {
            heroFragShader = result.data;
            rockLoader.load('assets/rock/rock.json');
            return $http.get(getResourcePath(heroRootPath + heroName + ".json"));
        })
        .then(function(result) {
            var data = result.data;
            // replace path
            for (var name in data.buffers) {
                data.buffers[name].path = getResourcePath(
                    heroRootPath + data.buffers[name].path
                );
            }
            for (var name in data.images) {
                data.images[name].path = getResourcePath(
                    heroRootPath + data.images[name].path
                );
            }

            heroLoader.parse(data, function(_scene, cameras, skeleton) {
                var children = _scene.children();
                for (var i = 0; i < children.length; i++) {
                    heroRootNode.add(children[i]);
                }
                var meshes = [];
                heroRootNode.traverse(function(node) {
                    if (node.geometry) {
                        node.geometry = node.geometry.convertToGeometry();
                        node.geometry.generateTangents();
                        meshes.push(node);
                    }
                    if (node.material && heroFragShader) {
                        var mat = node.material;
                        var shader = mat.shader;
                        shader.setFragment(heroFragShader);
                        // reattach
                        mat.attachShader(shader);
                        shader.enableTexturesAll();
                        // shader.define('fragment', 'RENDER_TEXCOORD')
                    }
                });
                for (var name in materials) {
                    var params = materials[name];
                    var mat = qtek3d.Material.getMaterial(name);
                    var Texture2D = qtek3d.texture.Texture2D;
                    mat.shader.disableTexturesAll();
                    if (mat) {
                        ['diffuseMap', 'normalMap', 'maskMap1', 'maskMap2']
                            .forEach(function(name) {
                                if (params[name] !== undefined) {
                                    var texture = new Texture2D({
                                        wrapS : qtek3d.Texture.REPEAT,
                                        wrapT : qtek3d.Texture.REPEAT
                                    });
                                    texture.load(getResourcePath(params[name]));
                                    mat.set(name, texture);
                                    mat.shader.enableTexture(name);
                                }
                            });
                        ['u_SpecularExponent', 'u_SpecularScale', 'u_SpecularColor', 'u_RimLightScale', 'u_RimLightColor']
                            .forEach(function(name) {
                                if (params[name] !== undefined) {
                                    mat.set(name, params[name]);
                                }
                            });
                        if (params.transparent) {
                            mat.transparent = true;
                            mat.depthMask = false;
                        }
                    }
                }
                for (var i = 0; i < meshes.length; i++) {
                    var mesh = meshes[i];
                    var res = qtek3d.util.mesh.splitByJoints(mesh, 30, true);
                }

                var frame = 0;
                var frameLen = 0;
                animation.off('frame');
                animation.on('frame', function(deltaTime) {
                    var start = new Date().getTime();
                    // // 30fps
                    frame += deltaTime / 1000 * 30;
                    if (frameLen) {
                        skeleton.setPose(frame % frameLen);
                    }
                    if (config.shadow.enabled) {
                        shadowMapPass.render(renderer, scene);
                    }
                    background.render(renderer);
                    camera.aspect = renderer.canvas.width / renderer.canvas.height;
                    $scope.log = renderer.render(scene, camera);
                    var end = new Date().getTime();
                    $scope.log.frameTime = (end-start).toFixed(1) + 'ms';
                    $scope.log.fps = parseInt(1000 / deltaTime);
                });
                setInterval(function() {
                    $scope.$digest();
                }, 500);
                // Loading animations
                var joints = {};
                for (var i = 0; i < skeleton.joints.length; i++) {
                    joints[skeleton.joints[i].name] = skeleton.joints[i];
                }
                $http.get(getResourcePath(heroRootPath + 'animations.json'))
                    .success(function(animations) {
                        var defaultAnim = animations['default'] || animations['idle'][0];

                        $http.get(getResourcePath(defaultAnim.path))
                            .success(function(data) {
                                var frames = SMDParser(data);
                                for (var name in frames) {
                                    if (joints[name]) {
                                        joints[name].poses = frames[name];
                                        if (defaultAnim.frameLength) {
                                            frameLen = defaultAnim.frameLength;
                                        } else {
                                            frameLen = frames[name].length;
                                        }
                                    }
                                }
                            });
                    });
                // http://stackoverflow.com/questions/17039998/angular-not-making-http-requests-immediately
                // http://www.benlesh.com/2013/08/angularjs-watch-digest-and-apply-oh-my.html
                $scope.$digest();
            });
         });
    });
})();