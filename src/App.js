/** @jsx jsx */
import { jsx } from '@emotion/core'

import { useState, useEffect } from 'react'
import { ThemeProvider } from 'emotion-theming'
import Switch from 'react-switch'
import styles from './styles'
import { EmojiIcon, Container } from './components'
import GlobalStyles from './GlobalStyles'
import Lista from './Lista'

function App() {
  const [themeMode, setThemeMode] = useState(() => {
    return window.localStorage.getItem('themeMode') || 'light'
  })

  useEffect(() => {
    window.localStorage.setItem('themeMode', themeMode)
  }, [themeMode])

  return (
    <ThemeProvider theme={styles[themeMode]}>
      <GlobalStyles></GlobalStyles>
      <Nav setThemeMode={setThemeMode} themeMode={themeMode}></Nav>
      <Container>
        <Lista></Lista>
      </Container>
    </ThemeProvider>
  )
}

function Nav({ setThemeMode, themeMode }) {
  return (
    <nav
      css={{
        padding: `${styles.spacing[2]}px 0`,
      }}
    >
      <Container
        css={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          css={{
            fontSize: styles.fontSizes[4],
          }}
        >
          Lista
        </span>

        <Switch
          onChange={() => {
            setThemeMode(themeMode === 'light' ? 'dark' : 'light')
          }}
          checked={themeMode === 'light'}
          checkedIcon={<EmojiIcon lable="dark" emoji="🌚"></EmojiIcon>}
          uncheckedIcon={<EmojiIcon lable="light" emoji="☀️"></EmojiIcon>}
          offColor={styles.dark.colors.bg}
          onColor={styles.light.colors.bg}
        ></Switch>
      </Container>
    </nav>
  )
}

export default App
