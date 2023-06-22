import { useContext } from 'react'

import {
  Autocomplete,
  Box,
  createTheme,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
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
import { useTranslation } from 'react-i18next'
import naturalCompare from 'string-natural-compare'

export default function PlanSelector() {
  const { t } = useTranslation()

  const { categories, planId, setPlanId } = useContext(AppContext)

  if (categories.isLoading === undefined) return <>{t('Loading...')}</>
  if (categories.isError) return <>{t('Failed to load')}</>
  if (categories.data === undefined) return null
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

  const handlePlanIdChangeSelect = (e: SelectChangeEvent<string>) => {
    handlePlanIdChangeAutocomplete(parseInt(e.target.value))
  }

  const handlePlanIdChangeAutocomplete = (newPlanId: number) => {
    if (categories.data === undefined) return
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
      <MenuItem value="class"> {t('Students')} </MenuItem>
      <MenuItem value="teacher"> {t('Teachers')} </MenuItem>
      <MenuItem value="classroom"> {t('Classrooms')} </MenuItem>
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

    selects.push(
      <Select
        key="planSelect"
        variant="standard"
        value={planId!.toString()}
        onChange={handlePlanIdChangeSelect}
      >
        {availablePlans.map((plan) => (
          <MenuItem value={plan.planId} key={plan.planId}>
            {truncateWithEllipses(plan.longName, 16)}
          </MenuItem>
        ))}
      </Select>
    )
  } else {
    let availablePlans = categories.data[selectedCategoryName].sort((a, b) => {
      if (selectedCategoryName === 'teacher') {
        // alphabetically but numbers last
        const nameA = a.longName.toLowerCase()
        const nameB = b.longName.toLowerCase()
        const isNumberA = !isNaN(parseInt(nameA))
        const isNumberB = !isNaN(parseInt(nameB))

        if (isNumberA && !isNumberB) {
          return 1
        } else if (!isNumberA && isNumberB) {
          return -1
        } else {
          return nameA.localeCompare(nameB)
        }
      }

      // alphabetically but numbers first
      return naturalCompare(a.longName, b.longName)
    })

    selects.push(
      <Autocomplete
        key="planAutocomplete"
        value={availablePlans.find((plan) => plan.planId === planId)}
        onChange={(event, newValue) => {
          handlePlanIdChangeAutocomplete(newValue.planId)
        }}
        disableClearable
        options={availablePlans}
        getOptionLabel={(option) => option.longName}
        renderInput={(params) => (
          <TextField
            {...params}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            variant="standard"
          />
        )}
      />
    )
  }

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

function truncateWithEllipses(text: string, max: number) {
  return text.substring(0, max - 1) + (text.length > max ? '…' : '')
}
