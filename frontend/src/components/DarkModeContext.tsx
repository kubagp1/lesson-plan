import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery
} from '@mui/material'
import { createContext, useReducer } from 'react'

type Option = 'always' | 'never' | 'auto'

type Mode = 'dark' | 'light'

export type Configuration = {
  option: Option
  mode: Mode
  setOption: (option: 'always' | 'never' | 'auto') => void
}

export const DarkModeContext = createContext<Configuration>({
  option: 'auto',
  mode: 'dark',
  setOption: () => {}
})

const defaultOption = 'auto'

/**
 * This component returns a provider and a mui theme provider based on user and system settings
 * 'mode' field is is updated based on the 'option' field and the system settings
 * System settings are accessed using the useMediaQuery('(prefers-color-scheme: dark)')
 * When option is set to 'auto', the theme will be based on the system settings
 * When option is set to 'always', the theme will always be dark
 * When option is set to 'never', the theme will always be light
 * It also saves the option in local storage using the key 'darkMode'
 */
export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [option, setOption] = useReducer(optionReducer, getInitialOption())

  const mode = useMode(option)

  const muiTheme = createTheme({
    palette: {
      mode
    }
  })

  return (
    <DarkModeContext.Provider value={{ option, mode, setOption }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  )
}

function optionReducer(option: Option, newOption: Option) {
  localStorage.setItem('darkMode', newOption)
  return newOption
}

function useMode(option: Option): Mode {
  const systemPreference = useMediaQuery('(prefers-color-scheme: dark)')
    ? 'dark'
    : 'light'

  if (option === 'auto') {
    return systemPreference
  } else if (option === 'always') {
    return 'dark'
  } else {
    return 'light'
  }
}

function getInitialOption(): Option {
  const option = localStorage.getItem('darkMode')
  if (option) {
    return option as Option
  } else {
    return defaultOption
  }
}
