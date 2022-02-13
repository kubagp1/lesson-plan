import React, { useState } from "react"

import { Tabs, Tab, SelectChangeEvent } from "@mui/material"

interface WeekdayTabsProps {
  value?: string
  onChange?: (newValue: string) => void
}

function WeekdayTabs(props: WeekdayTabsProps) {
  const [weekday, setWeekday] = useState(props.value || "monday")

  function handleTabChange(event: React.SyntheticEvent, newValue: string) {
    setWeekday(newValue)
    props.onChange?.(newValue)
  }

  return (
    <Tabs variant="fullWidth" value={weekday} onChange={handleTabChange}>
      <Tab sx={{ minWidth: 0 }} value="monday" label="Pon."></Tab>
      <Tab sx={{ minWidth: 0 }} value="tuesday" label="Wt."></Tab>
      <Tab sx={{ minWidth: 0 }} value="wednesday" label="Śr."></Tab>
      <Tab sx={{ minWidth: 0 }} value="thursday" label="Czw."></Tab>
      <Tab sx={{ minWidth: 0 }} value="friday" label="Pt."></Tab>
    </Tabs>
  )
}

export default WeekdayTabs
