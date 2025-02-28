class TodosModel {
    #todos = [];

    constructor() {
        this.#todos = [];
    }

    setTodos(todos) {
        this.#todos = todos;
    }

    getTodos() {
        return this.#todos;
    }

    addTodo(newTodo) {
        this.#todos.push(newTodo);
    }

    removeTodo(id) {
        this.#todos = this.#todos.filter((todo) => todo.id !== id);
    }
}

class TodosView {
    constructor() {
        this.todosList = document.querySelector(".todos-list");
        this.newTodoForm = document.querySelector(".new-todo-form");
        this.addEventButton = document.querySelector("#add-event-button");
        this.eventInputs = document.querySelector("#event-inputs");
        this.newTodoInput = document.querySelector("#new-todo-input");
        this.saveEventButton = document.querySelector("#save-event-button");
        this.deleteEventButton = document.querySelector("#delete-event-button");
    }

    renderTodos(todos) {
        this.todosList.innerHTML = "";
        todos.forEach((todo) => this.addTodo(todo));
    }

    addTodo(newTodo) {
        const { id, title, completed, startDate, endDate } = newTodo;

        const todoElement = document.createElement("div");
        todoElement.className = "todo";
        todoElement.id = `todo-${id}`;

        todoElement.innerHTML = `
        <div class="todo" id="todo-${id}">
          <span class="todo__title">${title}</span>
          <span class="todo__dates">${startDate || "N/A"} ~ ${endDate || "N/A"}</span>
          <button class="todo__edit">Edit</button>
          <button class="todo__delete">Delete</button>
        </div>
      `;

        const editButton = todoElement.querySelector(".todo__edit");
        const deleteButton = todoElement.querySelector(".todo__delete");

        editButton.addEventListener("click", () => this.onEditClick(id));
        deleteButton.addEventListener("click", () => this.onDeleteClick(id));

        this.todosList.appendChild(todoElement);
    }

    removeTodo(id) {
        const todoElement = document.getElementById(`todo-${id}`);
        if (todoElement) {
            todoElement.remove();
        }
    }

    onEditClick(id) {
        console.log(`Edit todo with id: ${id}`);
    }

    onDeleteClick(id) {
        console.log(`Delete todo with id: ${id}`);
        this.removeTodo(id);
    }

    showEventInputs() {
        this.eventInputs.classList.remove("hidden");
    }

    hideEventInputs() {
        this.eventInputs.classList.add("hidden");
    }

    clearEventInputs() {
        this.newTodoInput.value = "";
        document.getElementById("new-todo-start-date").value = "";
        document.getElementById("new-todo-end-date").value = "";
    }
}

class TodosController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.init();
    }

    async init() {
        const todos = await todosAPI.getAll();
        this.model.setTodos(todos);
        this.view.renderTodos(todos);
        this.setupAddEvent();
        this.setupSaveEvent();
        this.setupDeleteEvent();
        this.setupEditEvent();
        this.setupDeleteInputEvent();
    }

    setupAddEvent() {
        this.view.addEventButton.addEventListener("click", () => {
            this.view.showEventInputs();
        });
    }

    setupSaveEvent() {
        this.view.newTodoForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newTodoTitle = this.view.newTodoInput.value;
            const newTodoStartDate = document.getElementById("new-todo-start-date").value;
            const newTodoEndDate = document.getElementById("new-todo-end-date").value;

            const newTodo = await todosAPI.add({
                title: newTodoTitle,
                startDate: newTodoStartDate,
                endDate: newTodoEndDate,
                completed: false,
            });

            this.model.addTodo(newTodo);
            this.view.addTodo(newTodo);

            this.view.clearEventInputs();
            this.view.hideEventInputs();
        });
    }

    setupDeleteEvent() {
        this.view.todosList.addEventListener("click", async (e) => {
            if (e.target.classList.contains("todo__delete")) {
                const todoElem = e.target.parentElement;
                const id = todoElem.id.split("-")[1];
                await todosAPI.deleteById(id);
                this.model.removeTodo(id);
                this.view.removeTodo(id);
            }
        });
    }

    setupEditEvent() {
        this.view.todosList.addEventListener("click", async (e) => {
            if (e.target.classList.contains("todo__edit")) {
                const todoElem = e.target.parentElement;
                const id = todoElem.id.split("-")[1];
                const todo = this.model.getTodos().find((todo) => todo.id === id);

                const editForm = document.createElement("form");
                editForm.innerHTML = `
              <input type="text" value="${todo.title}" id="edit-todo-title-${id}" />
              <input type="date" value="${todo.startDate}" id="edit-todo-start-date-${id}" />
              <input type="date" value="${todo.endDate}" id="edit-todo-end-date-${id}" />
              <button type="submit">Save</button>
              <button type="button" id="cancel-edit-${id}">Cancel</button>
            `;

                todoElem.innerHTML = "";
                todoElem.appendChild(editForm);

                editForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const updatedTitle = document.getElementById(`edit-todo-title-${id}`).value;
                    const updatedStartDate = document.getElementById(`edit-todo-start-date-${id}`).value;
                    const updatedEndDate = document.getElementById(`edit-todo-end-date-${id}`).value;

                    const updatedTodo = {
                        ...todo,
                        title: updatedTitle,
                        startDate: updatedStartDate,
                        endDate: updatedEndDate,
                    };

                    await todosAPI.edit(id, updatedTodo);
                    this.model.setTodos(this.model.getTodos().map((t) => (t.id === id ? updatedTodo : t)));
                    this.view.renderTodos(this.model.getTodos());
                });

                const cancelButton = document.getElementById(`cancel-edit-${id}`);
                cancelButton.addEventListener("click", () => {
                    this.view.renderTodos(this.model.getTodos());
                });
            }
        });
    }

    setupDeleteInputEvent() {
        this.view.deleteEventButton.addEventListener("click", () => {
            this.view.clearEventInputs();
            this.view.hideEventInputs();
        });
    }
}

const todosModel = new TodosModel();
const todosView = new TodosView();
const todosController = new TodosController(todosModel, todosView);