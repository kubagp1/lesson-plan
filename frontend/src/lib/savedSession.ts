import { CategoryName, Categories, Entity } from '../shared/types'

type SavedSession = {
  categoryName?: CategoryName
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
}

export function updateSavedSessionHelper(
  categoryName: CategoryName,
  entity: Entity
) {
  updateSavedSession({ categoryName })
  switch (categoryName) {
    case 'class':
      updateSavedSession({ classShortName: entity.shortName })
      return
    case 'classroom':
      updateSavedSession({ classroomShortName: entity.shortName })
      return
    case 'teacher':
      updateSavedSession({ teacherLongName: entity.longName })
      return
    default:
      const _exhaustiveCheck: never = categoryName
      return _exhaustiveCheck
  }
}

export function getSavedSessionPlanIdOrDefaultForCategory(
  categories: Categories,
  categoryName: CategoryName
): number {
  let session = getSavedSession()

  let planId: number
  if (categoryName === 'class') {
    let defaultPlanId = categories.class[0].planId
    if (!session.classShortName) planId = defaultPlanId
    else {
      let plansToSearch = Object.values(categories.class).flat()
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

export function getSavedSessionPlanIdOrDefault(categories: Categories): number {
  let session = getSavedSession()

  if (session.categoryName) {
    return getSavedSessionPlanIdOrDefaultForCategory(
      categories,
      session.categoryName
    )
  }

  return categories.class[0].planId
}
