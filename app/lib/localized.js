// Pick the right-language value from a row that has parallel `_fa` columns.
// Falls back to the English column when the Persian one is empty.
// Works for both plain text and JSON (e.g. quiz options_fa).
export function localized(row, field, locale) {
  if (!row) return ''
  if (locale === 'fa') {
    const v = row[field + '_fa']
    if (v != null && v !== '') return v
  }
  return row[field]
}
