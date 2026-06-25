import en from '../lib/i18n/en'
import fa from '../lib/i18n/fa'

// Bilingual text for SERVER components (blog). Renders both languages; CSS in
// globals.css shows the one matching <html lang>. Falls back to English.
export function Bi({ en: enText, fa: faText, as: Tag = 'span', className = '' }) {
  return (
    <>
      <Tag className={`lang-en ${className}`.trim()}>{enText}</Tag>
      <Tag className={`lang-fa ${className}`.trim()}>{faText || enText}</Tag>
    </>
  )
}

// Bilingual UI string by dictionary key (for server components).
export function T2({ k, as, className }) {
  return <Bi en={en[k] || k} fa={fa[k] || en[k] || k} as={as} className={className} />
}
