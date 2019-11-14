/** @jsx jsx */
import { jsx } from '@emotion/core'

import { createContext, useContext, useEffect, useRef } from 'react'
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
import { visitList, getCaretCharOffsetInDiv } from './utils'

const listaContext = createContext()

function listaReducer(draft, action) {
  action = _.cloneDeep(action)
  switch (action.type) {
    case 'CHANGE_ITEM': {
      _.set(draft, [...action.path, 'value'], action.value)
      break
    }
    case 'ADD_NEW_ITEM': {
      visitList(draft, item => {
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
    case 'DELETE_ITEM': {
      visitList(draft, item => {
        item.focus = false
      })
      // get index of the currentItem that is clicked
      const currentItemIndex = action.path.pop()
      // get parant array
      const items = _.get(draft, action.path) || draft
      if (currentItemIndex !== undefined) {
        items.splice(currentItemIndex, 1)
        // set nextItem or previous item focus to true
        ;(items[currentItemIndex] || items[currentItemIndex - 1]).focus = true
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
      visitList(draft, item => {
        item.focus = false
      })
      const currentItem = _.get(draft, action.path)
      currentItem.hideChildren = !currentItem.hideChildren
      if (currentItem.hideChildren) {
        currentItem.focus = true
      } else {
        currentItem.children[0].focus = true
      }
      break
    }
    default: {
      throw Error(`${action.type} is not supported`)
    }
  }
}

function Lista() {
  const [lista, dispatch] = useImmerReducer(listaReducer, [
    {
      id: Math.random(),
      value: '',
      focus: true,
      hideChildren: false,
      children: [],
    },
  ])

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

  return (
    <li
      css={{
        'svg, .svg-placeholder': {
          fontSize: styles.fontSizes[1],
        },
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
      <TextEditor
        item={item}
        onChange={handleChange}
        onEnterAtEndOfLine={addNewItem}
      ></TextEditor>{' '}
      <span
        className="show-on-hover"
        css={{
          marginLeft: styles.spacing[2],
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
      {item.children.length > 0 && !item.hideChildren && (
        <ListaUl lista={item.children} path={[...path, 'children']}></ListaUl>
      )}
    </li>
  )
}

function TextEditor({ item, onChange, onEnterAtEndOfLine }) {
  const editorRef = useRef()

  useEffect(() => {
    if (item.focus) {
      setTimeout(() => {
        editorRef.current.el.current.focus()
      })
    }
  }, [item.focus])

  return (
    <ContentEditable
      ref={editorRef}
      css={{
        display: 'inline-block',
        minWidth: 30,
      }}
      html={item.value}
      onChange={onChange}
      onKeyPress={e => {
        if (e.key === 'Enter') {
          const cursorPosition = getCaretCharOffsetInDiv(e.target)
          const divContentLength = e.target.innerText.replace(/\s/g, '').length
          if (cursorPosition === divContentLength) {
            onEnterAtEndOfLine()
            e.preventDefault()
          }
        }
      }}
    ></ContentEditable>
  )
}

export default Lista
