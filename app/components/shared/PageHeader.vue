<template>
  <div class="text-center mb-8">
    <h1 class="page-title font-weight-bold text-grey-darken-3 mb-2">
      <v-icon size="large" color="primary" class="mr-3">{{ icon }}</v-icon>
      {{ title }}
    </h1>
    <p class="page-description text-grey-darken-1">{{ description }}</p>
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

<style scoped>
.page-title {
  font-size: 3rem;
  line-height: 3.5rem;
  overflow-wrap: anywhere;
}

.page-description {
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 2rem;
  overflow-wrap: anywhere;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
    line-height: 2.25rem;
  }

  .page-description {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}
</style>
