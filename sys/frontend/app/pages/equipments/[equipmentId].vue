<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Equipment Detail</p>
      <h2 class="resource-page__title">{{ equipment?.name }}</h2>
      <p class="resource-page__description">{{ equipment?.description }}</p>
      <p class="resource-page__meta">
        所属施設:
        <NuxtLink v-if="equipment" :to="`/facilities/${equipment.facilityId}`">
          {{ equipment.facilityName }}
        </NuxtLink>
      </p>
    </div>
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
