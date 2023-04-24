import { createContext, useReducer, Dispatch } from 'react'
import { CategoryName } from '../shared/types'

type ColumnName = 'centerLeft' | 'centerRight' | 'right'

export type Configuration = {
  [key in CategoryName]: {
    [key in ColumnName]: boolean
  }
}

export type Action =
  | {
      category: CategoryName
      column: ColumnName
      value: boolean
    }
  | {
      restoreDefaults: true
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
  if ('restoreDefaults' in action) {
    localStorage.removeItem('hideColumns')
    return initialConfiguration
  }

  const { category, column, value } = action

  const newConfiguration = {
    ...configuration,
    [category]: {
      ...configuration[category],
      [column]: value
    }
  }

  localStorage.setItem('hideColumns', JSON.stringify(newConfiguration))

  return newConfiguration
}

const initialConfiguration: Configuration = getFromLocalStorage() ?? {
  class: {
    centerLeft: true,
    centerRight: false,
    right: false
  },
  classroom: {
    centerLeft: false,
    centerRight: false,
    right: true
  },
  teacher: {
    centerLeft: true,
    centerRight: false,
    right: false
  }
}

export const HideColumnsContext =
  createContext<Configuration>(initialConfiguration)
export const HideColumnsDispatchContext = createContext<Dispatch<Action>>(
  () => {}
)

function getFromLocalStorage(): Configuration | null {
  const storedConfiguration = localStorage.getItem('hideColumns')
  if (storedConfiguration === null) return null
  try {
    return JSON.parse(storedConfiguration) as Configuration
  } catch (e) {
    localStorage.removeItem('hideColumns')
    return null
  }
}
