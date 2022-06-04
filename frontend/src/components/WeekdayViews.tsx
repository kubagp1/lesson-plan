import React from "react"

import {
  Box,
  Link,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from "@mui/material"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import CircularProgress from "@mui/material/CircularProgress"

import { IPlan, IPlanEntry, Weekday, WEEKDAYS } from "../../shared/types"
import apiCalls, { plan } from "../apiCalls"
import SwipeableViews from "react-swipeable-views"

import { getCurrentWeekday } from "./WeekdayTabs"

function getSecondsSinceMidnight(): number {
  const date = new Date()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  // I'm not using seconds because it would cause unnecessary updates to the UI
  return hours * 3600 + minutes * 60
}

function getTimeRange(str: string): [number, number] {
  try {
    const [start, end] = str.split("-")

    const [startHours, startMinutes] = start.split(":").map(Number) // Never use parseInt() in this case https://medium.com/dailyjs/parseint-mystery-7c4368ef7b21
    const [endHours, endMinutes] = end.split(":").map(Number)

    const startSeconds = startHours * 3600 + startMinutes * 60
    const endSeconds = endHours * 3600 + endMinutes * 60

    return [startSeconds, endSeconds]
  } catch {
    return [-1, -1]
  }
}

function shouldBeHighlighted(
  timeRange: [number, number],
  previousEnd: number,
  time: number
): boolean {
  const [start, end] = timeRange

  if (previousEnd === -1) return time >= start && time <= end

  if (start === -1 || end === -1) return false

  return time > previousEnd && time <= end
}

type Props = {
  planId: number | null
  selectedWeekday: Weekday
  onChange: (newValue: Weekday) => void
}

type State = {
  displayedPlan: IPlan | null
  loading: boolean
  error: boolean
  currentTime: number
}

export default class WeekdayViews extends React.Component<Props, State> {
  interval: number | null = null

  constructor(props: Props) {
    super(props)

    this.state = {
      displayedPlan: null,
      loading: false,
      error: false,
      currentTime: getSecondsSinceMidnight()
    }

    new BroadcastChannel("cache-update").addEventListener("message", event => {
      if (event.data.type === "plan") {
        this.fetchPlan()
      }
    })
  }

  fetchPlan() {
    if (this.props.planId === null) {
      return
    }

    this.setState({
      loading: true,
      error: false
    })

    const requestedPlanId = this.props.planId

    apiCalls
      .plan(requestedPlanId)
      .then(plan => {
        if (this.props.planId !== requestedPlanId) {
          return
        }
        this.setState({
          displayedPlan: plan,
          loading: false
        })
      })
      .catch(() => {
        if (this.props.planId !== requestedPlanId) {
          return
        }
        this.setState({
          displayedPlan: null,
          loading: false,
          error: true
        })
      })
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.planId !== this.props.planId) this.fetchPlan()

    return true
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      const currentTime = getSecondsSinceMidnight()

      if (currentTime !== this.state.currentTime) {
        this.setState({
          currentTime
        })
      }
    }, 1000)
  }

  componentWillUnmount() {
    if (this.interval !== null) clearInterval(this.interval)
  }

  handleTabSwipe(index: number) {
    const newWeekday = WEEKDAYS[index]
    if (newWeekday !== this.props.selectedWeekday) {
      this.props.onChange(newWeekday)
    }
  }

  errorMessage = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: "64px",
        px: "32px",
        gap: "16px"
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: "64px" }} />
      <Typography textAlign="center">
        Wystąpił błąd podczas ładowania planu. Spróbuj ponownie później.
      </Typography>
      <Link href="https://zst-radom.edu.pl/plan_www/" variant="button">
        Przejdź do starszej strony planu
      </Link>
    </Box>
  )

  loadingMessage = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: "64px",
        px: "32px",
        gap: "16px"
      }}
    >
      <CircularProgress />
    </Box>
  )

  render() {
    if (this.state.error) {
      return this.errorMessage
    }

    if (this.state.loading) {
      return this.loadingMessage
    }

    var swipeableViews: JSX.Element[] = []

    for (const weekday of WEEKDAYS) {
      swipeableViews.push(
        <Table key={weekday}>
          <TableBody>
            {this.state.displayedPlan?.hours.map((hour, index, hours) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor:
                    weekday === getCurrentWeekday() &&
                    shouldBeHighlighted(
                      getTimeRange(hour),
                      getTimeRange(hours[index - 1])[1],
                      this.state.currentTime
                    )
                      ? "lightcyan"
                      : undefined
                }}
              >
                <TableCell>{hour}</TableCell>
                <TableCell>
                  {this.state.displayedPlan?.lessons[weekday][index]
                    ?.filter<IPlanEntry>(
                      (entry): entry is IPlanEntry => entry !== null
                    )
                    .map((entry, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <span style={{ fontWeight: "bolder" }}>
                          {entry.name}
                        </span>
                        <span>{entry.room}</span>
                      </Box>
                    ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }

    return (
      <SwipeableViews
        onChangeIndex={this.handleTabSwipe.bind(this)}
        index={WEEKDAYS.indexOf(this.props.selectedWeekday)}
        containerStyle={{
          // transition: "transform 0.35s cubic-bezier(0.15, 0.3, 0.25, 1) 0s",
          height: "100%"
        }}
        style={{
          flexGrow: 1
        }}
      >
        {swipeableViews}
      </SwipeableViews>
    )
  }
}
