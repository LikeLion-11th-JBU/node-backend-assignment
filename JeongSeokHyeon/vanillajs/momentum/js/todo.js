const toDoForm = document.getElementById('todo-form')
const toDoinput = document.querySelector('#todo-form input')
const toDoList = document.getElementById('todo-list')

function deleteToDo(event) {
  const li = event.target.parentElement
  li.remove()
}

function paintToDo(newTodo) {
  const li = document.createElement('li')
  const span = document.createElement('span')
  const button = document.createElement('button')
  button.innerText = 'X'
  button.addEventListener('click', deleteToDo)
  li.appendChild(span)
  li.appendChild(button)
  span.innerText = newTodo
  toDoList.appendChild(li)
}

function handleToDoSubmit(event) {
  event.preventDefault()
  const newTodo = toDoinput.value
  toDoinput.value = ''
  paintToDo(newTodo)
}

toDoForm.addEventListener('submit', handleToDoSubmit)
