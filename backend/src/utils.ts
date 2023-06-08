const DATE_REGEX = /(\d{2}\.\d{2}\.\d{4})/

export function getMetadata(document: Document) {
  // body > div > table > tbody > tr:nth-child(2) > td contains a string like "Obowiązuje od: 10.05.2023"
  const applicableAtEl = document.querySelector(
    'body > div > table > tbody > tr:nth-child(2) > td'
  )

  if (applicableAtEl == null || applicableAtEl.textContent == null)
    throw new Error('No applicableAtEl in planHTML')

  const applicableAt = new Date(
    applicableAtEl.textContent.match(DATE_REGEX)![0].replace(/\./g, '-')
  ).toJSON()

  // body > div > table > tbody > tr:nth-child(3) > td.op > table > tbody > tr > td:nth-child(1)
  // first node of this is a text node containing a string like "'\nwygenerowano 08.05.2023'"
  const generatedAtNode = document.querySelector(
    'body > div > table > tbody > tr:nth-child(3) > td.op > table > tbody > tr > td:nth-child(1)'
  )?.firstChild

  if (
    generatedAtNode == undefined ||
    generatedAtNode == null ||
    generatedAtNode.textContent == null
  )
    throw new Error('No generatedAtNode in planHTML')

  const generatedAt = new Date(
    generatedAtNode.textContent.match(DATE_REGEX)![0].replace(/\./g, '-')
  ).toJSON()

  const metadata = {
    applicableAt,
    generatedAt,
    scrapedAt: new Date().toJSON()
  }
  return metadata
}

export function classLongNameToShortName(longName: string): string {
  return longName.split(' ')[0]
}

/** Given "fizyka-1/2" returns "1/2", given "bhp" returns null */
export function getGroup(subjectName: string): string | null {
  let match = subjectName.match(/-(\d\/\d)$/)
  return match ? match[1] : null
}

export function isAdvanced(subjectName: string): boolean {
  return subjectName.trim().toLowerCase().startsWith('r_')
}
