<template>
    <div class="mb-3">
        <label :for="name" class="form-label fw-semibold">
            {{ label }}
            <span v-if="required" class="text-danger">*</span>
        </label>

        <textarea
            :id="name"
            :rows="rows"
            :placeholder="placeholder"
            :disabled="disabled"
            class="form-control"
            :class="{ 'is-invalid': errorMessage }"
            v-model="fieldValue"
        ></textarea>

        <div class="invalid-feedback">{{ errorMessage }}</div>
    </div>
</template>

<script setup>
import { useField } from "vee-validate";
import { toRef, watch } from "vue";

const props = defineProps({
    modelValue: {
        type: String,
        default: "",
    },
    name: { type: String, default: "textarea" },
    label: { type: String, default: "Textarea" },
    placeholder: { type: String, default: "" },
    rows: { type: Number, default: 4 },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
});

const emit = defineEmits(["update:modelValue"]);

function validateTextarea(value) {
    const trimmed = typeof value === "string" ? value.trim() : value;

    if (props.required && !trimmed) {
        return `${props.label} is required`;
    }

    return true;
}

const { value: fieldValue, errorMessage } = useField(
    toRef(props, "name"),
    validateTextarea,
    {
        initialValue: props.modelValue,
    }
);

// Emit the value on change
watch(fieldValue, (val) => {
  emit("update:modelValue", val);
});

// Watch disabled and clear when it's true
watch(
  () => props.disabled,
  (isDisabled) => {
    if (isDisabled) {
      fieldValue.value = ""; // Clear textarea
    }
  }
);
</script>
