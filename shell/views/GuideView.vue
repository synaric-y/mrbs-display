<template>
	<div>
		<ActivateView v-if="getTopPage=='activate'" @close="next('login')"/>
		<LoginView v-if="getTopPage=='login'" @close="next('')" @previous="previous()"/>
	</div>

</template>

<script>
import ActivateView from '../views/ActivateView.vue';
import LoginView from '../views/LoginView.vue';

import Stack from '../utils/stack.js'

export default {
	name:"GuideView",
	components:{
		ActivateView,
		LoginView
	},
	computed:{
		getTopPage(){
			return this.pageStack.peek()
		}
	},
	data() {
		return {
			pageStack: new Stack('activate')
		};
	},
	methods:{
		next(page){
			this.pageStack.push(page)
		},
		previous(){
			this.pageStack.pop()
		}
	}
}
</script>

<style>
	
</style>