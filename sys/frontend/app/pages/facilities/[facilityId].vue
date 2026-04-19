<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Facility Detail</p>
      <h2 class="resource-page__title">{{ facility?.name }}</h2>
      <p class="resource-page__description">{{ facility?.description }}</p>
      <p class="resource-page__meta">
        {{ facility?.location }} / {{ facility?.isActive ? '利用可能' : '停止中' }}
      </p>
    </div>

    <div class="stack-grid">
      <section class="resource-card">
        <h3 class="resource-card__title">設備一覧</h3>
        <ul class="list">
          <li v-for="equipment in facility?.equipments ?? []" :key="equipment.id">
            <NuxtLink :to="`/equipments/${equipment.id}`">
              {{ equipment.name }}
            </NuxtLink>
            <span>{{ equipment.isActive ? '利用可能' : '停止中' }}</span>
          </li>
        </ul>
      </section>

      <section class="resource-card">
        <h3 class="resource-card__title">予約作成</h3>
        <form class="form" @submit.prevent="createReservation">
          <label>
            <span>設備</span>
            <select v-model="form.equipmentId">
              <option value="">施設のみ</option>
              <option
                v-for="equipment in facility?.equipments ?? []"
                :key="equipment.id"
                :value="equipment.id"
              >
                {{ equipment.name }}
              </option>
            </select>
          </label>

          <label>
            <span>開始日時</span>
            <input v-model="form.startAt" type="datetime-local" required />
          </label>

          <label>
            <span>終了日時</span>
            <input v-model="form.endAt" type="datetime-local" required />
          </label>

          <label>
            <span>備考</span>
            <textarea v-model="form.note" rows="3" />
          </label>

          <div class="form__actions">
            <button type="button" class="button button--ghost" @click="checkAvailability">
              空き状況を確認
            </button>
            <button type="submit" class="button">予約を作成</button>
          </div>
        </form>

        <p v-if="message" class="form__message">{{ message }}</p>
        <p v-if="errorMessage" class="form__error">{{ errorMessage }}</p>

        <div v-if="availability" class="availability">
          <p class="availability__status">
            {{ availability.available ? 'この時間帯は予約可能です。' : 'この時間帯は予約済みです。' }}
          </p>
          <ul v-if="availability.conflicts.length > 0" class="list">
            <li v-for="conflict in availability.conflicts" :key="conflict.id">
              {{ new Date(conflict.startAt).toLocaleString('ja-JP') }} -
              {{ new Date(conflict.endAt).toLocaleString('ja-JP') }}
              / {{ conflict.userName }}
            </li>
          </ul>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
await useAuthSession({
  required: true,
});

const route = useRoute();
const router = useRouter();
const facilityId = route.params.facilityId as string;

const { data, refresh } = await useFetch(`/api/facilities/${facilityId}`);

const facility = computed(() => {
  const payload = data.value as
    | {
        data?: {
          facility?: {
            id: string;
            name: string;
            description: string;
            location: string;
            isActive: boolean;
            equipments: Array<{
              id: string;
              name: string;
              description: string;
              isActive: boolean;
            }>;
          };
        };
      }
    | null;

  return payload?.data?.facility;
});

const form = reactive({
  equipmentId: '',
  startAt: '',
  endAt: '',
  note: '',
});

const availability = ref<{
  available: boolean;
  conflicts: Array<{
    id: string;
    startAt: string;
    endAt: string;
    userName: string;
  }>;
} | null>(null);
const errorMessage = ref('');
const message = ref('');

function toIsoLocal(value: string) {
  return value ? new Date(value).toISOString() : '';
}

async function checkAvailability() {
  errorMessage.value = '';
  message.value = '';

  try {
    const result = (await $fetch('/api/reservations/availability', {
      query: {
        facilityId,
        equipmentId: form.equipmentId || undefined,
        startAt: toIsoLocal(form.startAt),
        endAt: toIsoLocal(form.endAt),
      },
    })) as {
      data: {
        available: boolean;
        conflicts: Array<{
          id: string;
          startAt: string;
          endAt: string;
          userName: string;
        }>;
      };
    };

    availability.value = result.data;
  } catch (error) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } }).data?.error?.message ??
      '空き状況の取得に失敗しました。';
  }
}

async function createReservation() {
  errorMessage.value = '';
  message.value = '';

  try {
    const result = (await $fetch('/api/reservations', {
      method: 'POST',
      body: {
        facilityId,
        equipmentId: form.equipmentId || undefined,
        startAt: toIsoLocal(form.startAt),
        endAt: toIsoLocal(form.endAt),
        note: form.note,
      },
    })) as {
      data: {
        reservation: {
          id: string;
        };
      };
    };

    message.value = '予約を作成しました。';
    availability.value = null;
    await refresh();
    await router.push(`/reservations/${result.data.reservation.id}`);
  } catch (error) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } }).data?.error?.message ??
      '予約作成に失敗しました。';
  }
}
</script>
