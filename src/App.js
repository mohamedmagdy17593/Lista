/** @jsx jsx */
import { jsx } from '@emotion/core'

import { useState } from 'react'
import { ThemeProvider } from 'emotion-theming'
import Switch from 'react-switch'
import theme from './theme'

function App() {
  const [themeMode, setThemeMode] = useState('light')

  return (
    <ThemeProvider theme={theme[themeMode]}>
      <Nav setThemeMode={setThemeMode} themeMode={themeMode}></Nav>
    </ThemeProvider>
  )
}

function Nav({ setThemeMode, themeMode }) {
  return (
    <nav>
      <Switch
        onChange={() => {
          setThemeMode(themeMode === 'light' ? 'dark' : 'light')
        }}
        checked={themeMode === 'light'}
      ></Switch>
    </nav>
  )
}

export default App
