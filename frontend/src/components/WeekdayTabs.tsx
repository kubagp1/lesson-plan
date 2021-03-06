import React, { useState } from "react"

import { Weekday, WEEKDAYS } from "../shared/types"

import { Tabs, Tab } from "@mui/material"

export function getCurrentWeekday(): Weekday {
  const date = new Date()
  var weekdayNumber = date.getDay()
  if (weekdayNumber > 5 || weekdayNumber < 1) weekdayNumber = 1

  return WEEKDAYS[weekdayNumber - 1]
}

interface Props {
  weekday: Weekday
  onChange: (newValue: Weekday) => void
}

class WeekdayTabs extends React.Component<Props> {
  handleTabChange(event: React.SyntheticEvent, newValue: Weekday) {
    this.props.onChange(newValue)
  }

  render() {
    return (
      <Tabs
        variant="fullWidth"
        value={this.props.weekday}
        onChange={this.handleTabChange.bind(this)}
      >
        <Tab sx={{ minWidth: 0 }} value="monday" label="Pon."></Tab>
        <Tab sx={{ minWidth: 0 }} value="tuesday" label="Wt."></Tab>
        <Tab sx={{ minWidth: 0 }} value="wednesday" label="Śr."></Tab>
        <Tab sx={{ minWidth: 0 }} value="thursday" label="Czw."></Tab>
        <Tab sx={{ minWidth: 0 }} value="friday" label="Pt."></Tab>
      </Tabs>
    )
  }
}

export default WeekdayTabs
