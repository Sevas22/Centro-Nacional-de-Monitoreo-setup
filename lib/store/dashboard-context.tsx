'use client'

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react'

export interface DashboardFilters {
  dateRange: string
  source: string
  department: string
  category: string
  sentiment: string
  query: string
}

interface DashboardState {
  filters: DashboardFilters
  selectedDepartment: string | null
  newsDetailId: string | null
}

const defaultFilters: DashboardFilters = {
  dateRange: 'Hoy',
  source: 'Todas',
  department: 'Todos',
  category: 'Todas',
  sentiment: 'Todos',
  query: '',
}

const initialState: DashboardState = {
  filters: defaultFilters,
  selectedDepartment: null,
  newsDetailId: null,
}

type Action =
  | { type: 'SET_FILTER'; field: keyof DashboardFilters; value: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SELECT_DEPARTMENT'; id: string | null }
  | { type: 'SET_NEWS_DETAIL'; id: string }
  | { type: 'CLOSE_NEWS_DETAIL' }

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.field]: action.value } }
    case 'CLEAR_FILTERS':
      return { ...state, filters: defaultFilters, selectedDepartment: null }
    case 'SELECT_DEPARTMENT':
      return {
        ...state,
        selectedDepartment: action.id,
        filters: { ...state.filters, department: action.id ?? 'Todos' },
      }
    case 'SET_NEWS_DETAIL':
      return { ...state, newsDetailId: action.id }
    case 'CLOSE_NEWS_DETAIL':
      return { ...state, newsDetailId: null }
    default:
      return state
  }
}

interface DashboardContextValue {
  state: DashboardState
  setFilter: (field: keyof DashboardFilters, value: string) => void
  clearFilters: () => void
  selectDepartment: (id: string | null) => void
  openNewsDetail: (id: string) => void
  closeNewsDetail: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setFilter = useCallback((field: keyof DashboardFilters, value: string) => {
    dispatch({ type: 'SET_FILTER', field, value })
  }, [])
  const clearFilters = useCallback(() => dispatch({ type: 'CLEAR_FILTERS' }), [])
  const selectDepartment = useCallback((id: string | null) => dispatch({ type: 'SELECT_DEPARTMENT', id }), [])
  const openNewsDetail = useCallback((id: string) => dispatch({ type: 'SET_NEWS_DETAIL', id }), [])
  const closeNewsDetail = useCallback(() => dispatch({ type: 'CLOSE_NEWS_DETAIL' }), [])

  const value = useMemo(
    () => ({ state, setFilter, clearFilters, selectDepartment, openNewsDetail, closeNewsDetail }),
    [state, setFilter, clearFilters, selectDepartment, openNewsDetail, closeNewsDetail],
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
