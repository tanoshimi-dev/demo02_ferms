<template>
  <section class="auth-panel">
    <p class="auth-panel__eyebrow">Authentication</p>
    <h2 class="auth-panel__title">FERMS セッションを開始してください</h2>
    <p class="auth-panel__description">
      画面へ進む前に、認証引き継ぎで
      <code>demo02_ferms</code> のローカルセッションを確立します。
    </p>

    <p v-if="errorMessage" class="auth-panel__error">
      {{ errorMessage }}
    </p>
    <p v-else class="auth-panel__meta">
      未認証時はここから親ポータルまたは開発用 mock 認証へ進みます。
    </p>

    <a class="auth-panel__button" :href="handoverUrl">認証引き継ぎを実行</a>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  handoverUrl: string;
  errorMessage?: string;
}>();
</script>

<style scoped>
.auth-panel {
  padding: 1.5rem;
  border: 1px solid #d7def0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 16px 40px rgba(23, 32, 51, 0.08);
}

.auth-panel__eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3658b3;
}

.auth-panel__title {
  margin: 0;
  font-size: 1.7rem;
  color: #172033;
}

.auth-panel__description,
.auth-panel__meta,
.auth-panel__error {
  margin: 1rem 0 0;
  line-height: 1.7;
  color: #475679;
}

.auth-panel__error {
  color: #c0392b;
}

.auth-panel__button {
  display: inline-flex;
  margin-top: 1.25rem;
  padding: 0.85rem 1.2rem;
  border-radius: 999px;
  background: #3658b3;
  color: #fff;
  font-weight: 700;
}

code {
  padding: 0.15rem 0.35rem;
  border-radius: 0.35rem;
  background: #eef3ff;
}
</style>
