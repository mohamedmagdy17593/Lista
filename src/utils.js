export function visitLista(lista, callback) {
  lista.forEach(item => {
    callback(item)
    visitLista(item.children, callback)
  })
}

export function last(array) {
  return array[array.length - 1]
}

// i don't know how this is work:
// https://stackoverflow.com/questions/3972014/get-caret-position-in-contenteditable-div
export function getCaretCharOffsetInDiv(element) {
  let caretOffset = 0
  if (typeof window.getSelection !== 'undefined') {
    const range = window.getSelection().getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(element)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    caretOffset = preCaretRange.toString().length
  } else if (
    typeof document.selection !== 'undefined' &&
    document.selection.type !== 'Control'
  ) {
    const textRange = document.selection.createRange()
    const preCaretTextRange = document.body.createTextRange()
    preCaretTextRange.moveToElementText(element)
    preCaretTextRange.setEndPoint('EndToEnd', textRange)
    caretOffset = preCaretTextRange.text.length
  }
  return caretOffset
}

// this also i dont know what it's mean
// check if selection text is link
export function isLink() {
  if (window.getSelection().toString !== '') {
    const selection = window.getSelection().getRangeAt(0)
    if (selection) {
      if (
        selection.startContainer.parentNode.tagName === 'A' ||
        selection.endContainer.parentNode.tagName === 'A'
      ) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }
}

export function log(a) {
  console.log(a)
  return a
}
