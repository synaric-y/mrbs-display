<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */

	
	/* color palette from <https://github.com/vuejs/theme> */
	:root {
	  --vt-c-white: #ffffff;
	  --vt-c-white-soft: #f8f8f8;
	  --vt-c-white-mute: #f2f2f2;
	
	  --vt-c-black: #181818;
	  --vt-c-black-soft: #222222;
	  --vt-c-black-mute: #282828;
	
	  --vt-c-indigo: #2c3e50;
	
	  --vt-c-divider-light-1: rgba(60, 60, 60, 0.29);
	  --vt-c-divider-light-2: rgba(60, 60, 60, 0.12);
	  --vt-c-divider-dark-1: rgba(84, 84, 84, 0.65);
	  --vt-c-divider-dark-2: rgba(84, 84, 84, 0.48);
	
	  --vt-c-text-light-1: var(--vt-c-indigo);
	  --vt-c-text-light-2: rgba(60, 60, 60, 0.66);
	  --vt-c-text-dark-1: var(--vt-c-white);
	  --vt-c-text-dark-2: rgba(235, 235, 235, 0.64);
	}
	
	/* semantic color variables for this project */
	:root {
	  --color-background: #f7f8fa;
	  --color-background-content: #ffffff;
	
	  --color-border: #efefef;
	  --color-border-hover: var(--vt-c-divider-light-1);
	
	  --color-heading: #282828;
	
	  --color-primary-text: #333333;
	  --color-regular-text: #797979;
	  --color-secondary-text: #b0b0b0;
	
	  --color-default: #f5f5f5;
	
	  --color-disabled: #e7e7e7;
	  --color-disabled-1: #c8c8c8;
	
	  --color-canceled: #4f4f4f;
	
	  --color-full: #797979;
	
	
	  /*===========主题1============*/
	  --color-primary: #642abb;
	  --color-primary-light: #a281d4;
	  --color-selected: #591BB7;
	
	  --color-danger: #bd3124;
	  --color-danger-light: #fdada8;
	
	  --color-success: #642abb;
	  --color-success-light: #a281d4;
	  
	  /*===========主题1============*/
	  --dark-color-primary: #337ecc;
	  --dark-color-primary-light: #76a3da;
	  --dark-color-selected: #285fd4;
	  	
	  --dark-color-danger: #ff7b00;
	  --dark-color-danger-light: #fdada8;
	  	
	  --dark-color-success: #337ecc;
	  --dark-color-success-light: #76a3da;
	  
	  
	
	  --section-gap: 160px;
	}
	
	@media (prefers-color-scheme: dark) {
	  :root {
	    --color-background: var(--vt-c-black);
	    --color-background-soft: var(--vt-c-black-soft);
	    --color-background-mute: var(--vt-c-black-mute);
	
	    --color-border: var(--vt-c-divider-dark-2);
	    --color-border-hover: var(--vt-c-divider-dark-1);
	
	    --color-heading: var(--vt-c-text-dark-1);
	    --color-text: var(--vt-c-text-dark-2);
	  }
	}
	
	*,
	*::before,
	*::after {
	  box-sizing: border-box;
	  margin: 0;
	  font-weight: normal;
	}
	
	body {
	  min-height: 100vh;
	  color: var(--color-text);
	  background: var(--color-background);
	  transition:
	    color 0.5s,
	    background-color 0.5s;
	  line-height: 1.6;
	  font-family:
	    Inter,
	    -apple-system,
	    BlinkMacSystemFont,
	    'Segoe UI',
	    Roboto,
	    Oxygen,
	    Ubuntu,
	    Cantarell,
	    'Fira Sans',
	    'Droid Sans',
	    'Helvetica Neue',
	    sans-serif;
	  font-size: 15px;
	  text-rendering: optimizeLegibility;
	  -webkit-font-smoothing: antialiased;
	  -moz-osx-font-smoothing: grayscale;
	}
</style>
