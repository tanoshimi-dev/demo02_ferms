<template>
  <section class="summary-card">
    <p class="summary-card__eyebrow">Authenticated Session</p>
    <h2 class="summary-card__title">{{ authState.user.name }}</h2>
    <dl class="summary-card__list">
      <div>
        <dt>Email</dt>
        <dd>{{ authState.user.email }}</dd>
      </div>
      <div>
        <dt>Role</dt>
        <dd>{{ authState.user.role }}</dd>
      </div>
      <div>
        <dt>User ID</dt>
        <dd>{{ authState.user.id }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  authState: {
    authenticated: true;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
}>();
</script>

<style scoped>
.summary-card {
  padding: 1.5rem;
  border: 1px solid #d7def0;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 16px 40px rgba(23, 32, 51, 0.08);
}

.summary-card__eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #117a43;
}

.summary-card__title {
  margin: 0;
  font-size: 1.7rem;
  color: #172033;
}

.summary-card__list {
  margin: 1rem 0 0;
  display: grid;
  gap: 0.85rem;
}

.summary-card__list div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.summary-card__list dt {
  font-weight: 600;
  color: #475679;
}

.summary-card__list dd {
  margin: 0;
  color: #172033;
  text-align: right;
}
</style>
