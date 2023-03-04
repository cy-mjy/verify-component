<template>
  <div id="app">
    <verify-component ref="verify">
    </verify-component>
<!--    <el-button @click="$refs.verify.reset()">重置</el-button>-->
  </div>
</template>

<script>
import VerifyComponent from '@/components/VerifyComponent.vue'
export default {
  name: 'app',
  components: {
    VerifyComponent
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
