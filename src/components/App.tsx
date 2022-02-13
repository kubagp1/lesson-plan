import React, { useState } from "react"

import { AppBar, Toolbar, Typography } from "@mui/material"

import { Weekday } from "../../shared/types"

import WeekdayTabs from "./WeekdayTabs"
import Categories from "./Categories"
import WeekdayTab from "./WeekdayTab"

const App = () => {
  const [weekday, setWeekday] = useState("monday" as Weekday)
  const handleWeekdayChange = (newValue: Weekday) => {
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

      <WeekdayTab planId={selectedPlanId} weekday={weekday} />
    </React.Fragment>
  )
}

export default App
