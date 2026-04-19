<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Reservations</p>
      <h2 class="resource-page__title">自分の予約一覧</h2>
      <p class="resource-page__description">
        予約の確認とキャンセルを行えます。キャンセル後は同じ時間帯が再利用可能になります。
      </p>
    </div>

    <div class="resource-grid">
      <article v-for="reservation in reservations" :key="reservation.id" class="resource-card">
        <p class="resource-card__meta">{{ reservation.facilityName }}</p>
        <h3 class="resource-card__title">
          {{ reservation.equipmentName ?? '施設予約' }}
        </h3>
        <p class="resource-card__description">
          {{ new Date(reservation.startAt).toLocaleString('ja-JP') }} -
          {{ new Date(reservation.endAt).toLocaleString('ja-JP') }}
        </p>
        <p class="resource-card__footer">状態: {{ reservation.status }}</p>

        <div class="resource-card__actions">
          <NuxtLink :to="`/reservations/${reservation.id}`">詳細</NuxtLink>
          <button
            v-if="reservation.status === 'reserved'"
            type="button"
            class="button button--ghost"
            @click="cancelReservation(reservation.id)"
          >
            キャンセル
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
await useAuthSession({
  required: true,
});

const { data, refresh } = await useFetch('/api/reservations');

const reservations = computed(() => {
  const payload = data.value as
    | {
        data?: {
          items?: Array<{
            id: string;
            facilityName: string;
            equipmentName: string | null;
            startAt: string;
            endAt: string;
            status: string;
          }>;
        };
      }
    | null;

  return payload?.data?.items ?? [];
});

async function cancelReservation(reservationId: string) {
  await $fetch(`/api/reservations/${reservationId}/cancel`, {
    method: 'PATCH',
  });
  await refresh();
}
</script>
