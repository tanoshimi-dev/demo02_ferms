<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Equipments</p>
      <h2 class="resource-page__title">設備一覧</h2>
      <p class="resource-page__description">
        設備は施設配下で管理されます。詳細画面で所属施設を確認できます。
      </p>
    </div>

    <div class="resource-grid">
      <NuxtLink
        v-for="equipment in equipments"
        :key="equipment.id"
        :to="`/equipments/${equipment.id}`"
        class="resource-card"
      >
        <p class="resource-card__meta">{{ equipment.facilityName }}</p>
        <h3 class="resource-card__title">{{ equipment.name }}</h3>
        <p class="resource-card__description">{{ equipment.description }}</p>
        <p class="resource-card__footer">
          {{ equipment.isActive ? '利用可能' : '停止中' }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
await useAuthSession({
  required: true,
});

const { data } = await useFetch('/api/equipments');

const equipments = computed(() => {
  const payload = data.value as
    | {
        data?: {
          items?: Array<{
            id: string;
            facilityName: string;
            name: string;
            description: string;
            isActive: boolean;
          }>;
        };
      }
    | null;

  return payload?.data?.items ?? [];
});
</script>
