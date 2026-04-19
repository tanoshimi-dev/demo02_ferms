<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Reservations</p>
      <h2 class="resource-page__title">自分の予約一覧</h2>
      <p class="resource-page__description">
        予約の確認とキャンセルを行えます。キャンセル後は同じ時間帯が再利用可能になります。
      </p>
    </div>

    <p v-if="message" class="form__message">{{ message }}</p>
    <p v-if="errorMessage || error" class="form__error">
      {{ errorMessage || error?.statusMessage || '予約一覧の取得に失敗しました。' }}
    </p>

    <section v-if="reservations.length === 0" class="resource-card empty-state">
      <h3 class="empty-state__title">予約はまだありません</h3>
      <p class="empty-state__description">
        施設詳細から空き状況を確認して、新しい予約を作成してください。
      </p>
      <div class="resource-card__actions">
        <NuxtLink to="/facilities">施設一覧へ</NuxtLink>
      </div>
    </section>

    <div v-else class="resource-grid">
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

const { data, error, refresh } = await useFetch('/api/reservations');
const message = ref('');
const errorMessage = ref('');

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
  message.value = '';
  errorMessage.value = '';

  try {
    await $fetch(`/api/reservations/${reservationId}/cancel`, {
      method: 'PATCH',
    });
    await refresh();
    message.value = '予約をキャンセルしました。空き状況へ再反映されています。';
  } catch (requestError) {
    errorMessage.value =
      (requestError as { data?: { error?: { message?: string } } }).data?.error
        ?.message ?? '予約のキャンセルに失敗しました。';
  }
}
</script>
