<template>
  <div id="hero-list">
    <h2>{{ hoverHeroTitle | formatTitle }}</h2>
    <ul>
      <li v-for="hero in heroList" :key="hero.name" @mouseover="showHeroName(hero)" @mouseout="hideHeroName()">
        <a :href="'#/hero/' + hero.name">
          <img :src="hero.hover" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script>

import store from '../store';

export default {
  name: 'HeroList',

  data() {
    return store;
  },

  methods: {
    showHeroName(hero) {
      this.hoverHeroTitle = hero.name;
    },

    hideHeroName() {
      this.hoverHeroTitle = '';
    }
  },

  filters: {
    formatTitle: string => { // "ogre_magi" to "Ogre Magi"
      return string.split('_')
        .map(s => s[0].toUpperCase() + s.slice(1))
        .join(' ');
    }
  }
}
</script>

<style lang="scss">
#hero-list {
  width:84%;
  position: absolute;
  left: 50%;
  margin-left: -42%;

  h2 {
    height: 30px;
    text-align: center;
    color: #9E9E9E;
  }

  li {
    float: left;
    margin:3px;
    cursor: pointer;
    width: 7.6%;
    height: 0;
    padding-bottom: 5%;

    img {
      box-shadow: 0 0 5px black;
      width: 100%;
      z-index: 0;
      position: relative;
      transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1);

      &:hover {
        z-index: 1;
        transform:scale(1.3);
      }
    }
  }
}
</style>
