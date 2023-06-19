import { createContext, useEffect, useState } from 'react'
import { AppBar, Toolbar } from '@mui/material'
import PlanSelector from './PlanSelector'
import WeekdayTabs, { getCurrentWeekday } from './WeekdayTabs'
import { Weekday } from '../shared/types'
import { Box } from '@mui/system'
import WeekdaySlider from './WeekdaySlider'
import OptionsMenu from './OptionsMenu'
import { HideColumnsProvider } from './HideColumnsContext'
import { DarkModeProvider } from './DarkModeContext'
import { AppContextProvider } from './AppContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import StalePlanWarningDialog from './StalePlanWarningDialog'
import { WeekdayContextProvider } from './WeekdayContext'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <HideColumnsProvider>
          <DarkModeProvider>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <WeekdayContextProvider>
                <Box
                  sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100 // z-index of AppBar
                    // backgroundColor: '#fff'
                  }}
                >
                  <AppBar position="static">
                    <Toolbar>
                      <Box sx={{ flexGrow: 1 }}>
                        <PlanSelector />
                      </Box>
                      <OptionsMenu />
                    </Toolbar>
                  </AppBar>
                  <WeekdayTabs />
                </Box>
                <WeekdaySlider />
              </WeekdayContextProvider>
            </Box>
            <StalePlanWarningDialog />
          </DarkModeProvider>
        </HideColumnsProvider>
      </AppContextProvider>
    </QueryClientProvider>
  )
}
