document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadTasks();
    }
});

async function submitTask() {
    const taskTitle = document.getElementById('task-title').value;
    const taskDescription = document.getElementById('task-description').value;
    const dueDate = document.getElementById('due-date').value;
    const taskStatus = document.getElementById('task-status').value;

    if (!taskTitle || !dueDate || !taskStatus) {
        document.getElementById('task-message').textContent = 'Please fill in all required fields.';
        document.getElementById('task-message').style.color = 'red';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: taskTitle, description: taskDescription, dueDate, status: taskStatus }),
        });

        if (response.ok) {
            document.getElementById('task-message').textContent = 'Task added successfully!';
            document.getElementById('task-message').style.color = 'green';
            document.getElementById('task-title').value = '';
            document.getElementById('task-description').value = '';
            document.getElementById('due-date').value = '';
            document.getElementById('task-status').value = 'Pending';
        } else {
            document.getElementById('task-message').textContent = 'Error adding task.';
            document.getElementById('task-message').style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('task-message').textContent = 'Error connecting to server.';
        document.getElementById('task-message').style.color = 'red';
    }
}

async function loadTasks() {
    try {
        const response = await fetch('http://localhost:3000/tasks');
        const tasks = await response.json();
        const tableBody = document.getElementById('task-table-body');
        tableBody.innerHTML = '';
        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.title}</td>
                <td>${task.description || 'N/A'}</td>
                <td>${task.due_date}</td>
                <td>${task.status}</td>
                <td>
                    <button class="action-button edit-button" onclick="editTask(${task.id})">Edit</button>
                    <button class="action-button delete-button" onclick="deleteTask(${task.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function editTask(id) {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${id}`);
        const task = await response.json();
        localStorage.setItem('editTaskId', id);
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('due-date').value = task.due_date;
        document.getElementById('task-status').value = task.status;
        window.location.href = 'add-task.html';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`http://localhost:3000/tasks/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            loadTasks();
        } else {
            console.error('Error deleting task');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}