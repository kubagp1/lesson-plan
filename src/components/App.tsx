import React, { useState } from "react"

import { AppBar, Toolbar, Typography } from "@mui/material"

import WeekdayTabs from "./WeekdayTabs"
import Categories from "./Categories"

const App = () => {
  const [weekday, setWeekday] = useState("monday")
  const handleWeekdayChange = (newValue: string) => {
    setWeekday(newValue)
  }

  const [selectedPlanId, setSelectedPlanId] = useState(null as number | null)
  const handlePlanChange = (newValue: number) => {
    setSelectedPlanId(newValue)
  }

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", gap: "16px" }}>
          <Categories onChange={handlePlanChange} />
        </Toolbar>
      </AppBar>

      <WeekdayTabs value={weekday} onChange={handleWeekdayChange} />

      <Typography>
        Selected plan id: {selectedPlanId} <br /> Selected weekday: {weekday}
      </Typography>
    </React.Fragment>
  )
}

export default App
