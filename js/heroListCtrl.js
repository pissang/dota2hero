(function(){
    
    'use strict';

    var app = angular.module("heroViewer");
    var loader = new qtek.loader.GLTF();
    
    app.controller('heroList', function(
        $scope, $http, getResourcePath, cache, sparkle, renderer, animation
    ) {
        if (!cache.has('overview')) {
            $http.get(getResourcePath('heroes/overview_cn.json'))
                .success(function(data) {
                    cache.set('overview', data);
                    $scope.heroList = data;
                });
        } else {
            $scope.heroList = cache.get('overview');
        }
        animation.off('frame');
        animation.on('frame', function(deltaTime) {
            sparkle.render(renderer, deltaTime);
        });

        $scope.hoverHero = {
            title : ""
        }

        $scope.showHeroName = function(hero) {
            $scope.hoverHero.title = hero.title;
        }
        $scope.hideHeroName = function(hero) {
            $scope.hoverHero.title = "";
        }

        // Render sparkle effect
        animation.onframe = function(deltaTime) {
            sparkle.render(renderer, deltaTime);
        }
    });
})();