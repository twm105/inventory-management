<template>
  <div class="app-layout">
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-logo" v-show="!isCollapsed">
          <h1>{{ t('nav.companyName') }}</h1>
          <span class="sidebar-subtitle">{{ t('nav.subtitle') }}</span>
        </div>
        <button class="collapse-toggle" @click="toggleSidebar" :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" :style="{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }" :title="isCollapsed ? t('nav.overview') : undefined">
          <span v-if="isCollapsed" class="nav-badge">{{ t('nav.overview').charAt(0) }}</span>
          <span v-else class="nav-label">{{ t('nav.overview') }}</span>
        </router-link>
        <router-link to="/inventory" class="nav-item" :class="{ active: $route.path === '/inventory' }" :title="isCollapsed ? t('nav.inventory') : undefined">
          <span v-if="isCollapsed" class="nav-badge">{{ t('nav.inventory').charAt(0) }}</span>
          <span v-else class="nav-label">{{ t('nav.inventory') }}</span>
        </router-link>
        <router-link to="/orders" class="nav-item" :class="{ active: $route.path === '/orders' }" :title="isCollapsed ? t('nav.orders') : undefined">
          <span v-if="isCollapsed" class="nav-badge">{{ t('nav.orders').charAt(0) }}</span>
          <span v-else class="nav-label">{{ t('nav.orders') }}</span>
        </router-link>
        <router-link to="/spending" class="nav-item" :class="{ active: $route.path === '/spending' }" :title="isCollapsed ? t('nav.finance') : undefined">
          <span v-if="isCollapsed" class="nav-badge">{{ t('nav.finance').charAt(0) }}</span>
          <span v-else class="nav-label">{{ t('nav.finance') }}</span>
        </router-link>
        <router-link to="/demand" class="nav-item" :class="{ active: $route.path === '/demand' }" :title="isCollapsed ? t('nav.demandForecast') : undefined">
          <span v-if="isCollapsed" class="nav-badge">{{ t('nav.demandForecast').charAt(0) }}</span>
          <span v-else class="nav-label">{{ t('nav.demandForecast') }}</span>
        </router-link>
        <router-link to="/reports" class="nav-item" :class="{ active: $route.path === '/reports' }" :title="isCollapsed ? t('nav.reports') : undefined">
          <span v-if="isCollapsed" class="nav-badge">{{ t('nav.reports').charAt(0) }}</span>
          <span v-else class="nav-label">{{ t('nav.reports') }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <LanguageSwitcher />
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </div>
    </aside>

    <div class="content-area" :class="{ 'sidebar-collapsed': isCollapsed }">
      <FilterBar />
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import { useSidebar } from './composables/useSidebar'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const { isCollapsed, toggleSidebar } = useSidebar()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      isCollapsed,
      toggleSidebar,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f8fafc;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-layout {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
}

/* SIDEBAR */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 240px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.3s ease;
  overflow: visible;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #1e293b;
  min-height: 70px;
  flex-shrink: 0;
}

.sidebar-logo {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
  min-width: 0;
}

.sidebar-logo h1 {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.025em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-subtitle {
  font-size: 0.688rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.collapse-toggle:hover {
  background: #1e293b;
  color: #e2e8f0;
  border-color: #475569;
}

.collapse-toggle svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 1.25rem 0.5rem;
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  overflow-x: visible;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.nav-item:hover {
  color: #e2e8f0;
  background: #1e293b;
}

.nav-item.active {
  color: #ffffff;
  background: #2563eb;
}

.nav-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 600;
  background: #1e293b;
  color: #94a3b8;
}

.nav-item.active .nav-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.625rem 0;
}

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: visible;
}

.sidebar.collapsed .sidebar-footer {
  align-items: center;
}

/* CONTENT AREA */
.content-area {
  margin-left: 240px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.content-area.sidebar-collapsed {
  margin-left: 60px;
}

.main-content {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

/* Sidebar footer overrides for dark background */
.sidebar-footer .profile-button {
  background: transparent !important;
  color: #94a3b8 !important;
  border-color: #334155 !important;
}

.sidebar-footer .profile-button:hover {
  background: #1e293b !important;
  color: #e2e8f0 !important;
}

.sidebar-footer .dropdown-menu {
  left: calc(100% + 0.5rem) !important;
  right: auto !important;
  bottom: 0 !important;
  top: auto !important;
}

.sidebar-footer .language-button {
  background: transparent !important;
  color: #94a3b8 !important;
  border-color: #334155 !important;
}

.sidebar-footer .language-button:hover {
  background: #1e293b !important;
  color: #e2e8f0 !important;
}

.sidebar-footer .language-dropdown {
  left: calc(100% + 0.5rem) !important;
  right: auto !important;
  bottom: 0 !important;
  top: auto !important;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.page-header p {
  color: #64748b;
  font-size: 0.938rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.625rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: #ea580c;
}

.stat-card.success .stat-value {
  color: #059669;
}

.stat-card.danger .stat-value {
  color: #dc2626;
}

.stat-card.info .stat-value {
  color: #2563eb;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: #475569;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: #f8fafc;
}

.badge {
  display: inline-block;
  padding: 0.313rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.warning {
  background: #fed7aa;
  color: #92400e;
}

.badge.danger {
  background: #fecaca;
  color: #991b1b;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.badge.increasing {
  background: #d1fae5;
  color: #065f46;
}

.badge.decreasing {
  background: #fecaca;
  color: #991b1b;
}

.badge.stable {
  background: #e0e7ff;
  color: #3730a3;
}

.badge.high {
  background: #fecaca;
  color: #991b1b;
}

.badge.medium {
  background: #fed7aa;
  color: #92400e;
}

.badge.low {
  background: #dbeafe;
  color: #1e40af;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 0.938rem;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.938rem;
}
</style>
