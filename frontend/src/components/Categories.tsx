import React, { useState } from "react"

import { Select, MenuItem, SelectChangeEvent, Typography } from "@mui/material"
import apiCalls, { categories } from "../apiCalls"
import { CategoryName, ICategories, ILevel } from "../../shared/types"

const whiteSelectStyle = {
  color: "white",
  "& > svg": {
    color: "white"
  },
  "&::before": {
    borderBottomColor: "white"
  },
  option: {
    color: "black"
  }
}

interface SavedSession {
  category: CategoryName
  level?: string
  plan?: string
  teacher?: string
}

type CategoriesState = {
  categories: ICategories | null
  selectedCategory: CategoryName
  selectedLevel: ILevel | null
  selectedPlan: ILevel["plans"][number] | null
  selectedTeacher: ICategories["teachers"][number] | null
}

type CategoriesProps = {
  onChange: (newValue: number) => void
}

export default class Categories extends React.Component<
  CategoriesProps,
  CategoriesState
> {
  savedSession: SavedSession

  constructor(props: CategoriesProps) {
    super(props)

    const savedSessionString = localStorage.getItem("savedSession")
    try {
      if (savedSessionString !== null)
        this.savedSession = JSON.parse(savedSessionString) as SavedSession
      else throw Error()
    } catch {
      this.savedSession = {
        category: "students"
      }
    }

    this.state = {
      categories: null,
      selectedCategory: this.savedSession.category,
      selectedLevel: null,
      selectedPlan: null,
      selectedTeacher: null
    }

    new BroadcastChannel("cache-update").addEventListener("message", event => {
      if (event.data.type === "categories") {
        this.fetchCategories()
      }
    })
  }

  componentDidMount() {
    this.fetchCategories()
  }

  private fetchCategories() {
    apiCalls.categories().then(categories => {
      const selectedLevel =
        categories.students.find(
          level => level.name === this.savedSession.level
        ) || categories.students[0]
      const selectedPlan =
        selectedLevel.plans.find(
          plan => plan.name === this.savedSession.plan
        ) || selectedLevel.plans[0]

      const selectedTeacher =
        categories.teachers.find(
          teacher => teacher.name === this.savedSession.teacher
        ) || categories.teachers[0]

      this.setState({
        categories: categories,
        selectedLevel: selectedLevel,
        selectedPlan: selectedPlan,
        selectedTeacher: selectedTeacher
      })

      if (this.state.selectedCategory === "students")
        this.props.onChange(selectedPlan.id)
      else this.props.onChange(selectedTeacher.id)
    })
  }

  saveSession() {
    localStorage.setItem("savedSession", JSON.stringify(this.savedSession))
  }

  handleCategoryChange(event: SelectChangeEvent<CategoryName>) {
    const selectedCategory = event.target.value as CategoryName

    const differentCategory = this.state.selectedCategory !== selectedCategory

    this.setState({
      selectedCategory: selectedCategory
    })

    if (differentCategory) {
      if (selectedCategory === "students") {
        this.props.onChange(this.state.selectedPlan!.id)
      } else {
        this.props.onChange(this.state.selectedTeacher!.id)
      }
    }

    this.savedSession.category = selectedCategory
    this.saveSession()
  }

  handleLevelChange(event: SelectChangeEvent) {
    const selectedLevel = this.state.categories!.students.find(
      level => level.name === event.target.value
    )!
    const firstPlan = selectedLevel.plans[0]

    const differentPlan = this.state.selectedPlan!.id !== firstPlan.id

    this.setState({
      selectedLevel: selectedLevel,
      selectedPlan: firstPlan
    })

    if (differentPlan) this.props.onChange(firstPlan.id)

    this.savedSession.level = event.target.value
    this.saveSession()
  }

  handlePlanChange(event: SelectChangeEvent<number>) {
    const selectedPlan = this.state.selectedLevel!.plans.find(
      plan => plan.id === event.target.value
    )!

    const differentPlan = this.state.selectedPlan!.id !== selectedPlan.id

    this.setState({ selectedPlan: selectedPlan })

    if (differentPlan) this.props.onChange(selectedPlan.id)

    this.savedSession.plan = selectedPlan.name
    this.saveSession()
  }

  handleTeacherChange(event: SelectChangeEvent<number>) {
    const selectedTeacher = this.state.categories!.teachers.find(
      teacher => teacher.id === event.target.value
    )!

    this.setState({ selectedTeacher: selectedTeacher })

    this.props.onChange(selectedTeacher.id)

    this.savedSession.teacher = selectedTeacher.name
    this.saveSession()
  }

  render(): React.ReactNode {
    if (this.state.categories === null) {
      return <Typography>Ładowanie...</Typography>
    }

    var displayedSelects: JSX.Element[] = []

    if (this.state.selectedCategory === "students") {
      const LevelSelectOptions = this.state.categories.students.map(level => (
        <MenuItem key={level.name} value={level.name}>
          {level.name}
        </MenuItem>
      ))

      const LevelSelect = (
        <Select
          variant="standard"
          sx={whiteSelectStyle}
          value={this.state.selectedLevel?.name}
          onChange={this.handleLevelChange.bind(this)}
          key="level"
        >
          {LevelSelectOptions}
        </Select>
      )

      const PlanSelectOptions = this.state.selectedLevel!.plans.map(plan => (
        <MenuItem key={plan.id} value={plan.id}>
          {plan.name}
        </MenuItem>
      ))

      const PlanSelect = (
        <Select
          variant="standard"
          sx={whiteSelectStyle}
          value={this.state.selectedPlan!.id}
          onChange={this.handlePlanChange.bind(this)}
          key="plan"
        >
          {PlanSelectOptions}
        </Select>
      )

      displayedSelects = [LevelSelect, PlanSelect]
    } else {
      const TeacherSelectOptions = this.state.categories!.teachers.map(
        teacher => (
          <MenuItem key={teacher.id} value={teacher.id}>
            {teacher.name}
          </MenuItem>
        )
      )

      const TeacherSelect = (
        <Select
          variant="standard"
          sx={whiteSelectStyle}
          value={this.state.selectedTeacher?.id}
          onChange={this.handleTeacherChange.bind(this)}
          key="teacher"
        >
          {TeacherSelectOptions}
        </Select>
      )

      displayedSelects = [TeacherSelect]
    }

    return (
      <React.Fragment>
        <Select
          variant="standard"
          sx={whiteSelectStyle}
          value={this.state.selectedCategory}
          onChange={this.handleCategoryChange.bind(this)}
        >
          <MenuItem value="students">Uczniowie</MenuItem>
          <MenuItem value="teachers">Nauczyciele</MenuItem>
        </Select>

        {displayedSelects}
      </React.Fragment>
    )
  }
}
