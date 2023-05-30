import { createContext, useEffect, useState } from 'react'
import { Categories, Plan } from '../shared/types'
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { getCategories, getPlan } from '../apiCalls'
import { flattenCategories } from '../lib/categories'
import { getPlanIdFromUrl } from '../lib/getPlanIdFromUrl'
import { getSavedSessionPlanIdOrDefault } from '../lib/savedSession'

type Query<T> = {
  data: T | undefined
  isLoading: boolean
  isError: boolean
}

const fakeQuery = {
  data: undefined,
  isLoading: true,
  isError: false
}

type AppState = {
  planId: number | null
  setPlanId: (planId: number | null) => void
  plan: Query<Plan>
  categories: Query<Categories>
}

const initialState: AppState = {
  planId: null,
  setPlanId: () => {},
  plan: fakeQuery,
  categories: fakeQuery
}

export const AppContext = createContext(initialState)

export function AppContextProvider({
  children
}: {
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })
  const [planId, setPlanId] = useState<number | null>(null)
  const plan = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => getPlan(planId!),
    enabled: planId !== null
  })

  // runs when categories.data gets fetched first time
  useEffect(() => {
    if (categories.data === undefined) return
    setPlanId(getInitialPlanId(categories.data))
  }, [categories.data !== undefined])

  // listen to url changes
  useEffect(() => {
    const popstateHandler = () => {
      setPlanId(getPlanIdFromUrl())
    }
    window.addEventListener('popstate', popstateHandler)
    return () => window.removeEventListener('popstate', popstateHandler)
  }, [])

  // update url when planId changes
  useEffect(() => {
    if (planId === null) return
    if (planId === getPlanIdFromUrl()) return

    history.pushState(null, '', `/plan/${planId}`)
  }, [planId])

  // update document.title when planId changes
  useEffect(() => {
    if (planId === null) return
    if (categories.data === undefined) return

    const flatCategories = flattenCategories(categories.data)
    const plan = flatCategories.find((p) => p.planId === planId)
    
    document.title = `${plan?.longName} - Plan lekcji`
  }, [planId, categories.data])

  return (
    <AppContext.Provider
      value={{
        planId,
        setPlanId,
        plan,
        categories
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

function getInitialPlanId(categories: Categories): number {
  const flatCategories = flattenCategories(categories)

  const fromUrl = getPlanIdFromUrl()
  if (fromUrl !== null && flatCategories.find((p) => p.planId === fromUrl))
    return fromUrl
  
  return getSavedSessionPlanIdOrDefault(categories)
}