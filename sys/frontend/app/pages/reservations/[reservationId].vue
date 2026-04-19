<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Reservation Detail</p>
      <h2 class="resource-page__title">{{ reservation?.facilityName }}</h2>
      <p class="resource-page__description">
        {{ reservation?.equipmentName ?? '施設予約' }}
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
