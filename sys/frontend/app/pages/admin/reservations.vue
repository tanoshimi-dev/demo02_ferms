<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Admin Reservations</p>
      <h2 class="resource-page__title">予約管理</h2>
      <p class="resource-page__description">
        予約を検索し、状態変更によって運用都合の調整を行います。
      </p>
    </div>

    <section class="resource-card">
      <form class="form" @submit.prevent="loadReservations">
        <label>
          <span>状態</span>
          <select v-model="filters.status">
            <option value="">すべて</option>
            <option value="reserved">reserved</option>
            <option value="cancelled">cancelled</option>
            <option value="completed">completed</option>
          </select>
        </label>

        <label>
          <span>施設</span>
          <select v-model="filters.facilityId">
            <option value="">すべて</option>
            <option v-for="facility in facilities" :key="facility.id" :value="facility.id">
              {{ facility.name }}
            </option>
          </select>
        </label>

        <label>
          <span>予約者 ID</span>
          <input v-model="filters.userId" type="text" />
        </label>

        <div class="form__actions">
          <button type="submit" class="button">検索する</button>
        </div>
      </form>
    </section>

    <section v-if="reservations.length === 0" class="resource-card empty-state">
      <h3 class="empty-state__title">条件に一致する予約はありません</h3>
      <p class="empty-state__description">
        フィルターを変えるか、利用者導線から新しい予約を作成して再検索してください。
      </p>
    </section>

    <div v-else class="resource-grid">
      <article v-for="reservation in reservations" :key="reservation.id" class="resource-card">
        <p class="resource-card__meta">
          {{ reservation.facilityName }} / {{ reservation.equipmentName ?? '施設予約' }}
        </p>
        <h3 class="resource-card__title">{{ reservation.userName ?? reservation.userId }}</h3>
        <p class="resource-card__description">
          {{ new Date(reservation.startAt).toLocaleString('ja-JP') }} -
          {{ new Date(reservation.endAt).toLocaleString('ja-JP') }}
        </p>
        <p class="resource-card__footer">状態: {{ reservation.status }}</p>

        <div class="form">
          <label>
            <span>状態変更</span>
            <select :value="reservation.status" @change="updateStatus(reservation.id, $event)">
              <option value="reserved">reserved</option>
              <option value="cancelled">cancelled</option>
              <option value="completed">completed</option>
            </select>
          </label>
        </div>
      </article>
    </div>

    <p v-if="message" class="form__message">{{ message }}</p>
    <p v-if="errorMessage" class="form__error">{{ errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
await useAdminSession();

type FacilityOption = {
  id: string;
  name: string;
};

type AdminReservation = {
  id: string;
  userId: string;
  userName: string | null;
  facilityName: string;
  equipmentName: string | null;
  startAt: string;
  endAt: string;
  status: string;
  note: string | null;
};

const facilities = ref<FacilityOption[]>([]);
const reservations = ref<AdminReservation[]>([]);
const message = ref('');
const errorMessage = ref('');
const filters = reactive({
  status: '',
  facilityId: '',
  userId: '',
});

async function loadFacilities() {
  const payload = (await $fetch('/api/admin/facilities')) as {
    data: {
      items: FacilityOption[];
    };
  };
  facilities.value = payload.data.items;
}

async function loadReservations(options?: { preserveFeedback?: boolean }) {
  if (!options?.preserveFeedback) {
    message.value = '';
    errorMessage.value = '';
  }

  try {
    const payload = (await $fetch('/api/admin/reservations', {
      query: {
        status: filters.status || undefined,
        facilityId: filters.facilityId || undefined,
        userId: filters.userId || undefined,
      },
    })) as {
      data: {
        items: AdminReservation[];
      };
    };
    reservations.value = payload.data.items;
  } catch (error) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } }).data?.error?.message ??
      '予約一覧の取得に失敗しました。';
    reservations.value = [];
  }
}

async function updateStatus(reservationId: string, event: Event) {
  const status = (event.target as HTMLSelectElement).value;
  message.value = '';
  errorMessage.value = '';

  try {
    await $fetch(`/api/admin/reservations/${reservationId}`, {
      method: 'PATCH',
      body: {
        status,
      },
    });
    await loadReservations();
    message.value = '予約状態を更新しました。';
  } catch (error) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } }).data?.error?.message ??
      '予約状態の更新に失敗しました。';
    await loadReservations({
      preserveFeedback: true,
    });
  }
}

await Promise.all([loadFacilities(), loadReservations()]);
</script>
