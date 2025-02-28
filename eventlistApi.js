const todosAPI = (() => {
    const EVENTLIST_API = "http://localhost:3000/events";

    const getAll = async () => {
        try {
            const response = await fetch(EVENTLIST_API);
            if (!response.ok) {
                throw new Error(`Failed to fetch events: ${response.statusText}`);
            }
            const todos = await response.json();
            return todos;
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    };

    const add = async (newTodo) => {
        try {
            const res = await fetch(EVENTLIST_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTodo),
            });
            if (!res.ok) {
                throw new Error(`Failed to add event: ${res.statusText}`);
            }
            const todo = await res.json();
            return todo;
        } catch (error) {
            console.error("Error adding event:", error);
            return null;
        }
    };

    const edit = async (id, updatedTodo) => {
        try {
            const res = await fetch(`${EVENTLIST_API}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedTodo),
            });
            if (!res.ok) {
                throw new Error(`Failed to edit event: ${res.statusText}`);
            }
            return await res.json();
        } catch (error) {
            console.error("Error editing event:", error);
            return null;
        }
    };

    const deleteById = async (id) => {
        try {
            const res = await fetch(`${EVENTLIST_API}/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error(`Failed to delete event: ${res.statusText}`);
            }
            return true; 
        } catch (error) {
            console.error("Error deleting event:", error);
            return false; 
        }
    };

    return {
        getAll,
        add,
        edit,
        deleteById,
    };
})();
