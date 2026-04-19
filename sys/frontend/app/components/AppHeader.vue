<template>
  <header class="header">
    <div class="page-container header__inner">
      <div>
        <p class="header__eyebrow">demo02_ferms</p>
        <h1 class="header__title">{{ appName }}</h1>
      </div>

      <nav class="header__nav" aria-label="foundation navigation">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/dashboard">Dashboard</NuxtLink>
        <a :href="backendPublicUrl" target="_blank" rel="noreferrer">Backend</a>
        <a v-if="authState.authenticated" :href="logoutUrl">Logout</a>
        <a v-else :href="handoverUrl">Login</a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const { authState, handoverUrl, logoutUrl } = await useAuthSession();

const appName = config.public.appName;
const backendPublicUrl = config.public.backendPublicUrl;
</script>

<style scoped>
.header {
  border-bottom: 1px solid #d7def0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0;
}

.header__eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #586a91;
}

.header__title {
  margin: 0;
  font-size: 1.5rem;
  color: #172033;
}

.header__nav {
  display: flex;
  gap: 1rem;
  font-weight: 600;
  color: #3658b3;
}

@media (max-width: 720px) {
  .header__inner {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
