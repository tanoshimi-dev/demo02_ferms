<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Admin Facilities</p>
      <h2 class="resource-page__title">施設管理</h2>
      <p class="resource-page__description">
        施設の登録、更新、利用可否の切り替えを行います。変更内容は利用者導線へ反映されます。
      </p>
    </div>

    <div class="stack-grid">
      <section class="resource-card">
        <div class="resource-card__actions">
          <button type="button" class="button button--ghost" @click="startCreate">
            新規登録
          </button>
          <button type="button" class="button button--ghost" @click="loadFacilities">
            再読み込み
          </button>
        </div>

        <ul class="list">
          <li v-for="facility in facilities" :key="facility.id">
            <div>
              <strong>{{ facility.name }}</strong>
              <p class="resource-card__meta">
                {{ facility.location }} / 設備 {{ facility.equipmentCount }} 件
              </p>
            </div>
            <button type="button" class="button button--ghost" @click="selectFacility(facility)">
              編集
            </button>
          </li>
        </ul>
      </section>

      <section class="resource-card">
        <h3 class="resource-card__title">
          {{ selectedFacilityId ? '施設を更新' : '施設を登録' }}
        </h3>

        <form class="form" @submit.prevent="submitFacility">
          <label>
            <span>施設名</span>
            <input v-model="form.name" type="text" required />
          </label>

          <label>
            <span>説明</span>
            <textarea v-model="form.description" rows="3" required />
          </label>

          <label>
            <span>所在地</span>
            <input v-model="form.location" type="text" required />
          </label>

          <label>
            <span>利用可否</span>
            <select v-model="form.isActiveValue">
              <option value="true">利用可能</option>
              <option value="false">停止中</option>
            </select>
          </label>

          <div class="form__actions">
            <button type="submit" class="button">
              {{ selectedFacilityId ? '更新する' : '登録する' }}
            </button>
            <button type="button" class="button button--ghost" @click="startCreate">
              リセット
            </button>
          </div>
        </form>

        <p v-if="message" class="form__message">{{ message }}</p>
        <p v-if="errorMessage" class="form__error">{{ errorMessage }}</p>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
await useAdminSession();

type AdminFacility = {
  id: string;
  name: string;
  description: string;
  location: string;
  isActive: boolean;
  equipmentCount: number;
};

const selectedFacilityId = ref('');
const facilities = ref<AdminFacility[]>([]);
const message = ref('');
const errorMessage = ref('');
const form = reactive({
  name: '',
  description: '',
  location: '',
  isActiveValue: 'true',
});

function resetForm() {
  selectedFacilityId.value = '';
  form.name = '';
  form.description = '';
  form.location = '';
  form.isActiveValue = 'true';
}

function startCreate() {
  resetForm();
  message.value = '';
  errorMessage.value = '';
}

function selectFacility(facility: AdminFacility) {
  selectedFacilityId.value = facility.id;
  form.name = facility.name;
  form.description = facility.description;
  form.location = facility.location;
  form.isActiveValue = String(facility.isActive);
  message.value = '';
  errorMessage.value = '';
}

async function loadFacilities() {
  const payload = (await $fetch('/api/admin/facilities')) as {
    data: {
      items: AdminFacility[];
    };
  };
  facilities.value = payload.data.items;
}

async function submitFacility() {
  message.value = '';
  errorMessage.value = '';

  try {
    const isUpdate = selectedFacilityId.value.length > 0;
    const payload = {
      name: form.name,
      description: form.description,
      location: form.location,
      isActive: form.isActiveValue === 'true',
    };

    const result = selectedFacilityId.value
      ? ((await $fetch(`/api/admin/facilities/${selectedFacilityId.value}`, {
          method: 'PATCH',
          body: payload,
        })) as { data: { facility: AdminFacility } })
      : ((await $fetch('/api/admin/facilities', {
          method: 'POST',
          body: payload,
        })) as { data: { facility: AdminFacility } });

    await loadFacilities();
    selectFacility(result.data.facility);
    message.value = isUpdate ? '施設を更新しました。' : '施設を登録しました。';
  } catch (error) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } }).data?.error?.message ??
      '施設操作に失敗しました。';
  }
}

await loadFacilities();
</script>
