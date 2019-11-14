import React, { useEffect, useState } from 'react'
import { Global } from '@emotion/core'
import { useTheme } from 'emotion-theming'

function GlobalStyles() {
  const theme = useTheme()
  const [lazyStyles, setLazyStyles] = useState()

  useEffect(() => {
    setLazyStyles({
      '*': {
        transition: 'background-color 300ms',
      },
    })
  }, [])

  return (
    <Global
      styles={[
        `
          @import url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap');
        `,
        {
          'html, body': {
            height: '100%',
          },
          body: {
            fontFamily: `'Open Sans', sans-serif`,
            background: theme.colors.bg,
            color: theme.colors.text,
          },
        },
        lazyStyles,
      ]}
    ></Global>
  )
}

export default GlobalStyles
