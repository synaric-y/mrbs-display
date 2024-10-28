import { mapGetters, mapMutations } from 'vuex';

export const PageMixin={
  methods: {
    ...mapMutations(['changeTheme','changeStatus','changeTimeFormat','changeBaseURL','changeDeviceInfo','changeBatteryInfo']),
  },
  computed: {
    ...mapGetters(['currentTheme','currentStatus','currentTimeFormat','currentBaseURL','currentDeviceInfo','currentBatteryInfo'])
  },
};