(function(){
    
    'use strict';

    var qtek3d = qtek['3d'];
    var heroLoader = new qtek.loader.GLTF();
    var animation = new qtek.animation.Animation();
    animation.start();

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
        camera : camera,
        canvas : document.getElementById("ViewPort"),
        sensitivity : 0.4
    });
    control.enable();

    var shadowMapPass = new qtek3d.prepass.ShadowMap();

    // Create scene
    var scene = new qtek3d.Scene();
    var heroRootNode = new qtek3d.Node();
    heroRootNode.rotation.rotateX(-Math.PI/2);
    heroRootNode.scale.set(0.1, 0.1, 0.1);
    scene.add(heroRootNode);
    var light = new qtek3d.light.Directional({
        intensity : 0.6,
        shadowCamera : {
            left : -25,
            right : 25,
            top : 25,
            bottom : -25,
            near : 0,
            far : 50,
        },
        shadowResolution : 1024,
        shadowBias : 0.02
    });
    light.position.set(10, 20, 5);
    light.lookAt(new qtek.core.Vector3(0, 10, 0), new qtek.core.Vector3(0, 0, 1));

    scene.add(light);
    scene.add(new qtek3d.light.Ambient({
        intensity : 0.2
    }));

    var rockLoader = new qtek.loader.GLTF();
    var rockNode;
    rockLoader.load('assets/rock/rock.json');
    rockLoader.on('load', function(_scene) {
        rockNode = _scene.childAt(0);
        rockNode.rotation.rotateX(-Math.PI/2);
        rockNode.position.set(-5, -3.2, 0);
        rockNode.scale.set(0.15, 0.15, 0.15);
        // rockNode.childAt(0).material.shader.disableTexture('diffuseMap');
        rockNode.visible = false;
        scene.add(rockNode);
    });

    app.controller('hero', function(
        $scope, $http, $routeParams,
        renderer, SMDParser, getResourcePath, cache
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
        if (rockNode) {
            rockNode.visible = true;
        } else {
            rockLoader.on('load', function() {
                rockNode.visible = true;
            });
        }

        var heroRootPath = "heroes/" + heroName + "/";
        var materials = {};
        var heroFragShader;

        $http.get(getResourcePath(heroRootPath + 'materials.json'))
        .then(function(result) {
            materials = result.data;
            return $http.get('assets/shaders/hero.essl');
        })
        .then(function(result) {
            heroFragShader = result.data;
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
                if (heroRootNode) {
                    renderer.disposeNode(heroRootNode);
                }
                var children = _scene.children();
                for (var i = 0; i < children.length; i++) {
                    heroRootNode.add(children[i]);
                }

                heroRootNode.traverse(function(node) {
                    if (node.geometry) {
                        node.geometry = node.geometry.convertToGeometry();
                        node.geometry.generateTangents();
                    }
                    if (node.material && heroFragShader) {
                        var mat = node.material;
                        var shader = mat.shader;
                        shader.setFragment(heroFragShader);
                        // reattach
                        mat.attachShader(shader);
                        shader.enableTexturesAll();
                        // shader.define('fragment', 'RENDER_SPECULAR_INTENSITY');
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
                                    texture.load(params[name]);
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
                    }
                }

                var frame = 0;
                var frameLen = 0;
                animation.onframe = function(deltaTime) {
                    // 30fps
                    frame += deltaTime / 1000 * 30;
                    if (frameLen) {
                        skeleton.setPose(frame % frameLen);
                    }
                    shadowMapPass.render(renderer, scene);
                    renderer.render(scene, camera);
                }
                // Loading animations
                var joints = {};
                for (var i = 0; i < skeleton.joints.length; i++) {
                    joints[skeleton.joints[i].name] = skeleton.joints[i];
                }
                $http.get(getResourcePath(heroRootPath + 'animations.json'))
                    .success(function(animations) {
                        var idleAnimPath = animations.idle[0].path;

                        $http.get(getResourcePath(idleAnimPath))
                            .success(function(data) {
                                var frames = SMDParser(data);
                                for (var name in frames) {
                                    joints[name].poses = frames[name];
                                    frameLen = frames[name].length;
                                }
                            });
                    });
                // http://stackoverflow.com/questions/17039998/angular-not-making-http-requests-immediately
                $scope.$apply();
            })
         });
    });
})();