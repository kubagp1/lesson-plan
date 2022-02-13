import React, { useState } from "react"

import { AppBar, Toolbar } from "@mui/material"

import { Weekday } from "../../shared/types"

import WeekdayTabs from "./WeekdayTabs"
import Categories from "./Categories"
import WeekdayViews from "./WeekdayViews"

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
      <WeekdayTabs weekday={weekday} onChange={handleWeekdayChange} />
      <WeekdayViews
        planId={selectedPlanId}
        selectedWeekday={weekday}
        onChange={handleWeekdayChange}
      />
    </React.Fragment>
  )
}

export default App
