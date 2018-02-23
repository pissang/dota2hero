import { Quaternion, animation, Matrix4, Vector3 } from 'claygl';

const readSMD = function (content) {
  let lines = content.split('\n');


  let joints = [];
  let currentFrame = 0;
  let tracks = [];

  let handler = null;
  let rootIndex = -1;

  function handleJoint (line) {
    let items = line.split(/\s+/);
    if (items.length > 3) {
      items = [items[0], items.slice(1, items.length-1).join(' '), items[items.length-1]];
    }
    if (items.length === 3) {
      let idx = parseInt(items[0]);
      let name = items[1].replace(/"/g, '');
      let parentIdx = parseInt(items[2]);
      if (parentIdx === -1) {
        rootIndex = idx;
      }
      joints[idx] = name;
    }
  }

  function handleAnimation(line) {
    let items = line.split(/\s+/);
    if (items[0] === 'time') {
      currentFrame = parseInt(items[1]);
    }
    else if (items.length === 7) {
      let idx = parseInt(items[0]);
      if (!tracks[idx]) {
        tracks[idx] = {
          position: [],
          rotation: [],
          time: []
        };
      }

      let quat = new Quaternion();
      let pos = new Vector3(
        parseFloat(items[1]),
        parseFloat(items[2]),
        parseFloat(items[3])
      );
      let scale = new Vector3();

      // why z first ????
      quat.rotateZ(parseFloat(items[6]));
      quat.rotateY(parseFloat(items[5]));
      quat.rotateX(parseFloat(items[4]));
      // Z-up to Y-up
      if (idx === rootIndex) {
        let mat4 = new Matrix4();
        mat4.fromRotationTranslation(quat, pos);
        mat4.multiplyLeft(new Matrix4().rotateX(-Math.PI/2));
        mat4.decomposeMatrix(scale, quat, pos);
      }

      tracks[idx].time.push(currentFrame * 30);
      tracks[idx].position.push(pos.x, pos.y, pos.z);
      tracks[idx].rotation.push(
        quat.array[0],
        quat.array[1],
        quat.array[2],
        quat.array[3]
      );
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    switch (line) {
      case 'nodes':
        handler = handleJoint;
        break;
      case 'skeleton':
        handler = handleAnimation;
        break;
      case 'end':
        handler = null;
        break;
      default:
        if (handler) {
          handler(line);
        }
    }
  }

  let clip = new animation.TrackClip({
    loop: true
  });
  for (let i = 0; i < joints.length; i++) {
    var track = new animation.SamplerTrack({
      name: joints[i]
    });
    track.channels.position = new Float32Array(tracks[i].position);
    track.channels.rotation = new Float32Array(tracks[i].rotation);
    track.channels.time = new Float32Array(tracks[i].time);
    clip.addTrack(track);
  }

  return clip;
};

export default readSMD;