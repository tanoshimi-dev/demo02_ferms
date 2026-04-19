<template>
  <div class="page-shell">
    <AppHeader />
    <main class="page-container main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.main-content {
  padding: 2rem 0 3rem;
}
</style>
