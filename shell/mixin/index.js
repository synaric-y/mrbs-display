import { mapGetters, mapMutations } from 'vuex';
import App from '../pages/index/index.vue'

export default {
  install(Vue) {
    Vue.mixin({
      mixins: [App], // 使用mixin
      data() {
        return {
        };
      },
      methods: {
        ...mapMutations(['changeTheme']),
      },
      computed: {
        ...mapGetters(['currentTheme'])
      },
     
    });
  }
};