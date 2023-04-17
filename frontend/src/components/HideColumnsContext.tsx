import { createContext, useReducer, Dispatch } from 'react'
import { CategoryName } from '../shared/types'

type ColumnName = 'centerLeft' | 'centerRight' | 'right'

export type Configuration = {
  [key in CategoryName]: {
    [key in ColumnName]: boolean
  }
}

export type Action = {
  category: CategoryName
  column: ColumnName
  value: boolean
}

export function HideColumnsProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [configuration, dispatch] = useReducer(
    configurationReducer,
    initialConfiguration
  )

  return (
    <HideColumnsContext.Provider value={configuration}>
      <HideColumnsDispatchContext.Provider value={dispatch}>
        {children}
      </HideColumnsDispatchContext.Provider>
    </HideColumnsContext.Provider>
  )
}

function configurationReducer(configuration: Configuration, action: Action) {
  const { category, column, value } = action

  return {
    ...configuration,
    [category]: {
      ...configuration[category],
      [column]: value
    }
  }
}

const initialConfiguration: Configuration = {
  class: {
    centerLeft: false,
    centerRight: false,
    right: false
  },
  classroom: {
    centerLeft: false,
    centerRight: false,
    right: false
  },
  teacher: {
    centerLeft: false,
    centerRight: false,
    right: false
  }
}

export const HideColumnsContext =
  createContext<Configuration>(initialConfiguration)
export const HideColumnsDispatchContext = createContext<Dispatch<Action>>(
  () => {}
)
