<template>
  <section class="dashboard">
    <div class="dashboard__copy">
      <p class="dashboard__eyebrow">Phase 2 Authentication</p>
      <h2 class="dashboard__title">Authenticated dashboard skeleton</h2>
      <p class="dashboard__description">
        portal handover または mock handover 済みのユーザーだけが到達できる、
        Phase 2 の共通レイアウトページです。
      </p>
    </div>

    <AuthSummaryCard
      v-if="authState.authenticated"
      :auth-state="authState"
    />
  </section>
</template>

<script setup lang="ts">
const { authState } = await useAuthSession({
  required: true,
});
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
  gap: 1.5rem;
}

.dashboard__eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3658b3;
}

.dashboard__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  color: #172033;
}

.dashboard__description {
  margin: 1rem 0 0;
  max-width: 60ch;
  line-height: 1.7;
  color: #475679;
}

@media (max-width: 900px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
}
</style>
