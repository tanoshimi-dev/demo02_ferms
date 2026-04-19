<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Reservation Detail</p>
      <h2 class="resource-page__title">{{ reservation?.facilityName }}</h2>
      <p class="resource-page__description">
        {{ reservation?.equipmentName ?? '施設予約' }}
      </p>
      <p v-if="route.query.created === '1'" class="form__message">
        予約を作成しました。内容を確認してください。
      </p>
      <dl v-if="reservation" class="detail-list">
        <div>
          <dt>開始</dt>
          <dd>{{ new Date(reservation.startAt).toLocaleString('ja-JP') }}</dd>
        </div>
        <div>
          <dt>終了</dt>
          <dd>{{ new Date(reservation.endAt).toLocaleString('ja-JP') }}</dd>
        </div>
        <div>
          <dt>状態</dt>
          <dd>{{ reservation.status }}</dd>
        </div>
        <div>
          <dt>備考</dt>
          <dd>{{ reservation.note || 'なし' }}</dd>
        </div>
      </dl>
    </div>

    <section v-if="reservation" class="resource-card">
      <p class="resource-card__meta">Next step</p>
      <h3 class="resource-card__title">予約後の確認</h3>
      <p class="resource-card__description">
        予約一覧へ戻って状態を確認したり、必要に応じてキャンセルできます。
      </p>
      <div class="resource-card__actions">
        <NuxtLink to="/reservations">予約一覧へ戻る</NuxtLink>
        <NuxtLink to="/facilities">追加の予約を探す</NuxtLink>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
await useAuthSession({
  required: true,
});

const route = useRoute();
const { data } = await useFetch(
  `/api/reservations/${route.params.reservationId as string}`,
);

const reservation = computed(() => {
  const payload = data.value as
    | {
        data?: {
          reservation?: {
            facilityName: string;
            equipmentName: string | null;
            startAt: string;
            endAt: string;
            status: string;
            note: string | null;
          };
        };
      }
    | null;

  return payload?.data?.reservation;
});
</script>
