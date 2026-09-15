<template>
    <div class="mb-3">
        <label :for="name" class="form-label fw-semibold">
            {{ label }}
            <span v-if="required" class="text-danger">*</span>
        </label>

        <input
            type="file"
            class="form-control"
            :id="name"
            :multiple="multiple"
            :accept="accept"
            :class="{ 'is-invalid': errorMessage }"
            @change="handleChange"
        />

        <div class="text-body-quaternary">
            <small
                >*Max upload {{ maxSizeMB }} MB
                <span v-if="accept">({{ accept }})</span></small
            >
        </div>
        <div class="invalid-feedback d-block">{{ errorMessage }}</div>

        <!-- File preview (works for both single and multiple) -->
        <ul class="list-group mt-2" v-if="selectedFiles.length">
            <li
                v-for="(file, index) in selectedFiles"
                :key="file.name + index"
                class="list-group-item d-flex justify-content-between align-items-center"
            >
                <span>
                    {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }}
                    MB)
                </span>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="removeFile(index)"
                >
                    Remove
                </button>
            </li>
        </ul>

        <div class="form-text" v-if="hint">{{ hint }}</div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useField } from "vee-validate";

const props = defineProps({
    name: { type: String, default: "fileUpload" },
    label: { type: String, default: "Upload File" },
    hint: { type: String, default: "" },
    required: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    accept: { type: String, default: "" },
    maxSizeMB: { type: Number, default: 5 },
    modelValue: { type: [File, Array], default: null }, // <-- add this
});

const emit = defineEmits(["update:modelValue"]);

const selectedFiles = ref(
    props.multiple
        ? Array.isArray(props.modelValue)
            ? props.modelValue
            : []
        : props.modelValue
        ? [props.modelValue]
        : []
);

// Watch for external v-model changes
watch(
    () => props.modelValue,
    (newVal) => {
        if (props.multiple) {
            selectedFiles.value = Array.isArray(newVal) ? newVal : [];
        } else {
            selectedFiles.value = newVal ? [newVal] : [];
        }
    }
);

function validate(files) {
    if (props.required && (!files || files.length === 0)) {
        return "File is required";
    }
    return true;
}

const {
    value,
    errorMessage,
    setTouched,
    validate: triggerValidation,
} = useField(props.name, validate);

function isAllowedType(file) {
    if (!props.accept) return true;

    const allowed = props.accept.split(",").map((t) => t.trim().toLowerCase());
    const ext = file.name.includes(".")
        ? `.${file.name.split(".").pop().toLowerCase()}`
        : "";

    if (ext && allowed.includes(ext)) return true;

    const mime = (file.type || "").toLowerCase();
    if (
        mime &&
        allowed.some((a) =>
            a.endsWith("/*") ? mime.startsWith(a.replace("/*", "")) : a === mime
        )
    ) {
        return true;
    }

    return false;
}

function isAllowedSize(file) {
    return file.size <= props.maxSizeMB * 1024 * 1024;
}

function handleChange(event) {
    const files = Array.from(event.target.files || []);
    const invalids = [];
    const valids = [];

    for (const file of files) {
        const reasons = [];
        if (!isAllowedType(file)) reasons.push("type not allowed");
        if (!isAllowedSize(file)) reasons.push(`exceeds ${props.maxSizeMB}MB`);
        if (reasons.length) {
            invalids.push({ file, reasons });
        } else {
            valids.push(file);
        }
    }

    if (invalids.length) {
        const msg = invalids
            .map(
                ({ file, reasons }) =>
                    `• ${file.name} (${(file.size / 1024 / 1024).toFixed(
                        2
                    )} MB): ${reasons.join(", ")}`
            )
            .join("\n");
        window.alert(
            `Some files were not added:\n${msg}${
                props.accept ? `\n\nAllowed: ${props.accept}` : ""
            }`
        );
    }

    let uniqueFiles = [];
    if (props.multiple) {
        const merged = [...selectedFiles.value, ...valids];
        uniqueFiles = merged.filter(
            (file, index, self) =>
                index ===
                self.findIndex(
                    (f) => f.name === file.name && f.size === file.size
                )
        );
    } else {
        uniqueFiles = valids.length ? [valids[0]] : selectedFiles.value;
    }

    selectedFiles.value = props.multiple
        ? uniqueFiles
        : uniqueFiles.slice(0, 1);

    // Sync vee-validate field value
    value.value = props.multiple
        ? [...selectedFiles.value]
        : selectedFiles.value[0] || null;

    // Emit v-model update
    emit(
        "update:modelValue",
        props.multiple
            ? [...selectedFiles.value]
            : selectedFiles.value[0] || null
    );

    if (selectedFiles.value.length) {
        setTouched(true);
        triggerValidation();
    }

    event.target.value = "";
}

function removeFile(index) {
    selectedFiles.value.splice(index, 1);
    value.value = props.multiple
        ? [...selectedFiles.value]
        : selectedFiles.value[0] || null;

    emit(
        "update:modelValue",
        props.multiple
            ? [...selectedFiles.value]
            : selectedFiles.value[0] || null
    );

    triggerValidation();
}
</script>
