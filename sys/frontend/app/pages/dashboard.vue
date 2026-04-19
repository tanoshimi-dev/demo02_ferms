<template>
  <section class="dashboard">
    <div class="dashboard__copy">
      <p class="dashboard__eyebrow">Phase 2 Authentication</p>
      <h2 class="dashboard__title">Authenticated dashboard skeleton</h2>
      <p class="dashboard__description">
        portal handover または mock handover 済みのユーザーだけが到達できる、
        Phase 3 以降の予約導線を積み上げるための共通レイアウトページです。
      </p>
    </div>

    <AuthSummaryCard
      v-if="authState.authenticated"
      :auth-state="authState"
    />
  </section>

  <section class="stack-grid">
    <NuxtLink class="resource-card" to="/facilities">
      <p class="resource-card__meta">Catalog</p>
      <h3 class="resource-card__title">施設一覧</h3>
      <p class="resource-card__description">施設と設備を確認し、予約作成へ進みます。</p>
    </NuxtLink>
    <NuxtLink class="resource-card" to="/reservations">
      <p class="resource-card__meta">My Reservations</p>
      <h3 class="resource-card__title">予約一覧</h3>
      <p class="resource-card__description">自分の予約を確認し、キャンセルまで行えます。</p>
    </NuxtLink>
    <NuxtLink
      v-if="authState.authenticated && authState.user.role === 'admin'"
      class="resource-card"
      to="/admin"
    >
      <p class="resource-card__meta">Admin Operations</p>
      <h3 class="resource-card__title">管理運用</h3>
      <p class="resource-card__description">
        施設 / 設備 / 予約の管理者向け運用画面へ進みます。
      </p>
    </NuxtLink>
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
