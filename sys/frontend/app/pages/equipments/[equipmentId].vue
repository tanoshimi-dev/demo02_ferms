<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Equipment Detail</p>
      <h2 class="resource-page__title">{{ equipment?.name }}</h2>
      <p class="resource-page__description">{{ equipment?.description }}</p>
    </div>

    <section v-if="equipment" class="resource-card">
      <p class="resource-card__meta">所属施設</p>
      <h3 class="resource-card__title">{{ equipment.facilityName }}</h3>
      <p class="resource-card__description">
        設備単体では予約せず、所属施設の詳細画面から空き確認と予約作成へ進みます。
      </p>
      <div class="resource-card__actions">
        <NuxtLink :to="`/facilities/${equipment.facilityId}`">施設詳細へ進む</NuxtLink>
        <NuxtLink to="/equipments">設備一覧へ戻る</NuxtLink>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
await useAuthSession({
  required: true,
});

const route = useRoute();
const { data } = await useFetch(`/api/equipments/${route.params.equipmentId as string}`);

const equipment = computed(() => {
  const payload = data.value as
    | {
        data?: {
          equipment?: {
            id: string;
            facilityId: string;
            facilityName: string;
            name: string;
            description: string;
          };
        };
      }
    | null;

  return payload?.data?.equipment;
});
</script>
