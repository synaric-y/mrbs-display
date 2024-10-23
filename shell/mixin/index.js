import { mapGetters, mapMutations } from 'vuex';

export const PageMixin = {
  methods: {
    ...mapMutations(['changeTheme','changeStatus','changeTimeFormat','changeBaseURL']),
  },
  computed: {
    ...mapGetters(['currentTheme','currentStatus','currentTimeFormat','currentBaseURL'])
  },
};