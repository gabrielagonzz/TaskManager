    let tasks = [];
    let selectedTaskId;

    function displayTasks(filteredTasks = tasks) {
        const taskList = document.getElementById('tasks');
        taskList.innerHTML = '';
    
        filteredTasks.forEach(task => {
            const row = document.createElement('tr');
            row.setAttribute('data-task-id', task.id);
    
            let assignedUserName = task.assignedUser ? task.assignedUserId : 'Not assigned';
    
            row.innerHTML = `
                <td>${task.title}</td>
                <td>${assignedUserName}</td>
                <td>
                    <button onclick="openDetailsModal(${task.id})">Details</button>
                    <button onclick="openEditModal(${task.id})">Edit</button>
                    <button onclick="deleteTask(${task.id})">Delete</button>
                    <button onclick="openAssignModal(${task.id})">Assign</button>
                </td>
            `;
            taskList.appendChild(row);
        });
    }
    
    function showAllTasks() {
        fetch('https://localhost:7168/Leader/alltasks')
            .then(response => response.json())
            .then(allTasks => {
                tasks = allTasks;
                // Obtén la información del usuario asignado antes de mostrar las tareas
                fetchAssignedUserInformation();
            })
            .catch(error => console.error('Error fetching all tasks:', error));
    }
    async function createTask() {
        const newTaskTitle = document.getElementById('newTaskTitle').value.trim();
        const newTaskDescription = document.getElementById('newTaskDescription').value.trim();
    
        if (newTaskTitle === '') {
            alert('Please enter a title for the new task.');
            return;
        }
    
        try {
            const response = await fetch('https://localhost:7168/Leader/createtask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: newTaskDescription,
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to create task: ${response.status}`);
            }
    
            const newTask = await response.json();
    
            tasks.push(newTask);
            displayTasks();
            document.getElementById('newTaskTitle').value = '';
            document.getElementById('newTaskDescription').value = '';
        } catch (error) {
            console.error('Error creating task:', error);
        }
    }
    
    function showTaskDetails(taskId) {
        const taskDetails = tasks.find(task => task.id === taskId);

        if (taskDetails) {
            const modalTaskDetails = document.getElementById('modalTaskDetails');
            modalTaskDetails.innerHTML = '';

            const descriptionParagraph = document.createElement('p');
            descriptionParagraph.textContent = taskDetails.description || 'Details are not available.';
            modalTaskDetails.appendChild(descriptionParagraph);

            openDetailsModal();
        } else {
            console.error('Task details not found.');
        }
    }

    function editTask(taskId) {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (taskToUpdate) {
            const newTitle = prompt('Enter the new title for this task:', taskToUpdate.title);
            if (newTitle !== null && newTitle !== '') {
                fetch(`https://localhost:7168/Leader/edittask/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: newTitle,
                        description: taskToUpdate.description,
                    }),
                })
                    .then(response => {
                        if (response.ok) {
                            taskToUpdate.title = newTitle;
                            displayTasks();
                        } else {
                            console.error('Failed to update task.');
                        }
                    })
                    .catch(error => console.error('Error updating task:', error));
            }
        }
    }

    function searchTasks() {
        const keyword = document.getElementById('searchKeyword').value.trim().toLowerCase();

        if (keyword !== '') {
            fetch(`https://localhost:7168/Leader/searchtasks?keyword=${keyword}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to search tasks: ${response.status}`);
                    }
                    return response.json();
                })
                .then(filteredTasks => {
                    displayTasks(filteredTasks);
                })
                .catch(error => {
                    console.error('Error searching tasks:', error);
                });
        } else {
            showAllTasks();
        }
    }

    function deleteTask(taskId) {
        const confirmDelete = confirm('Are you sure you want to delete this task?');
        if (confirmDelete) {
            fetch(`https://localhost:7168/Leader/deletetask/${taskId}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.ok) {
                        tasks = tasks.filter(task => task.id !== taskId);
                        displayTasks();
                    } else {
                        console.error('Failed to delete task.');
                    }
                })
                .catch(error => console.error('Error deleting task:', error));
        }
    }

    function assignTask() {
        const assignedUserIdInput = document.getElementById('assignedUserId');
        const assignedUserId = assignedUserIdInput.value;

        if (!assignedUserId) {
            alert('Please enter a valid user ID.');
            return;
        }

        fetch(`https://localhost:7168/Leader/assigntask/${selectedTaskId}/${assignedUserId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to assign task: ${response.status}`);
                }
                return assignedUserId;
            })
            .then(userId => {
                updateTableRow(selectedTaskId, userId);
                alert('Task assigned successfully.');
                closeAssignModal();
            })
            .catch(error => {
                console.error('Error assigning task:', error);
                alert('Error assigning task. Please try again.');
            });
    }

    function updateTableRow(taskId, assignedUserId) {
        const taskRow = document.querySelector(`[data-task-id="${taskId}"] td:nth-child(2)`);
        if (taskRow) {
            taskRow.textContent = assignedUserId;
        }
    }

    function saveTaskDetails() {
        const newTitle = document.getElementById("editTaskTitle").value;
        const newDetails = document.getElementById("editTaskDetails").value;

        fetch(`https://localhost:7168/Leader/edittask/${selectedTaskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Title: newTitle,
                Description: newDetails,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Task edited successfully');
                displayTasks();
            } else {
                console.error('Error editing task:', data.errors || 'Unknown error');
                console.error('Full error object:', data);
            }
        })
        .catch(error => console.error('Error editing task:', error));

        closeEditModal();
    }

    function openEditModal(taskId) {
        selectedTaskId = taskId;
        const taskToUpdate = tasks.find(task => task.id === taskId);

        document.getElementById('editTaskTitle').value = taskToUpdate.title;
        document.getElementById('editTaskDetails').value = taskToUpdate.description;

        document.getElementById('editTaskModal').style.display = 'block';
    }

    function closeEditModal() {
        document.getElementById('editTaskModal').style.display = 'none';
    }

    function openAssignModal(taskId) {
        selectedTaskId = taskId;
        document.getElementById('assignTaskModal').style.display = 'block';
    }

    function closeAssignModal() {
        document.getElementById('assignTaskModal').style.display = 'none';
    }

    function openDetailsModal(taskId) {
        selectedTaskId = taskId;
        showTaskDetails(taskId);
        document.getElementById('detailsTaskModal').style.display = 'block';
    }

    function closeDetailsModal() {
        document.getElementById('detailsTaskModal').style.display = 'none';
    }

    showAllTasks();
