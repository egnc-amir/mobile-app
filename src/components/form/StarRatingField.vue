<template>
    <div class="mb-3">
        <label :for="name" class="form-label fw-semibold">
            {{ label }}
            <span v-if="required" class="text-danger">*</span>
        </label>
        <StarRatings
            v-model="fieldValue"
            :number-of-stars="max"
            :star-size="starSize"
            :show-rating="false"
            :id="name"
            class="ms-2 mt-1"
            :class="{ 'is-invalid': errorMessage }"
        />
        <div class="invalid-feedback">{{ errorMessage }}</div>
    </div>
</template>

<script setup>
import StarRatings from "vue3-star-ratings";
import { useField } from "vee-validate";
import { toRef, onMounted, watch } from "vue";

const props = defineProps({
    modelValue: { type: Number, default: 0 },
    name: { type: String, default: "rating" },
    label: { type: String, default: "Rating" },
    max: { type: Number, default: 5 },
    starSize: { type: Number, default: 32 },
    required: { type: Boolean, default: false },
});

const emit = defineEmits(["registerLabel", "update:modelValue"]);

function validateRating(value) {
    if (props.required && (!value || value === 0)) {
        return "Rating is required";
    }
    return true;
}

const { value: fieldValue, errorMessage } = useField(
    toRef(props, "name"),
    validateRating
);

onMounted(() => {
    emit("registerLabel", props.name, props.label);
});

watch(fieldValue, (val) => {
    emit("update:modelValue", val);
});
</script>
