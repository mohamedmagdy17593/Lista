/** @jsx jsx */
import { jsx } from '@emotion/core'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useImmerReducer } from 'use-immer'
import {
  FiPlus,
  FiTrash,
  FiPlusCircle,
  FiChevronsRight,
  FiMinus,
} from 'react-icons/fi'
import { useTheme } from 'emotion-theming'
import _ from 'lodash'
import ContentEditable from 'react-contenteditable'
import styles from './styles'
import { visitLista, getCaretCharOffsetInDiv, last } from './utils'

const listaContext = createContext()

function listaReducer(draft, action) {
  action = _.cloneDeep(action)
  switch (action.type) {
    case 'CHANGE_ITEM': {
      _.set(draft, [...action.path, 'value'], action.value)
      break
    }
    case 'ADD_NEW_ITEM': {
      visitLista(draft, item => {
        item.focus = false
      })
      // get index of the currentItem that is clicked
      const currentItemIndex = action.path.pop()
      // get parant array
      const items = _.get(draft, action.path) || draft
      // insert new created item under the currentItem
      if (currentItemIndex === undefined) {
        items.push({
          id: Math.random(),
          value: '',
          focus: true,
          hideChildren: false,
          children: [],
        })
      } else {
        items.splice(currentItemIndex + 1, 0, {
          id: Math.random(),
          value: '',
          focus: true,
          hideChildren: false,
          children: [],
        })
      }
      break
    }
    case 'CHANGE_FOCUS': {
      visitLista(draft, item => {
        item.focus = false
      })
      const item = _.get(draft, action.path)
      if (item) {
        item.focus = true
      }
      break
    }
    case 'DELETE_ITEM': {
      if (draft.length <= 1 && action.path.length <= 1) {
        break
      }
      visitLista(draft, item => {
        item.focus = false
      })
      // get index of the currentItem that is clicked
      const currentItemIndex = action.path.pop()
      // get parant array
      const items = _.get(draft, action.path) || draft
      if (currentItemIndex !== undefined) {
        items.splice(currentItemIndex, 1)
        if (items.length > 0) {
          // set nextItem or previous item focus to true
          ;(items[currentItemIndex] || items[currentItemIndex - 1]).focus = true
        } else {
          // set focus to parent
          action.path.pop()
          const parentItem = _.get(draft, action.path)
          parentItem.focus = true
        }
      }
      break
    }
    case 'MOVE_UP': {
      visitLista(draft, item => {
        item.focus = false
      })
      const currentItem = _.get(draft, action.path)
      const currentIndex = action.path.pop()
      if (currentIndex === 0) {
        // get parent item
        action.path.pop()
        const parentItem = _.get(draft, action.path)
        if (parentItem) {
          parentItem.focus = true
        } else {
          currentItem.focus = true
        }
      } else {
        const items = _.get(draft, action.path) || draft
        // get last child in praveItem recursevly
        let praveItem = items[currentIndex - 1]
        while (
          praveItem.children.length > 0 &&
          praveItem.hideChildren === false
        ) {
          praveItem = last(praveItem.children)
        }
        praveItem.focus = true
      }
      break
    }
    case 'MOVE_DOWN': {
      visitLista(draft, item => {
        item.focus = false
      })
      const currentItem = _.get(draft, action.path)
      if (
        currentItem.children.length > 0 &&
        currentItem.hideChildren === false
      ) {
        currentItem.children[0].focus = true
      } else {
        // get next item in pearnt if this is the case
        let currentIndex, nextItem
        while (
          (currentIndex = action.path.pop()) !== undefined &&
          !(nextItem = (_.get(draft, action.path) || draft)[currentIndex + 1])
        ) {
          action.path.pop()
        }
        if (nextItem) {
          nextItem.focus = true
        } else {
          currentItem.focus = true
        }
      }
      break
    }
    case 'INDENT_ITEM': {
      // get index of the currentItem that is clicked
      const currentItemIndex = action.path.pop()
      // get parant array
      const items = _.get(draft, action.path) || draft
      // get the Item a pove currentItemIndex
      const upperItem = items[currentItemIndex - 1]
      if (upperItem) {
        const currentItem = items[currentItemIndex]
        items.splice(currentItemIndex, 1)
        upperItem.children.push(currentItem)
        upperItem.hideChildren = false
      }
      break
    }
    case 'TOGGLE_HIDE_CHILDREN': {
      const currentItem = _.get(draft, action.path)
      if (currentItem.children.length === 0) {
        return
      }
      visitLista(draft, item => {
        item.focus = false
      })
      currentItem.hideChildren = !currentItem.hideChildren
      currentItem.focus = true
      break
    }
    default: {
      throw Error(`${action.type} is not supported`)
    }
  }
}

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
          onTabAtStart={indentItem}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onCommandShiftD={deleteItem}
          onCommandShiftW={toggleHideChildren}
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
        </span>
      </span>
      {item.children.length > 0 && !item.hideChildren && (
        <ListaUl lista={item.children} path={[...path, 'children']}></ListaUl>
      )}
    </li>
  )
}

function TextEditor({
  item,
  onChange,
  onFocus,
  onEnterAtEndOfLine,
  onTabAtStart,
  onMoveUp,
  onMoveDown,
  onCommandShiftD,
  onCommandShiftW,
  ...rest
}) {
  const theme = useTheme()
  const editorRef = useRef()
  const [innerText, setInnerText] = useState('')

  useEffect(() => {
    if (item.focus) {
      setTimeout(() => {
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
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={e => {
        console.log(e.key)
        switch (e.key) {
          case 'Enter': {
            const cursorPosition = getCaretCharOffsetInDiv(e.target)
            const divContentLength = e.target.innerText.replace(/\n/g, '')
              .length
            if (cursorPosition === divContentLength) {
              onEnterAtEndOfLine()
              e.preventDefault()
            }
            break
          }
          case 'ArrowUp': {
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
              onMoveUp()
              e.preventDefault()
            }
            break
          }
          case 'ArrowDown': {
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
              onMoveDown()
              e.preventDefault()
            }
            break
          }
          case 'Tab': {
            const cursorPosition = getCaretCharOffsetInDiv(e.target)
            if (cursorPosition === 0) {
              onTabAtStart()
              e.preventDefault()
            }
            break
          }
          // command + shift + d
          case 'd': {
            if (e.metaKey && e.shiftKey) {
              onCommandShiftD()
              e.preventDefault()
            }
            break
          }
          case 'w': {
            if (e.metaKey && e.shiftKey) {
              onCommandShiftW()
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
