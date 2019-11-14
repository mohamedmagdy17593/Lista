/** @jsx jsx */
import { jsx } from '@emotion/core'

import styles from './styles'
import styled from '@emotion/styled'

export function EmojiIcon({ lable, emoji }) {
  return (
    <span
      css={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: styles.fontSizes[4],
      }}
      role="img"
      aria-label={lable}
    >
      {emoji}
    </span>
  )
}

export const Container = styled.div({
  width: 1024,
  margin: '0 auto',
  padding: `0 ${styles.spacing[1]}px`,
})
