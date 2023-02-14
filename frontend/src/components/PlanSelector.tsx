import { useEffect, useState } from 'react'

import {
  Box,
  createTheme,
  MenuItem,
  Select,
  SelectChangeEvent,
  ThemeProvider
} from '@mui/material'

import apiCalls from '../apiCalls'
import { Categories, CategoryName } from '../shared/types'

type SavedSession = {
  categoryName?: CategoryName
  grade?: string
  classShortName?: string
  classroomShortName?: string
  teacherLongName?: string
}

function getSavedSession(): SavedSession {
  const savedSessionJSON = localStorage.getItem('session')
  if (savedSessionJSON) {
    return JSON.parse(savedSessionJSON)
  } else return {}
}

function updateSavedSession(session: SavedSession) {
  localStorage.setItem(
    'session',
    JSON.stringify({ ...getSavedSession(), ...session })
  )
  console.log(localStorage.getItem('session'))
}

function getSavedSessionPlanIdOrDefault(
  categories: Categories,
  categoryName: CategoryName,
  grade?: string
): number {
  if (!grade && categoryName === 'class')
    throw new Error('Grade is required for class category')

  let session = getSavedSession()

  let planId: number
  if (categoryName === 'class' && grade) {
    // && grade is a type guard
    let defaultPlanId = categories.class[grade][0].planId
    if (!session.classShortName) planId = defaultPlanId
    else {
      let plansToSearch = categories.class[grade]
      planId =
        plansToSearch.find((p) => p.shortName === session.classShortName!)
          ?.planId || defaultPlanId
    }
  } else if (categoryName === 'teacher') {
    let defaultPlanId = categories.teacher[0].planId
    if (!session.teacherLongName) planId = defaultPlanId
    else {
      let plansToSearch = categories.teacher
      planId =
        plansToSearch.find((p) => p.longName === session.teacherLongName!)
          ?.planId || defaultPlanId
    }
  } else if (categoryName === 'classroom') {
    let defaultPlanId = categories.classroom[0].planId
    if (!session.classroomShortName) planId = defaultPlanId
    else {
      let plansToSearch = categories.classroom
      planId =
        plansToSearch.find((p) => p.shortName === session.classroomShortName!)
          ?.planId || defaultPlanId
    }
  }

  return planId!
}

function getPlanIdFromUrl(): number | null {
  const currentUrl = window.location.pathname

  const regex = /^\/plan\/(\d+)/

  return Number(regex.exec(currentUrl)?.[1]) || null
}

interface PlanSelectorProps {
  planId: number | null
  setPlanId: (planId: number | null) => void
}

export default function PlanSelector({ planId, setPlanId }: PlanSelectorProps) {
  const [categories, setCategories] = useState<Categories | null>(null)
  const [fetchingError, setFetchingError] = useState<string | null>(null)
  const [selectedCategoryName, setSelectedCategoryName] =
    useState<CategoryName | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)

  useEffect(() => {
    apiCalls
      .getCategories()
      .then((fetchedCategories) => {
        setCategories(fetchedCategories)

        let failedToGetFromUrl = false
        try {
          const planIdFromUrl = getPlanIdFromUrl()
          if (planIdFromUrl === null) throw new Error('No planId in url')

          let categoryName: CategoryName
          let grade: string
          if (
            fetchedCategories.classroom.find((p) => p.planId === planIdFromUrl)
          ) {
            categoryName = 'classroom'
            grade = Object.keys(fetchedCategories.class)[0]
          } else if (
            fetchedCategories.teacher.find((p) => p.planId === planIdFromUrl)
          ) {
            categoryName = 'teacher'
            grade = Object.keys(fetchedCategories.class)[0]
          } else {
            categoryName = 'class'
            grade = Object.keys(fetchedCategories.class).find((g) =>
              fetchedCategories.class[g].find((p) => p.planId === planIdFromUrl)
            )!
            if (!grade) throw new Error('No grade found')
          }

          setSelectedCategoryName(categoryName)
          setSelectedGrade(grade)
          setPlanId(planIdFromUrl)
        } catch (error) {
          failedToGetFromUrl = true
          console.log(error)
        }

        if (failedToGetFromUrl) {
          let session = getSavedSession()

          let categoryName: CategoryName
          if (
            session.categoryName &&
            fetchedCategories.hasOwnProperty(session.categoryName)
          ) {
            categoryName = session.categoryName
          } else {
            categoryName = 'class'
          }

          let grade: string
          if (
            session.grade &&
            fetchedCategories.class.hasOwnProperty(session.grade)
          ) {
            grade = session.grade
          } else {
            grade = Object.keys(fetchedCategories.class)[0]
          }

          let planId = getSavedSessionPlanIdOrDefault(
            fetchedCategories,
            categoryName,
            grade
          )

          setSelectedCategoryName(categoryName)
          setSelectedGrade(grade)
          setPlanId(planId!)
        }
      })
      .catch((err) => {
        setFetchingError(err.message)
      })
  }, [])

  if (!categories) {
    return <span>{fetchingError || 'Ładowanie...'}</span>
  }

  const handleCategoryNameChange = (e: SelectChangeEvent) => {
    const newCategoryName = e.target.value as CategoryName

    setSelectedCategoryName(newCategoryName)
    setPlanId(
      getSavedSessionPlanIdOrDefault(
        categories,
        newCategoryName,
        selectedGrade!
      )
    )

    updateSavedSession({ categoryName: newCategoryName })
  }

  const handleGradeChange = (e: SelectChangeEvent) => {
    const newGrade = e.target.value as string

    setSelectedGrade(newGrade)
    setPlanId(categories.class[newGrade][0].planId)
    // I think always setting the first plan of the grade makes ux more consistent
    // (otherwise it would depend on whether the user switched to a different plan in previous grade)

    updateSavedSession({ grade: newGrade })
    // I think updating classShortName is not necessary here,
    // it doesn't really change the behavior of the app
  }

  const handlePlanIdChange = (e: SelectChangeEvent) => {
    const newPlanId = Number(e.target.value)

    setPlanId(newPlanId)

    switch (selectedCategoryName) {
      case 'class':
        updateSavedSession({
          classShortName: categories.class[selectedGrade!].find(
            (p) => p.planId === newPlanId
          )?.shortName
        })
        break
      case 'teacher':
        updateSavedSession({
          teacherLongName: categories.teacher.find(
            (p) => p.planId === newPlanId
          )?.longName
        })
        break
      case 'classroom':
        updateSavedSession({
          classroomShortName: categories.classroom.find(
            (p) => p.planId === newPlanId
          )?.shortName
        })
        break
    }
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
        {Object.keys(categories.class).map((grade) => (
          <MenuItem value={grade} key={grade}>
            {grade}
          </MenuItem>
        ))}
      </Select>
    )

    var availablePlans = categories.class[selectedGrade!]
  } else {
    var availablePlans = categories[selectedCategoryName!]
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
