<script setup lang="ts">


import {onMounted} from "vue";
const lsa = localStorage.getItem('atoken');
const lsr = localStorage.getItem('rtoken');


</script>

<template>
URA POBEDA!
  {{ lsa }}
  {{ lsr }}
</template>

<style scoped>

</style>
