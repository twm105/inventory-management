import { ref } from 'vue'

const isCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')

export function useSidebar() {
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('sidebar-collapsed', isCollapsed.value)
  }

  return { isCollapsed, toggleSidebar }
}
