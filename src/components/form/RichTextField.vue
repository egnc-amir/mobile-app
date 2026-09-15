<template>
    <div class="mb-3">
        <label :for="name" class="form-label fw-semibold">
            {{ label }}
            <span v-if="required" class="text-danger">*</span>
        </label>

        <!-- Styled wrapper div -->
        <div
            class="quill-wrapper rounded"
            :class="{ 'is-invalid': errorMessage }"
        >
            <div :id="editorId" class="quill-editor" />
        </div>

        <div class="invalid-feedback d-block">{{ errorMessage }}</div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useField } from "vee-validate";
import Quill from "quill";
import { Delta } from "quill";
import "quill/dist/quill.snow.css";

const props = defineProps({
    name: { type: String, default: "richtext" },
    label: { type: String, default: "Rich Text" },
    required: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]); // <-- add this

function validate(value) {
    const plain = value?.replace(/<[^>]+>/g, "").trim();
    if (props.required && !plain) return `This field is required`;
    return true;
}

const {
    value,
    errorMessage,
    validate: validateField,
} = useField(props.name, validate);

const editor = ref(null);
const editorId = `editor-${props.name}`;

onMounted(() => {
    editor.value = new Quill(`#${editorId}`, {
        theme: "snow",
        modules: {
            toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }],
                [{ align: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
            ],
        },
    });

    editor.value.on("text-change", () => {
        // Remove any img tags that appear in the editor
        const images = editor.value.root.querySelectorAll("img");
        images.forEach((img) => img.remove());

        const html = editor.value.root.innerHTML;
        value.value = html;
        emit("update:modelValue", html);
        validateField();
    });

    // Set initial value from v-model
    if (props.modelValue) {
        editor.value.root.innerHTML = props.modelValue;
        value.value = props.modelValue;
    }

    if (value.value) {
        editor.value.root.innerHTML = value.value;
    }

    // Prevent image uploads via paste or drag
    editor.value.getModule("clipboard").addMatcher("img", () => {
        return new Delta(); // discard the image
    });

    editor.value.root.addEventListener("drop", (e) => {
        const hasImage = [...(e.dataTransfer?.items || [])].some((item) =>
            item.type.startsWith("image/")
        );
        if (hasImage) {
            e.preventDefault();
        }
    });

    editor.value.root.addEventListener("paste", (e) => {
        const hasImage = [...(e.clipboardData?.items || [])].some((item) =>
            item.type.startsWith("image/")
        );
        if (hasImage) {
            e.preventDefault();
        }
    });
});

// Watch for external v-model changes
watch(
    () => props.modelValue,
    (newVal) => {
        if (editor.value && editor.value.root.innerHTML !== newVal) {
            editor.value.root.innerHTML = newVal || "";
            value.value = newVal || "";
        }
    }
);

onBeforeUnmount(() => {
    editor.value = null;
});
</script>

<style scoped>
.quill-wrapper {
    padding: 0.5rem;
    min-height: 200px;
}

.quill-wrapper.is-invalid {
    border: 1px solid #dc3545;
    box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.quill-editor {
    min-height: 150px;
}
</style>
