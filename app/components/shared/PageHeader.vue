<template>
  <div class="text-center mb-8">
    <h1 class="text-h3 font-weight-bold text-grey-darken-3 mb-2">
      <v-icon size="large" color="primary" class="mr-3">{{ icon }}</v-icon>
      {{ title }}
    </h1>
    <p class="text-h6 text-grey-darken-1">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string;
  title: string;
  description: string;
}

defineProps<Props>();
</script>
