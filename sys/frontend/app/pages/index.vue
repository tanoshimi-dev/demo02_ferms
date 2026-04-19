<template>
  <section class="hero">
    <div class="hero__copy">
      <p class="hero__eyebrow">Phase 2 Authentication</p>
      <h2 class="hero__title">FERMS Auth Foundation</h2>
      <p class="hero__description">
        portal handover と FERMS ローカルセッションを前提に、Nuxt / NestJS /
        PostgreSQL / Docker を接続した認証付きの共通基盤です。未認証時はここから
        認証引き継ぎを開始し、認証済みであれば dashboard 骨組みへ進めます。
      </p>
    </div>

    <AuthSummaryCard
      v-if="authState.authenticated"
      :auth-state="authState"
    />
    <AuthStartPanel
      v-else
      :handover-url="handoverUrl"
      :error-message="authErrorMessage"
    />
  </section>

  <section class="stack-grid">
    <div class="card">
      <h3 class="card__title">Backend health</h3>
      <p class="card__status" :data-status="statusLabel">{{ statusLabel }}</p>
      <dl class="health-list">
        <div>
          <dt>API</dt>
          <dd>{{ data?.services.api ?? 'unknown' }}</dd>
        </div>
        <div>
          <dt>Database</dt>
          <dd>{{ data?.services.database ?? 'unknown' }}</dd>
        </div>
        <div>
          <dt>Checked at</dt>
          <dd>{{ checkedAt }}</dd>
        </div>
      </dl>

      <p v-if="error" class="card__error">
        {{ error.statusMessage ?? 'Backend health の取得に失敗しました。' }}
      </p>
    </div>

    <div class="card">
      <h3 class="card__title">Next step</h3>
      <p class="card__description">
        認証が完了すると、共通ヘッダーと dashboard 骨組みを通じて Phase 3 以降の
        予約導線を積み上げられます。
      </p>
      <NuxtLink class="card__link" to="/dashboard">Dashboard へ進む</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data, error } = await useBackendHealth();
const {
  authState,
  errorMessage: authErrorMessage,
  handoverUrl,
} = await useAuthSession();

const statusLabel = computed(() => {
  if (error.value) {
    return 'unavailable';
  }
  return data.value?.status ?? 'unknown';
});

const checkedAt = computed(() => {
  if (!data.value?.timestamp) {
    return 'not available';
  }
  return new Date(data.value.timestamp).toLocaleString('ja-JP');
});
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
  gap: 1.5rem;
}

.hero__eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3658b3;
}

.hero__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  color: #172033;
}

.hero__description {
  margin: 1rem 0 0;
  max-width: 60ch;
  line-height: 1.7;
  color: #475679;
}

.card {
  padding: 1.5rem;
  border: 1px solid #d7def0;
  border-radius: 1rem;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(23, 32, 51, 0.08);
}

.card__title {
  margin: 0;
  font-size: 1rem;
  color: #475679;
}

.card__status {
  margin: 0.75rem 0 1rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.card__status[data-status='ok'] {
  color: #117a43;
}

.card__status[data-status='unavailable'] {
  color: #c0392b;
}

.health-list {
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.health-list div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.health-list dt {
  font-weight: 600;
  color: #475679;
}

.health-list dd {
  margin: 0;
  color: #172033;
}

.card__error {
  margin: 1rem 0 0;
  color: #c0392b;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
