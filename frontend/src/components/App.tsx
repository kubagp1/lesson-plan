import { useState } from 'react'
import { AppBar, Toolbar } from '@mui/material'
import { Plan } from '../shared/types'
import PlanSelector from './PlanSelector'

export default function App() {
  const [planId, setPlanId] = useState<number | null>(null)

  return (
    <div className="app">
      <AppBar>
        <Toolbar>
          <PlanSelector planId={planId} setPlanId={setPlanId}></PlanSelector>
        </Toolbar>
      </AppBar>
    </div>
  )
}
