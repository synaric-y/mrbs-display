import { mapGetters, mapMutations } from 'vuex';

export const PageMixin={
  methods: {
    ...mapMutations(['changeTheme','changeStatus','changeTimeFormat','changeTimezone','changeBaseURL','changeDeviceInfo','changeBatteryInfo','changeInnerAddress']),
  },
  computed: {
    ...mapGetters(['currentTheme','currentStatus','currentTimeFormat','currentTimezone','currentBaseURL','currentDeviceInfo','currentBatteryInfo','currentInnerAddress'])
  },
};