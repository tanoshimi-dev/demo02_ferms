<template>
  <section class="dashboard">
    <div class="dashboard__copy">
      <p class="dashboard__eyebrow">FERMS Dashboard</p>
      <h2 class="dashboard__title">予約と運用の開始点</h2>
      <p class="dashboard__description">
        利用者予約と管理運用の主要導線を、デモ向けに確認しやすくまとめたダッシュボードです。
      </p>
    </div>

    <AuthSummaryCard
      v-if="authState.authenticated"
      :auth-state="authState"
    />
  </section>

  <section class="stack-grid">
    <article class="resource-card">
      <p class="resource-card__meta">Catalog Summary</p>
      <h3 class="resource-card__title">利用可能な施設 {{ activeFacilityCount }} 件</h3>
      <p class="resource-card__description">
        予約作成前に、現在利用可能な施設と設備の状況を確認できます。
      </p>
      <div class="resource-card__actions">
        <NuxtLink to="/facilities">施設一覧へ</NuxtLink>
        <NuxtLink v-if="primaryFacility" :to="`/facilities/${primaryFacility.id}`">
          おすすめ施設を開く
        </NuxtLink>
      </div>
    </article>
    <NuxtLink class="resource-card" to="/facilities">
      <p class="resource-card__meta">Catalog</p>
      <h3 class="resource-card__title">施設一覧</h3>
      <p class="resource-card__description">施設と設備を確認し、予約作成へ進みます。</p>
    </NuxtLink>
    <NuxtLink class="resource-card" to="/reservations">
      <p class="resource-card__meta">My Reservations</p>
      <h3 class="resource-card__title">予約一覧</h3>
      <p class="resource-card__description">
        自分の予約を確認し、キャンセルまで行えます。現在の予約件数は
        {{ reservations.length }} 件です。
      </p>
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
const [{ authState }, facilitiesResponse, reservationsResponse] = await Promise.all([
  useAuthSession({
    required: true,
  }),
  useFetch('/api/facilities'),
  useFetch('/api/reservations'),
]);

const facilities = computed(() => {
  const payload = facilitiesResponse.data.value as
    | {
        data?: {
          items?: Array<{
            id: string;
            name: string;
            isActive: boolean;
          }>;
        };
      }
    | null;

  return payload?.data?.items ?? [];
});

const reservations = computed(() => {
  const payload = reservationsResponse.data.value as
    | {
        data?: {
          items?: Array<{
            id: string;
          }>;
        };
      }
    | null;

  return payload?.data?.items ?? [];
});

const activeFacilityCount = computed(
  () => facilities.value.filter((facility) => facility.isActive).length,
);
const primaryFacility = computed(() =>
  facilities.value.find((facility) => facility.isActive),
);
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
