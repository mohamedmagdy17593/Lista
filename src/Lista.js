/** @jsx jsx */
import { jsx } from '@emotion/core'

import {} from 'react'
import { FiPlus, FiTrash } from 'react-icons/fi'
import styles from './styles'
import { useTheme } from 'emotion-theming'

function Lista() {
  const theme = useTheme()

  return (
    <div
      css={{
        fontSize: styles.fontSizes[3],
        fontWeight: 'lighter',
        ul: {
          paddingLeft: styles.spacing[4],
        },
        li: {
          margin: `${styles.spacing[2]}px 0`,
          listStyle: 'none',
        },
        '> ul': {
          paddingLeft: 0,
        },
      }}
    >
      <ul>
        <li
          css={{
            '.show-on-hover': {
              display: 'none',
            },
            ':hover': {
              '.show-on-hover': {
                display: 'inline-block',
              },
            },
          }}
        >
          <FiPlus
            style={{
              fontSize: 14,
              color: theme.colors.lightText,
            }}
          ></FiPlus>{' '}
          <span>This is sparta</span>{' '}
          <FiTrash
            className="show-on-hover"
            style={{
              marginLeft: styles.spacing[2],
              fontSize: 14,
              color: theme.colors.danger,
              marginBottom: -1.3,
            }}
          ></FiTrash>
        </li>
        <li
          css={{
            '.show-on-hover': {
              display: 'none',
            },
            ':hover': {
              '.show-on-hover': {
                display: 'inline-block',
              },
            },
          }}
        >
          <FiPlus
            style={{
              fontSize: 14,
              color: theme.colors.lightText,
            }}
          ></FiPlus>{' '}
          <span>Sparta will be the first in the US</span>{' '}
          <FiTrash
            className="show-on-hover"
            style={{
              marginLeft: styles.spacing[2],
              fontSize: 14,
              color: theme.colors.danger,
              marginBottom: -1.3,
            }}
          ></FiTrash>
        </li>
      </ul>
    </div>
  )
}

export default Lista
