import _ from 'lodash'
import { visitLista, last } from './utils'

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
      const item = _.get(draft, action.path)
      if (!item || item.focus) {
        return
      }
      visitLista(draft, item => {
        item.focus = false
      })
      item.focus = true
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
      if (currentItem === undefined) {
        return
      }
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
    case 'SWAP_ITEM_UP': {
      const index = action.path.pop()
      const currentItem = _.get(draft, [...action.path, index])
      const praveItem = _.get(draft, [...action.path, index - 1])
      if (!praveItem) {
        return
      }
      _.set(draft, [...action.path, index], praveItem)
      _.set(draft, [...action.path, index - 1], currentItem)
      break
    }
    case 'SWAP_ITEM_DOWN': {
      const index = action.path.pop()
      const currentItem = _.get(draft, [...action.path, index])
      const nextItem = _.get(draft, [...action.path, index + 1])
      if (!nextItem) {
        return
      }
      _.set(draft, [...action.path, index], nextItem)
      _.set(draft, [...action.path, index + 1], currentItem)
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
    case 'UNINDENT_ITEM': {
      // get index of the currentItem that is clicked
      const currentItemIndex = action.path.pop()
      // get parant array
      const items = _.get(draft, action.path) || draft
      // get parant parant index & array
      action.path.pop() // children
      const parentIndex = action.path.pop()
      if (parentIndex !== undefined) {
        const currentItem = items[currentItemIndex]
        items.splice(currentItemIndex, 1)
        const parentArray = _.get(draft, action.path) || draft
        parentArray.splice(parentIndex + 1, 0, currentItem)
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

export default listaReducer
