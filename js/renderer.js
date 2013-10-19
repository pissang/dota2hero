(function(){
    
    'use strict';

    var app = angular.module("heroViewer");
    
    app.provider('renderer', function() {
        var qtek3d = qtek['3d'];
        var renderer = new qtek3d.Renderer({
            canvas : document.getElementById("ViewPort")
        });
        renderer.resize(window.innerWidth, window.innerHeight);

        this.$get = function() {
            return renderer;
        }
    });

})();