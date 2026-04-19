<template>
  <section class="resource-page">
    <div class="resource-page__copy">
      <p class="resource-page__eyebrow">Admin Equipments</p>
      <h2 class="resource-page__title">設備管理</h2>
      <p class="resource-page__description">
        設備を施設配下で管理し、利用可否や所属施設を調整します。
      </p>
    </div>

    <div class="stack-grid">
      <section class="resource-card">
        <div class="resource-card__actions">
          <button type="button" class="button button--ghost" @click="startCreate">
            新規登録
          </button>
          <button type="button" class="button button--ghost" @click="loadEquipments">
            再読み込み
          </button>
        </div>

        <ul class="list">
          <li v-for="equipment in equipments" :key="equipment.id">
            <div>
              <strong>{{ equipment.name }}</strong>
              <p class="resource-card__meta">
                {{ equipment.facilityName }} / {{ equipment.isActive ? '利用可能' : '停止中' }}
              </p>
            </div>
            <button type="button" class="button button--ghost" @click="selectEquipment(equipment)">
              編集
            </button>
          </li>
        </ul>
      </section>

      <section class="resource-card">
        <h3 class="resource-card__title">
          {{ selectedEquipmentId ? '設備を更新' : '設備を登録' }}
        </h3>

        <form class="form" @submit.prevent="submitEquipment">
          <label>
            <span>所属施設</span>
            <select v-model="form.facilityId" required>
              <option v-for="facility in facilities" :key="facility.id" :value="facility.id">
                {{ facility.name }}
              </option>
            </select>
          </label>

          <label>
            <span>設備名</span>
            <input v-model="form.name" type="text" required />
          </label>

          <label>
            <span>説明</span>
            <textarea v-model="form.description" rows="3" required />
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
              {{ selectedEquipmentId ? '更新する' : '登録する' }}
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

type FacilityOption = {
  id: string;
  name: string;
};

type AdminEquipment = {
  id: string;
  facilityId: string;
  facilityName: string;
  name: string;
  description: string;
  isActive: boolean;
};

const selectedEquipmentId = ref('');
const facilities = ref<FacilityOption[]>([]);
const equipments = ref<AdminEquipment[]>([]);
const message = ref('');
const errorMessage = ref('');
const form = reactive({
  facilityId: '',
  name: '',
  description: '',
  isActiveValue: 'true',
});

function resetForm() {
  selectedEquipmentId.value = '';
  form.facilityId = facilities.value[0]?.id ?? '';
  form.name = '';
  form.description = '';
  form.isActiveValue = 'true';
}

function startCreate() {
  resetForm();
  message.value = '';
  errorMessage.value = '';
}

function selectEquipment(equipment: AdminEquipment) {
  selectedEquipmentId.value = equipment.id;
  form.facilityId = equipment.facilityId;
  form.name = equipment.name;
  form.description = equipment.description;
  form.isActiveValue = String(equipment.isActive);
  message.value = '';
  errorMessage.value = '';
}

async function loadFacilities() {
  const payload = (await $fetch('/api/admin/facilities')) as {
    data: {
      items: FacilityOption[];
    };
  };
  facilities.value = payload.data.items;
  if (!form.facilityId) {
    form.facilityId = facilities.value[0]?.id ?? '';
  }
}

async function loadEquipments() {
  const payload = (await $fetch('/api/admin/equipments')) as {
    data: {
      items: AdminEquipment[];
    };
  };
  equipments.value = payload.data.items;
}

async function submitEquipment() {
  message.value = '';
  errorMessage.value = '';

  try {
    const isUpdate = selectedEquipmentId.value.length > 0;
    const payload = {
      facilityId: form.facilityId,
      name: form.name,
      description: form.description,
      isActive: form.isActiveValue === 'true',
    };

    const result = selectedEquipmentId.value
      ? ((await $fetch(`/api/admin/equipments/${selectedEquipmentId.value}`, {
          method: 'PATCH',
          body: payload,
        })) as { data: { equipment: AdminEquipment } })
      : ((await $fetch('/api/admin/equipments', {
          method: 'POST',
          body: payload,
        })) as { data: { equipment: AdminEquipment } });

    await loadEquipments();
    selectEquipment(result.data.equipment);
    message.value = isUpdate ? '設備を更新しました。' : '設備を登録しました。';
  } catch (error) {
    errorMessage.value =
      (error as { data?: { error?: { message?: string } } }).data?.error?.message ??
      '設備操作に失敗しました。';
  }
}

await Promise.all([loadFacilities(), loadEquipments()]);
</script>
