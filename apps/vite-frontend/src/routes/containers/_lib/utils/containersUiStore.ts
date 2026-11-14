import { create } from 'zustand'

interface ContainersUiState {
  filter: string
  setFilter: (filter: string) => void
}

export const useContainersUiStore = create<ContainersUiState>()((set) => ({
  filter: '',
  setFilter: (filter) => set({ filter }),
}))
