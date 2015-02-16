(function(){
    
    'use strict';

    var app = angular.module("heroViewer");
    
    function getResourcePath(path) {
        // if (path[0] !== '/') {
        //     path = '/' + path;
        // }
        // return 'server/proxy.php?path=' + path
        return path;
    }

    app.provider('getResourcePath', function() {
        this.$get = function() {
            return getResourcePath;
        }
    });

    app.provider('cache', function() {
        var cache = {};
        function get(key) {
            return cache[key];
        }
        function set(key, value) {
            cache[key] = value;
        }
        function has(key) {
            return cache.hasOwnProperty(key);
        }
        this.$get = function() {
            return {
                get : get,
                set : set,
                has : has
            }
        }
    });

    app.provider('renderer', function() {
        var renderer = new qtek.Renderer({
            canvas : document.getElementById("ViewPort")
        });
        renderer.resize(window.innerWidth, window.innerHeight);
        $(window).resize(function() {
            renderer.resize(window.innerWidth, window.innerHeight);
        });
        this.$get = function() {
            return renderer;
        }
    });

    app.provider('animation', function() {
        var animation = new qtek.animation.Animation();
        animation.start();
        this.$get = function() {
            return animation;
        }
    });

    app.config(function($routeProvider){
        $routeProvider
            .when("/heroes", {
                templateUrl : 'partials/heroList.html',
                controller : "heroList"
            })
            .when("/hero/:name", {
                templateUrl : 'partials/hero.html',
                controller : "hero"
            }).
            otherwise({
                redirectTo: '/heroes'
            });
    });

    // Sound
    var soundList = [
        'gamestartup1.mp3',
        'gamestartup2.mp3',
        'gamestartup3.mp3',
        'ui_underscore1.mp3',
        'world_map.mp3'
    ];
    var isPlay = true;
    var audio = document.createElement('audio');
    audio.addEventListener('ended', pick);
    audio.volume = 0.5;
    function pick() {
        audio.src = 'sounds/' + soundList[Math.floor(Math.random() * 5)];
        audio.play();
    }
    pick();

    $("#PlayPause").click(function() {
        isPlay 
            ? $(this).children('i').removeClass('pause').addClass('play')
            : $(this).children('i').removeClass('play').addClass('pause');
        isPlay ? audio.pause() : audio.play();
        isPlay = !isPlay;
    });

    $("#Shuffle").click(pick);
})();