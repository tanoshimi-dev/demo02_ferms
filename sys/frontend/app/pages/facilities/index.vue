<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Facilities</p>
      <h2 class="resource-page__title">利用可能な施設</h2>
      <p class="resource-page__description">
        認証済みユーザー向けに、施設一覧と設備数を確認できます。詳細画面から空き確認と予約作成へ進みます。
      </p>
    </div>

    <div class="resource-grid">
      <NuxtLink
        v-for="facility in facilities"
        :key="facility.id"
        :to="`/facilities/${facility.id}`"
        class="resource-card"
      >
        <p class="resource-card__meta">{{ facility.location }}</p>
        <h3 class="resource-card__title">{{ facility.name }}</h3>
        <p class="resource-card__description">{{ facility.description }}</p>
        <p class="resource-card__footer">
          設備 {{ facility.equipmentCount }} 件 /
          {{ facility.isActive ? '利用可能' : '停止中' }}
        </p>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
await useAuthSession({
  required: true,
});

const { data } = await useFetch('/api/facilities');

const facilities = computed(() => {
  const payload = data.value as
    | {
        data?: {
          items?: Array<{
            id: string;
            name: string;
            description: string;
            location: string;
            isActive: boolean;
            equipmentCount: number;
          }>;
        };
      }
    | null;

  return payload?.data?.items ?? [];
});
</script>
