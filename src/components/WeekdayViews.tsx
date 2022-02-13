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
import apiCalls from "../apiCalls"
import SwipeableViews from "react-swipeable-views"

type Props = {
  planId: number | null
  selectedWeekday: Weekday
  onChange: (newValue: Weekday) => void
}

type State = {
  displayedPlan: IPlan | null
  loading: boolean
  error: boolean
}

export default class WeekdayViews extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      displayedPlan: null,
      loading: false,
      error: false
    }
  }

  fetchPlanIfNeeded() {
    if (this.props.planId === null) {
      return
    }

    if (this.props.planId !== this.state.displayedPlan?.id) {
      this.setState({
        loading: true,
        error: false
      })

      apiCalls
        .plan(this.props.planId)
        .then(plan => {
          this.setState({
            displayedPlan: plan,
            loading: false
          })
        })
        .catch(() => {
          this.setState({
            loading: false,
            error: true
          })
        })
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.planId !== this.props.planId) {
      this.setState({
        loading: false,
        error: false
      })
      this.fetchPlanIfNeeded()
    }
  }

  componentDidMount() {
    this.fetchPlanIfNeeded()
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
      <a href="https://zst-radom.edu.pl/plan_www/">
        <Link variant="button">Przejdź do starszej strony planu</Link>
      </a>
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
        <Table>
          <TableBody>
            {this.state.displayedPlan?.hours.map((hour, i) => (
              <TableRow key={hour}>
                <TableCell>{hour}</TableCell>
                <TableCell>
                  {this.state.displayedPlan?.lessons[weekday][i]
                    ?.filter<IPlanEntry>(
                      (entry): entry is IPlanEntry => entry !== null
                    )
                    .map(entry => (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <span>{entry.name}</span>
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
          transition: "transform 0.35s cubic-bezier(0.15, 0.3, 0.25, 1) 0s" // workaround for https://github.com/oliviertassinari/react-swipeable-views/issues/599
        }}
      >
        {swipeableViews}
      </SwipeableViews>
    )
  }
}
