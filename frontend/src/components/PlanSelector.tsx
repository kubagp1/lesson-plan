import { useContext } from 'react'

import {
  Box,
  createTheme,
  MenuItem,
  Select,
  SelectChangeEvent,
  ThemeProvider
} from '@mui/material'

import { AppContext } from './AppContext'
import {
  getCategoryNameFromPlanId,
  getClassesByGrades,
  getEntityByPlanId,
  getGrade
} from '../lib/categories'
import { CategoryName } from '../shared/types'
import {
  getSavedSessionPlanIdOrDefaultForCategory,
  updateSavedSessionHelper
} from '../lib/savedSession'

export default function PlanSelector() {
  const { categories, planId, setPlanId } = useContext(AppContext)

  if (categories.data === undefined) return null // TODO loading indicator
  if (planId === null) return null

  const selectedCategoryName = getCategoryNameFromPlanId(
    categories.data,
    planId
  )

  const handleCategoryNameChange = (e: SelectChangeEvent<CategoryName>) => {
    if (categories.data === undefined) return

    const newcategoryName = e.target.value as CategoryName
    const newPlanId = getSavedSessionPlanIdOrDefaultForCategory(
      categories.data!,
      newcategoryName
    )
    setPlanId(newPlanId)

    updateSavedSessionHelper(
      newcategoryName,
      getEntityByPlanId(categories.data, newPlanId)
    )
  }

  const classByGrade = getClassesByGrades(categories.data.class)

  const selectedGrade = getGrade(
    getEntityByPlanId(categories.data, planId).longName
  )

  const handleGradeChange = (e: SelectChangeEvent<string>) => {
    if (categories.data === undefined) return

    const grade = e.target.value
    const newPlanId = classByGrade[grade][0].planId
    setPlanId(newPlanId)

    updateSavedSessionHelper(
      getCategoryNameFromPlanId(categories.data, newPlanId),
      getEntityByPlanId(categories.data, newPlanId)
    )
  }

  const handlePlanIdChange = (e: SelectChangeEvent<string>) => {
    if (categories.data === undefined) return

    const newPlanId = parseInt(e.target.value)
    setPlanId(newPlanId)

    updateSavedSessionHelper(
      getCategoryNameFromPlanId(categories.data, newPlanId),
      getEntityByPlanId(categories.data, newPlanId)
    )
  }

  let selects = []

  selects.push(
    <Select
      key="categoryNameSelect"
      variant="standard"
      value={selectedCategoryName!}
      onChange={handleCategoryNameChange}
    >
      <MenuItem value="class">Uczniowie</MenuItem>
      <MenuItem value="teacher">Nauczyciele</MenuItem>
      <MenuItem value="classroom">Sale</MenuItem>
    </Select>
  )

  if (selectedCategoryName === 'class') {
    selects.push(
      <Select
        key="gradeSelect"
        variant="standard"
        value={selectedGrade!}
        onChange={handleGradeChange}
      >
        {Object.keys(classByGrade).map((grade) => (
          <MenuItem value={grade} key={grade}>
            {grade}
          </MenuItem>
        ))}
      </Select>
    )

    var availablePlans = classByGrade[selectedGrade]
  } else {
    var availablePlans = categories.data[selectedCategoryName]
  }

  selects.push(
    <Select
      key="planSelect"
      variant="standard"
      value={planId!.toString()}
      onChange={handlePlanIdChange}
    >
      {availablePlans.map((plan) => (
        <MenuItem value={plan.planId} key={plan.planId}>
          {plan.longName}
        </MenuItem>
      ))}
    </Select>
  )

  return (
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode: 'dark'
        }
      })}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '16px'
        }}
      >
        {selects}
      </Box>
    </ThemeProvider>
  )
}
