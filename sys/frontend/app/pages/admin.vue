<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Admin</p>
      <h2 class="resource-page__title">管理運用ダッシュボード</h2>
      <p class="resource-page__description">
        管理者ユーザー向けに、施設 / 設備 / 予約の運用導線をまとめています。
      </p>
    </div>

    <div class="resource-grid">
      <NuxtLink class="resource-card" to="/admin/facilities">
        <p class="resource-card__meta">Admin Facilities</p>
        <h3 class="resource-card__title">施設管理</h3>
        <p class="resource-card__description">
          施設の登録、更新、利用可否の切り替えを行います。
        </p>
      </NuxtLink>

      <NuxtLink class="resource-card" to="/admin/equipments">
        <p class="resource-card__meta">Admin Equipments</p>
        <h3 class="resource-card__title">設備管理</h3>
        <p class="resource-card__description">
          設備の登録、所属施設変更、利用可否の切り替えを行います。
        </p>
      </NuxtLink>

      <NuxtLink class="resource-card" to="/admin/reservations">
        <p class="resource-card__meta">Admin Reservations</p>
        <h3 class="resource-card__title">予約管理</h3>
        <p class="resource-card__description">
          予約検索と状態変更を行い、利用者導線と整合する運用状態を保ちます。
        </p>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
await useAdminSession();
</script>
