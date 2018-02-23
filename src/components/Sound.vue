<template>
  <div id="sound-control">
    <div class="ui circular icon button blue" id="play-pause" @click="togglePlay">
      <i :class="['icon', isPlay ? 'pause' : 'play']"></i>
    </div>
    <div class="ui circular icon button blue" id="shuffle">
      <i class="icon shuffle"></i>
    </div>
  </div>
</template>

<script>
const soundList = [
  'gamestartup1.mp3',
  'gamestartup2.mp3',
  'gamestartup3.mp3',
  'ui_underscore1.mp3',
  'world_map.mp3'
];
const audio = document.createElement('audio');
function pick() {
  audio.src = 'sounds/' + soundList[Math.floor(Math.random() * 5)];
}
audio.addEventListener('ended', pick);
audio.volume = 0.5;

export default {

  data() {
    return {
      isPlay: false
    }
  },

  created() {
    pick();
    audio.play();
    this.isPlay = true;
  },

  methods: {
    togglePlay() {
      this.isPlay = !this.isPlay;
      this.isPlay ? audio.play() : audio.pause();
    },
    shuffle() {
      pick();
    }
  }
}
</script>

<style lang="scss">
#sound-control {
  position: absolute;
  right: 50px;
  bottom: 40px;

  .button{
    padding:0.5em;
  }
}

</style>

