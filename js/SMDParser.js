(function(){
    
    'use strict';
    var app = angular.module("heroViewer");

    var readSMD = function(content) {
        var lines = content.split('\n');

        var frames = [];
        var joints = [];
        var rootIndex = -1;
        var currentFrame = 0;

        var handler = null;

        var handleJoint = function(line) {
            var items = line.split(/\s+/);
            if (items.length > 3) {
                items = [items[0], items.slice(1, items.length-1).join(' '), items[items.length-1]];
            }
            if (items.length === 3) {
                var idx = parseInt(items[0]);
                var name = items[1].replace(/"/g, '');
                var parentIdx = parseInt(items[2]);
                if (parentIdx == -1) {
                    rootIndex = idx;
                }
                joints[idx] = name;
            }
        }

        var handleAnimation = function(line) {
            var items = line.split(/\s+/);
            if (items[0] == 'time') {
                currentFrame = parseInt(items[1]);
            } else if(items.length == 7) {
                var idx = parseInt(items[0]);
                if (! frames[idx]) {
                    frames[idx] = []
                }
                var jointFrames = frames[idx];
                var frame = {
                    time : currentFrame * 30,
                    position : new Float32Array([
                        parseFloat(items[1]),
                        parseFloat(items[2]),
                        parseFloat(items[3])
                    ]),
                    scale : new Float32Array([1, 1, 1])
                }
                var quat = new qtek.math.Quaternion();
                // Fuck, why z first ????
                quat.rotateZ(parseFloat(items[6]));
                quat.rotateY(parseFloat(items[5]));
                quat.rotateX(parseFloat(items[4]));
                // Z-up to Y-up
                // if (idx == rootIndex) {
                //     var mat4 = new qtek.core.Matrix4();
                //     mat4.fromRotationTranslation(quat, frame.position);
                //     mat4.multiplyLeft(new qtek.core.Matrix4().rotateX(-Math.PI/2));
                //     mat4.decomposeMatrix(frame.scale, quat, frame.position);
                // }

                frame.rotation = quat._array;
                jointFrames.push(frame);
            }
        }

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            switch(line) {
                case 'nodes':
                    handler = handleJoint
                    break;
                case 'skeleton':
                    handler = handleAnimation
                    break;
                case 'end':
                    handler = null;
                    break;
                default:
                    if (handler) {
                        handler(line)
                    }
            }
        }

        var ret = {};
        for (var i = 0; i < joints.length; i++) {
            ret[joints[i]] = frames[i];
        }

        return ret;
    }

    window.SMDParser = readSMD;
})();