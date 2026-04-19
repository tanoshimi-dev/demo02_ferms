<template>
  <section class="hero">
    <div class="hero__copy">
      <p class="hero__eyebrow">Phase 1 Foundation</p>
      <h2 class="hero__title">FERMS Foundation</h2>
      <p class="hero__description">
        Nuxt、NestJS、PostgreSQL、Docker を接続した最小構成です。Phase 2
        以降の認証と予約機能を積み上げるための土台として、frontend / backend /
        db の疎通を確認できます。
      </p>
    </div>

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
  </section>
</template>

<script setup lang="ts">
const { data, error } = await useBackendHealth();

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
