export function visitList(lista, callback) {
  lista.forEach(item => {
    callback(item)
    visitList(item.children, callback)
  })
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
