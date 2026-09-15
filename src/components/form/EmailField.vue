<template>
    <div class="mb-3">
        <label :for="name" class="form-label fw-semibold">
            {{ label }}
            <span v-if="required" class="text-danger">*</span>
        </label>
        <input
            :id="name"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errorMessage }"
            :value="fieldValue"
            @change="onChange"
            @input="onInput"
            :placeholder="placeholder"
        />
        <div class="invalid-feedback">{{ errorMessage }}</div>
    </div>
</template>

<script setup>
import { useField } from "vee-validate";
import { toRef, onMounted } from "vue";

const props = defineProps({
    modelValue: {
        type: String,
        default: "",
    },
    name: { type: String, default: "email" },
    label: { type: String, default: "Email" },
    placeholder: { type: String, default: "Enter your email" },
    restricted: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
});

const emit = defineEmits(["registerLabel", "update:modelValue"]);

function onChange(event) {
    emit("update:modelValue", event.target.value);
}

onMounted(() => {
    emit("registerLabel", props.name, props.label);
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value) {
    if (!value) {
        return props.required ? "Email is required" : true;
    }
    if (props.required && !value) return "Email is required";
    if (!emailRegex.test(value)) return "Invalid email format";

    if (props.restricted) {
        const lower = value.toLowerCase();
        if (!lower.endsWith("gov.bn") && !lower.endsWith("edu.bn")) {
            return "Only @gov.bn or @edu.bn email domains are allowed";
        }
    }

    return true;
}

const { value: fieldValue, errorMessage } = useField(
    toRef(props, "name"),
    validateEmail
);

function onInput(event) {
    fieldValue.value = event.target.value.toLowerCase();
}
</script>
