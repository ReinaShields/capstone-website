import { createContext, useContext, useState } from 'react'

const Theme = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false)
  const toggle = () => setDark(p => !p)

  const theme = {
    dark,
    toggle,
    bg: dark ? '#1B1B1B' : '#F8F8F8',
    card: dark ? '#2a2a2a' : '#ffffff',
    accent: '#FFC149',
    secondary: dark ? '#4B4B4B' : '#D9D9D9',
    text: dark ? '#F8F8F8' : '#1B1B1B',
    textOnAccent: '#1B1B1B',
    textMuted: dark ? '#D9D9D9' : '#7A7A7A',
    error: '#EF534E',
    confirm: '#5BBF68',
  }

  return (
    <Theme.Provider value={theme}>
      {children}
    </Theme.Provider>
  )
}

export const useTheme = () => useContext(Theme)