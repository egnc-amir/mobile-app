<template>
  <div class="bg-secondary-subtle banner-gov py-1">
    <div class="container">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <img src="/Emblem_of_Brunei.svg" alt="Emblem of Brunei" width="16" class="me-2" />

          <p class="fw-semibold text-body fs-9 mb-0 d-flex align-items-center">
            A Brunei Government Agency Websites
            <a
              @click="toggleChevron"
              class="ms-1 rotate-chevron"
              type="button"
              id="link"
              data-bs-toggle="collapse"
              data-bs-target="#collapseIdentify"
              aria-expanded="false"
              aria-controls="collapseExample"
            >
              How to identify
              <i
                id="down"
                class="fas fa-chevron-down ms-1 rotate"
                style="transition: transform 0.3s ease"
              ></i>
            </a>
          </p>
        </div>
        <div class="dropdown">
          <button
            class="btn btn-sm py-0 d-md-none fs-8"
            type="button"
            data-bs-toggle="dropdown"
            data-boundary="window"
            aria-haspopup="true"
            aria-expanded="false"
            data-bs-reference="parent"
          >
            <span class="fas fa-ellipsis-h"></span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" style="z-index: 9999">
            <li>
              <a
                class="dropdown-item"
                href="#!"
                data-bs-toggle="modal"
                data-bs-target="#feedbackModal"
              >
                >Send feedback</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#!"
                data-bs-toggle="modal"
                data-bs-target="#reportIssueModal"
                >Report an issue</a
              >
            </li>
          </ul>
        </div>
        <ul class="d-none d-md-flex gap-5 list-unstyled mb-0">
          <li>
            <a
              class="lh-1 text-body-tertiary fw-semibold fs-9"
              href="#!"
              data-bs-toggle="modal"
              data-bs-target="#feedbackModal"
            >
              <i class="fa-regular fa-envelope me-2"></i>Send feedback
            </a>
          </li>
          <li>
            <a
              class="lh-1 text-body-tertiary fw-semibold fs-9"
              href="#!"
              data-bs-toggle="modal"
              data-bs-target="#reportIssueModal"
            >
              <i class="fa-regular fa-circle-question me-2"></i>Report an issue
            </a>
          </li>
        </ul>
      </div>

      <!-- Dropdown Collapse -->
      <div class="collapse" id="collapseIdentify">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-2 g-4 pt-5">
          <div class="col d-flex align-items-start">
            <span>
              <i class="fas fa-building-columns me-3"></i>
            </span>
            <div>
              <h5 class="fw-bold fs-7 text-body-emphasis">
                Official website links end with .gov.bn
              </h5>
              <p>
                Government agencies communicate via .gov.bn websites (e.g. egnc.gov.bn).<br />See
                <a href="https://www.gov.bn/SitePages/trusted-sites.aspx" target="_blank"
                  >trusted websites
                  <span>
                    <i class="fas fa-arrow-up-right-from-square ms-1"></i>
                  </span> </a
                >.
              </p>
            </div>
          </div>
          <div class="col d-flex align-items-start">
            <span>
              <i class="fas fa-lock me-3"></i>
            </span>
            <div>
              <h5 class="fw-bold fs-7 text-body-emphasis">Secure websites use HTTPS</h5>
              <p>
                Look for a lock (<i class="fas fa-lock mx-1"></i>) or https:// as an added
                precaution. Share sensitive information only on official,
                secure websites.
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- //Dropdown Collapse -->
    </div>
  </div>

  <!-- MODAL -->

  <!-- Feedback Modal -->
  <div
    class="modal fade"
    id="feedbackModal"
    tabindex="-1"
    style="display: none"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title" id="exampleModalLabel">Rate your experience</h5>
          <button
            class="btn btn-close p-1"
            type="button"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <Form ref="feedbackForm" @submit="submitFeedback">
          <div class="modal-body">
            <div
              v-if="isSubmitted"
              class="alert alert-subtle-success feedback-success"
              role="alert"
            >
              <i class="bi bi-check-circle me-2"></i>Form Submitted. Thank you for your feedback.
            </div>
            <div v-if="errorMessage" class="alert alert-subtle-danger feedback-error" role="alert">
              <span
                ><i class="bi bi-exclamation-circle me-2"></i>Error. Please try again in few
                minutes.</span
              ><br />
              <small>{{ errorMessage }}</small>
            </div>
            <p class="text-body lh-lg mb-6">
              We would love to hear about your experience. Help us improve our customer experience.
            </p>

            <StarRatingField
              v-model="score"
              name="rating"
              label="Select your rating"
              :star-size="22"
              :required="true"
            ></StarRatingField>

            <TextAreaField
              v-model="description"
              name="description"
              label="Do you have any features you like to improve or add"
              :required="true"
            ></TextAreaField>

            <EmailField
              v-model="userEmail"
              name="email"
              label="contact"
              placeholder="me@egnc.gov.bn"
            ></EmailField>

            <!-- <Recaptcha ref="captchaFeedback"></Recaptcha> -->
          </div>
          <div
            v-if="isSubmitting"
            class="position-absolute top-0 w-100 h-100 bg-body bg-opacity-75"
            style="z-index: 3"
          >
            <div class="h-100 d-flex justify-content-center">
              <div class="align-self-center text-center">
                <div class="spinner mx-auto" role="progressbar" aria-label="Loading"></div>
                <p class="mt-3">Please do not close the window.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-outline-primary" @click="resetFeedbackForm">Reset</button>
            <button class="btn btn-primary" type="submit">Send feedback</button>
          </div>
        </Form>
      </div>
    </div>
  </div>

  <!-- Issue Modal -->
  <div
    class="modal fade"
    id="reportIssueModal"
    tabindex="-1"
    style="display: none"
    data-bs-backdrop="static"
    data-bs-keyboard="false"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title" id="exampleModalLabel">Report an issue</h5>
          <button
            class="btn btn-close p-1"
            type="button"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <Form ref="issueForm" @submit="submitIssue">
          <div class="modal-body">
            <div
              v-if="isSubmitted"
              class="alert alert-subtle-success feedback-success"
              role="alert"
            >
              <i class="bi bi-check-circle me-2"></i>Form Submitted. Thank you for your feedback.
            </div>
            <div v-if="errorMessage" class="alert alert-subtle-danger feedback-error" role="alert">
              <span
                ><i class="bi bi-exclamation-circle me-2"></i>Error. Please try again in few
                minutes.</span
              ><br />
              <small>{{ errorMessage }}</small>
            </div>
            <p class="text-body lh-lg mb-6">
              Fill this in only
              <strong>if you are experiencing issues and are unable to submit this form.</strong>
            </p>
            <EmailField
              name="email"
              label="contact"
              placeholder="me@egnc.gov.bn"
              :required="true"
            ></EmailField>
            <RichTextField
              name="description"
              label="Please describe the issue you encountered"
              :required="true"
            ></RichTextField>
            <FileUploadField
              v-model="issueFile"
              name="upload"
              label="Upload"
              :required="false"
              :multiple="false"
              accept=".png, .jpg, .jpeg, .pdf"
              :maxSizeMB="2"
            ></FileUploadField>
            <!-- <Recaptcha ref="captchaIssue"></Recaptcha> -->
          </div>
          <div
            v-if="isSubmitting"
            class="position-absolute top-0 w-100 h-100 bg-body bg-opacity-75"
            style="z-index: 3"
          >
            <div class="h-100 d-flex justify-content-center">
              <div class="align-self-center text-center">
                <div class="spinner mx-auto" role="progressbar" aria-label="Loading"></div>
                <p class="mt-3 mb-1">{{ submissionMessage }}</p>
                <p>Please do not close the window.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button class="btn btn-outline-primary" @click="resetIssueForm">Reset</button>
            <button class="btn btn-primary" type="submit">Report Issue</button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Form } from 'vee-validate'
import { ref } from 'vue'
import axios from 'axios'
// import { emailFeedback, emailIssue } from '../legacy/email'
// import Recaptcha from "./Form/Recaptcha.vue";

//Component
import StarRatingField from './form/StarRatingField.vue'
import RichTextField from './form/RichTextField.vue'
import EmailField from './form/EmailField.vue'
import FileUploadField from './form/FileUploadField.vue'
import TextAreaField from './form/TextAreaField.vue'

const base = import.meta.env.BASE_URL || ''
const description = ref('')
const score = ref(null)
const userEmail = ref(null)
const issueFile = ref(null)
const isSubmitting = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref(null)
const captchaFeedback = ref(null)
const captchaIssue = ref(null)
const submissionMessage = ref(null)

// Add refs for form components
const feedbackForm = ref(null)
const issueForm = ref(null)

function toggleChevron() {
  let down = document.getElementById('down')
  // Toggle the 'rotate' class
  down.classList.toggle('rotate-180')
}

// Function to reset feedback form fields
function resetFeedbackForm() {
  description.value = ''
  score.value = null
  userEmail.value = null
  captchaFeedback.value?.reset()
  feedbackForm.value?.resetForm()
}

// Function to reset issue form fields
function resetIssueForm() {
  issueFile.value = null
  captchaIssue.value?.reset()
  issueForm.value?.resetForm()
}

async function submitFeedback(formData) {
  isSubmitting.value = true
  const t = captchaFeedback.value?.token || ''
  if (!t) {
    captchaFeedback.value?.setError('Please verify you are not a robot.')
    isSubmitting.value = false
    return
  }
  formData['g-recaptcha-response'] = t

  const url = await window.location.href
  formData.url = url
  formData.systemId = import.meta.env.VITE_SYSTEM_ID

  try {
    const response = await axios.post(
      'https://dev-api-katalyst.egc.gov.bn/general/submit-feedback',
      formData,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GENERAL_TOKEN}`,
        },
      },
    )
    if (response.data.success) {
      let link = import.meta.env.VITE_KATALYST_PORTAL + 'user_feedback?id=' + response.data.id

      const now = new Date()
      const from = userEmail.value && userEmail.value.trim() !== '' ? userEmail.value : 'anonymous'

      //   emailFeedback(link, now.toLocaleString(), from, description.value)

      // Reset form fields after successful submission
      resetFeedbackForm()
    }

    isSubmitting.value = false
    isSubmitted.value = true
  } catch (error) {
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response.data.errors)
      errorMessage.value = 'Validation error. Please check required fields.'
    } else {
      errorMessage.value = error.response?.data?.error || error.message || 'Unknown error occurred'
    }
    isSubmitting.value = false
  }
}

async function submitIssue(value) {
  submissionMessage.value = 'Submitting Form..'
  isSubmitting.value = true

  const t = captchaIssue.value?.token || ''
  if (!t) {
    captchaIssue.value?.setError('Please verify you are not a robot.')
    isSubmitting.value = false
    return
  }
  value['g-recaptcha-response'] = t

  const url = await window.location.href
  value.url = url

  value.fileName = issueFile.value.name
  value.fileType = issueFile.value.type

  try {
    const res = await axios.post('api/submit-issue-form', value, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_GENERAL_TOKEN}`,
      },
    })

    if (res.data.success) {
      let issueId = res.data.id
      let ticketId = res.data.ticket
      const data = new FormData()
      const file = issueFile.value
      data.append('file', file, file.name)
      data.append('id', issueId)
      data.append('case', 'issue')

      submissionMessage.value = 'Uploading File...'
      try {
        const response = await axios.post('api/upload', data)
        if (response.data.success) {
          isSubmitting.value = false
          isSubmitted.value = true

          let link = import.meta.env.VITE_KATALYST_PORTAL + 'issue_report_detail?id=' + issueId

          //   emailIssue(ticketId, link, 'INSPIRE Portal')
          // Reset form fields after successful submission
          resetIssueForm()
        } else {
          errorMessage.value = response.data.massage
        }
      } catch (err) {
        if (err.response?.status === 422) {
          console.error('Validation errors:', err.response.data.errors)
          errorMessage.value = 'Validation error. Please check required fields.'
        } else {
          errorMessage.value = err.response?.data?.error || err.message || 'Unknown error occurred'
        }
        isSubmitting.value = false
      }
    }
  } catch (error) {
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response.data.errors)
      errorMessage.value = 'Validation error. Please check required fields.'
    } else {
      errorMessage.value = error.response?.data?.error || error.message || 'Unknown error occurred'
    }
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.bs-popover-auto[data-popper-placement^='bottom'] > .popover-arrow:after,
.bs-popover-bottom > .popover-arrow:after {
  border-bottom-color: #222834;
}

.banner-gov {
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

@media (max-width: 1000px) {
  .banner-gov {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.rotate {
  display: inline-block;
  transition: all 0.5s ease-in-out 0s;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
