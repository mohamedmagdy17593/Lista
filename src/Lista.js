/** @jsx jsx */
import { jsx } from '@emotion/core'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useImmerReducer } from 'use-immer'
import {
  FiPlus,
  FiTrash,
  FiPlusCircle,
  FiChevronsRight,
  FiChevronsLeft,
  FiMinus,
} from 'react-icons/fi'
import { useTheme } from 'emotion-theming'
import ContentEditable from 'react-contenteditable'
import styles from './styles'
import { getCaretCharOffsetInDiv } from './utils'
import listaReducer from './listaReducer'

const listaContext = createContext()

function Lista() {
  const [lista, dispatch] = useImmerReducer(
    listaReducer,
    null,
    () =>
      JSON.parse(window.localStorage.getItem('lista')) || [
        {
          id: Math.random(),
          value: '',
          focus: true,
          hideChildren: false,
          children: [],
        },
      ],
  )

  // save to localStorage onChange
  useEffect(() => {
    window.localStorage.setItem('lista', JSON.stringify(lista))
  }, [lista])

  return (
    <listaContext.Provider value={{ lista, dispatch }}>
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
        <ListaUl lista={lista} path={[]}></ListaUl>
      </div>
    </listaContext.Provider>
  )
}

function ListaUl({ lista, path }) {
  return (
    <ul>
      {lista.map((item, index) => {
        return (
          <ListaLi key={item.id} item={item} path={[...path, index]}></ListaLi>
        )
      })}
    </ul>
  )
}

function ListaLi({ item, path }) {
  const theme = useTheme()
  const { dispatch } = useContext(listaContext)

  function handleChange(e) {
    dispatch({
      type: 'CHANGE_ITEM',
      value: e.target.value,
      path,
    })
  }

  function onFocus() {
    dispatch({
      type: 'CHANGE_FOCUS',
      path,
    })
  }

  function addNewItem() {
    dispatch({
      type: 'ADD_NEW_ITEM',
      path,
    })
  }

  function deleteItem() {
    dispatch({
      type: 'DELETE_ITEM',
      path,
    })
  }

  function indentItem() {
    dispatch({
      type: 'INDENT_ITEM',
      path,
    })
  }

  function unIndentItem() {
    dispatch({
      type: 'UNINDENT_ITEM',
      path,
    })
  }

  function toggleHideChildren() {
    dispatch({
      type: 'TOGGLE_HIDE_CHILDREN',
      path,
    })
  }

  function moveUp() {
    dispatch({
      type: 'MOVE_UP',
      path,
    })
  }

  function moveDown() {
    dispatch({
      type: 'MOVE_DOWN',
      path,
    })
  }

  function swapUp() {
    dispatch({
      type: 'SWAP_ITEM_UP',
      path,
    })
  }

  function swapDown() {
    dispatch({
      type: 'SWAP_ITEM_DOWN',
      path,
    })
  }

  return (
    <li
      css={{
        'svg, .svg-placeholder': {
          fontSize: styles.fontSizes[1],
        },
      }}
    >
      {item.children.length === 0 ? (
        <span
          css={{ width: styles.fontSizes[1], display: 'inline-block' }}
        ></span>
      ) : item.hideChildren ? (
        <FiPlus
          css={{ color: theme.colors.lightText }}
          onClick={toggleHideChildren}
        ></FiPlus>
      ) : (
        <FiMinus
          css={{ color: theme.colors.lightText }}
          onClick={toggleHideChildren}
        ></FiMinus>
      )}{' '}
      <span
        css={{
          '.show-on-hover': {
            visibility: 'hidden',
          },
          ':hover': {
            '.show-on-hover': {
              visibility: 'visible',
            },
          },
        }}
      >
        <TextEditor
          item={item}
          onChange={handleChange}
          onFocus={onFocus}
          onEnterAtEndOfLine={addNewItem}
          onTab={indentItem}
          onCommandTab={unIndentItem}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onCommandShiftD={deleteItem}
          onCommandShiftW={toggleHideChildren}
          onAltUp={swapUp}
          onAltDown={swapDown}
        ></TextEditor>{' '}
        <span
          className="show-on-hover"
          css={{
            paddingLeft: styles.spacing[2],
            svg: { marginLeft: styles.spacing[0] },
          }}
        >
          <FiTrash
            css={{ color: theme.colors.danger, marginBottom: -1.3 }}
            onClick={deleteItem}
          ></FiTrash>
          <FiPlusCircle
            css={{ color: theme.colors.success, marginBottom: -1.5 }}
            onClick={addNewItem}
          ></FiPlusCircle>
          <FiChevronsRight
            css={{ marginBottom: -1.5 }}
            onClick={indentItem}
          ></FiChevronsRight>
          <FiChevronsLeft
            css={{ marginBottom: -1.5 }}
            onClick={unIndentItem}
          ></FiChevronsLeft>
        </span>
      </span>
      {item.children.length > 0 && !item.hideChildren && (
        <ListaUl lista={item.children} path={[...path, 'children']}></ListaUl>
      )}
    </li>
  )
}

/**
 * this Component has alot of hacks
 * but it's coool 🤓
 */
function TextEditor({
  item,
  onChange,
  onFocus,
  onEnterAtEndOfLine,
  onTab,
  onCommandTab,
  onMoveUp,
  onMoveDown,
  onCommandShiftD,
  onCommandShiftW,
  onAltUp,
  onAltDown,
  ...rest
}) {
  const theme = useTheme()
  const editorRef = useRef()
  const [innerText, setInnerText] = useState('')

  // hack 🤓
  // add all method to refs
  // becouse ContentEditable regester events from first time only
  const methodRefs = useRef()
  methodRefs.current = {
    onChange,
    onFocus,
    onEnterAtEndOfLine,
    onTab,
    onCommandTab,
    onMoveUp,
    onMoveDown,
    onCommandShiftD,
    onCommandShiftW,
    onAltUp,
    onAltDown,
  }

  // another hack 🤓
  const preventNextFocusRef = useRef(false)
  useEffect(() => {
    if (item.focus) {
      setTimeout(() => {
        preventNextFocusRef.current = true
        editorRef.current.el.current.focus()
      })
    }
  }, [item.focus])

  useEffect(() => {
    setInnerText(editorRef.current.el.current.innerText)
  }, [item.value])

  return (
    <ContentEditable
      ref={editorRef}
      css={[
        {
          display: 'inline-block',
          minWidth: 30,
        },
        innerText.trim().length === 0 && {
          border: `1px solid ${theme.colors.danger}`,
        },
      ]}
      html={item.value}
      onChange={methodRefs.current.onChange}
      onFocus={e => {
        if (preventNextFocusRef.current) {
          preventNextFocusRef.current = false
        } else {
          methodRefs.current.onFocus(e)
        }
      }}
      onKeyDown={e => {
        switch (e.key) {
          case 'Enter': {
            const cursorPosition = getCaretCharOffsetInDiv(e.target)
            const divContentLength = e.target.innerText.replace(/\n/g, '')
              .length
            if (cursorPosition === divContentLength) {
              methodRefs.current.onEnterAtEndOfLine()
              e.preventDefault()
            }
            break
          }
          case 'ArrowUp': {
            if (e.altKey) {
              methodRefs.current.onAltUp()
            } else {
              let node = window.getSelection().getRangeAt(0).startContainer
              let hasbr = false
              while ((node = node.previousSibling) !== null) {
                if (node.nodeName === 'BR') {
                  hasbr = true
                  break
                }
              }
              if (!hasbr) {
                // we are at first line in this container
                methodRefs.current.onMoveUp()
                e.preventDefault()
              }
            }
            break
          }
          case 'ArrowDown': {
            if (e.altKey) {
              methodRefs.current.onAltDown()
            } else {
              let node = window.getSelection().getRangeAt(0).startContainer
              let hasbr = false
              while ((node = node.nextSibling) !== null) {
                if (node.nodeName === 'BR') {
                  hasbr = true
                  break
                }
              }
              if (!hasbr) {
                // we are at last line in this container
                methodRefs.current.onMoveDown()
                e.preventDefault()
              }
            }
            break
          }
          case 'Tab': {
            if (e.shiftKey) {
              methodRefs.current.onCommandTab()
            } else {
              methodRefs.current.onTab()
            }
            e.preventDefault()
            break
          }
          // command + shift + d
          case 'd': {
            if (e.metaKey && e.shiftKey) {
              methodRefs.current.onCommandShiftD()
              e.preventDefault()
            }
            break
          }
          // command + shift + w
          case 'w': {
            if (e.metaKey && e.shiftKey) {
              methodRefs.current.onCommandShiftW()
              e.preventDefault()
            }
            break
          }
          // command + b
          case 'b': {
            if (e.metaKey) {
              document.execCommand('bold', false)
              e.preventDefault()
            }
            break
          }
          // command + i
          case 'i': {
            if (e.metaKey) {
              document.execCommand('italic', false)
              e.preventDefault()
            }
            break
          }
          // command + l
          case 'l': {
            if (e.metaKey) {
              const link = prompt('Link:')
              document.execCommand('createLink', false, link)
              e.preventDefault()
            }
            break
          }
          default: {
            // dont do any thing
          }
        }
      }}
      {...rest}
    ></ContentEditable>
  )
}

export default Lista
