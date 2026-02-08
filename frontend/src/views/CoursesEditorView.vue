<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiRequest } from '@/lib/api'
import { logout } from '@/lib/session'

interface Course {
  id: number
  name: string
  description: string
  duration: number
}

const router = useRouter()

const courses = ref<Course[]>([])
const isLoading = ref(false)
const errorText = ref('')
const successText = ref('')

const createForm = reactive({
  name: '',
  description: '',
  duration: 1,
})

function setError(message: string): void {
  errorText.value = message
  successText.value = ''
}

function setSuccess(message: string): void {
  successText.value = message
  errorText.value = ''
}

async function loadCourses(): Promise<void> {
  isLoading.value = true
  errorText.value = ''

  try {
    courses.value = await apiRequest<Course[]>('/courses')
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to load courses')
  } finally {
    isLoading.value = false
  }
}

async function createCourse(): Promise<void> {
  try {
    await apiRequest('/courses', {
      method: 'POST',
      body: {
        name: createForm.name,
        description: createForm.description,
        duration: Number(createForm.duration),
      },
    })

    createForm.name = ''
    createForm.description = ''
    createForm.duration = 1

    setSuccess('Course created')
    await loadCourses()
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to create course')
  }
}

async function saveCourse(course: Course): Promise<void> {
  try {
    await apiRequest(`/courses/${course.id}`, {
      method: 'PATCH',
      body: { parameter: 'name', value: course.name },
    })

    await apiRequest(`/courses/${course.id}`, {
      method: 'PATCH',
      body: { parameter: 'description', value: course.description },
    })

    await apiRequest(`/courses/${course.id}`, {
      method: 'PATCH',
      body: { parameter: 'duration', value: Number(course.duration) },
    })

    setSuccess(`Course #${course.id} saved`)
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to save course')
  }
}

async function deleteCourse(id: number): Promise<void> {
  try {
    await apiRequest(`/courses/${id}`, { method: 'DELETE' })
    setSuccess(`Course #${id} deleted`)
    await loadCourses()
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to delete course')
  }
}

async function handleLogout(): Promise<void> {
  await logout()
  await router.push('/login')
}

onMounted(() => {
  void loadCourses()
})
</script>

<template>
  <main class="page">
    <div class="container stack">
      <header class="toolbar">
        <h1>Courses</h1>
        <button @click="handleLogout">Logout</button>
      </header>

      <section class="card stack">
        <h2>New course</h2>
        <form class="form-grid" @submit.prevent="createCourse">
          <input v-model.trim="createForm.name" type="text" placeholder="Name" required />
          <input
            v-model.trim="createForm.description"
            type="text"
            placeholder="Description"
            required
          />
          <input v-model.number="createForm.duration" type="number" min="1" required />
          <button type="submit">Create</button>
        </form>
      </section>

      <p v-if="successText" class="message">{{ successText }}</p>
      <p v-if="errorText" class="error">{{ errorText }}</p>

      <p v-if="isLoading" class="muted">Loading...</p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courses" :key="course.id">
              <td>{{ course.id }}</td>
              <td><input v-model.trim="course.name" type="text" /></td>
              <td><input v-model.trim="course.description" type="text" /></td>
              <td><input v-model.number="course.duration" type="number" min="1" /></td>
              <td>
                <div class="row">
                  <button @click="saveCourse(course)">Save</button>
                  <button @click="deleteCourse(course.id)">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="courses.length === 0">
              <td colspan="5" class="muted">No courses</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>
