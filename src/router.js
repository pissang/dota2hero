import Vue from 'vue';
import Router from 'vue-router';
import HeroList from './components/HeroList.vue';
import Hero from './components/Hero.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/heroes',
      name: 'heroes',
      component: HeroList
    },
    {
      path: '/hero/:heroName',
      component: Hero
    }
  ]
});
