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

const savedSession = {
  category: "students",
  level: "1",
  plan: "1B 1Tinf",
  teacher: "A. Rudnicki"
}

type CategoriesState = {
  categories: ICategories | null
  selectedCategory: CategoryName
  selectedLevel: ILevel | null
  selectedPlan: ILevel["plans"][number] | null
  selectedTeacher: ICategories["teachers"][number] | null
}

type CategoriesProps = {
  onChange?: (newValue: number) => void
}

export default class Categories extends React.Component<
  CategoriesProps,
  CategoriesState
> {
  constructor(props: CategoriesProps) {
    super(props)

    this.state = {
      categories: null,
      selectedCategory: savedSession.category as CategoryName,
      selectedLevel: null,
      selectedPlan: null,
      selectedTeacher: null
    }
  }

  componentDidMount() {
    apiCalls.categories().then(categories => {
      const selectedLevel =
        categories.students.find(level => level.name === savedSession.level) ||
        categories.students[0]
      const selectedPlan =
        selectedLevel.plans.find(plan => plan.name === savedSession.plan) ||
        selectedLevel.plans[0]

      const selectedTeacher =
        categories.teachers.find(
          teacher => teacher.name === savedSession.teacher
        ) || categories.teachers[0]

      this.setState({
        categories: categories,
        selectedLevel: selectedLevel,
        selectedPlan: selectedPlan,
        selectedTeacher: selectedTeacher
      })

      this.props?.onChange?.(selectedPlan.id)
    })
  }

  handleCategoryChange(event: SelectChangeEvent<CategoryName>) {
    const selectedCategory = event.target.value as CategoryName

    this.setState({
      selectedCategory: selectedCategory
    })

    if (selectedCategory === "students") {
      this.props.onChange?.(this.state.selectedPlan!.id)
    } else {
      this.props.onChange?.(this.state.selectedTeacher!.id)
    }
  }

  handleLevelChange(event: SelectChangeEvent) {
    const selectedLevel = this.state.categories!.students.find(
      level => level.name === event.target.value
    )!
    const firstPlan = selectedLevel?.plans[0]

    this.setState({
      selectedLevel: selectedLevel,
      selectedPlan: firstPlan
    })

    this.props.onChange?.(firstPlan.id)
  }

  handlePlanChange(event: SelectChangeEvent<number>) {
    const selectedPlan = this.state.selectedLevel!.plans.find(
      plan => plan.id === event.target.value
    )!

    this.setState({ selectedPlan: selectedPlan })

    this.props.onChange?.(selectedPlan.id)
  }

  handleTeacherChange(event: SelectChangeEvent<number>) {
    const selectedTeacher = this.state.categories!.teachers.find(
      teacher => teacher.id === event.target.value
    )!

    this.setState({ selectedTeacher: selectedTeacher })

    this.props.onChange?.(selectedTeacher.id)
  }

  render(): React.ReactNode {
    if (this.state.categories === null) {
      return <Typography>Loading...</Typography>
    }

    var displayedSelects: JSX.Element[] = []

    if (this.state.selectedCategory === "students") {
      const LevelSelectOptions = this.state.categories?.students.map(level => (
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
