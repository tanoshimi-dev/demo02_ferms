<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Equipments</p>
      <h2 class="resource-page__title">設備一覧</h2>
      <p class="resource-page__description">
        設備は施設配下で管理されます。詳細画面で所属施設を確認できます。
      </p>
    </div>

    <p v-if="error" class="form__error">
      {{ error.statusMessage ?? '設備一覧の取得に失敗しました。' }}
    </p>

    <section v-else-if="equipments.length === 0" class="resource-card empty-state">
      <h3 class="empty-state__title">表示できる設備がありません</h3>
      <p class="empty-state__description">
        管理者画面で設備が未登録か、まだ利用可能な設備がありません。
      </p>
    </section>

    <div v-else class="resource-grid">
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

const { data, error } = await useFetch('/api/equipments');

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
