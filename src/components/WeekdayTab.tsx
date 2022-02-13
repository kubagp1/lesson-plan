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

import { IPlan, IPlanEntry, Weekday } from "../../shared/types"
import apiCalls from "../apiCalls"

type Props = {
  planId: number | null
  weekday: Weekday
}

type State = {
  displayedPlan: IPlan | null
  loading: boolean
  error: boolean
}

export default class WeekDayTab extends React.Component<Props, State> {
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
        <Link
          variant="button"
          onClick={() => {
            console.info("I'm a button.")
          }}
        >
          Przejdź do starszej strony planu
        </Link>
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

    console.log(this.state.displayedPlan)

    return (
      <Table>
        <TableBody>
          {this.state.displayedPlan?.hours.map((hour, i) => (
            <TableRow key={hour}>
              <TableCell>{hour}</TableCell>
              <TableCell>
                {this.state.displayedPlan?.lessons[this.props.weekday][i]
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
}
