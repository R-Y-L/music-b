import { create } from 'zustand'

export type User = {
  id: string
  name: string
  avatar: string
  role: 'creator' | 'listener'
}

type AppState = {
  user: User | null
  likes: Record<string, boolean>
  login: (name: string) => void
  logout: () => void
  toggleLike: (workId: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: 'u-001',
    name: 'Demo Creator',
    avatar: 'https://i.pravatar.cc/100?img=5',
    role: 'creator',
  },
  likes: {},
  login: (name) =>
    set({
      user: {
        id: crypto.randomUUID(),
        name,
        avatar: 'https://i.pravatar.cc/100?img=40',
        role: 'creator',
      },
    }),
  logout: () => set({ user: null }),
  toggleLike: (workId) =>
    set((state) => {
      const next = { ...state.likes }
      next[workId] = !next[workId]
      return { likes: next }
    }),
}))
