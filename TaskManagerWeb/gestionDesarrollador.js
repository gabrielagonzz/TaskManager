
function showAllTasks() {
    fetch('https://localhost:7168/Developer/alltasks')
        .then(response => response.json())
        .then(data => displayTasks(data))
        .catch(error => console.error('Error fetching tasks:', error));
}

function searchTasks() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value;

    if (keyword.trim() !== '') {
        fetch(`https://localhost:7168/Developer/searchtasks?keyword=${keyword}`)
            .then(response => response.json())
            .then(data => displayTasks(data))
            .catch(error => console.error('Error searching tasks:', error));
    } else {
        console.log('Please enter a keyword for the search.');
    }
}

function followTask(taskId) {
    const userId = prompt('Enter your User ID:');
    
    if (userId !== null) {
        const confirmation = confirm('Do you want to follow this task?');
        
        if (confirmation) {
            sendFollowRequest(taskId, userId);
        } else {
            console.log('Follow task action canceled.');
        }
    } else {
        console.log('User ID not provided.');
    }
}

function unfollowTask(taskId) {
    const userId = prompt('Enter your User ID:');
    
    if (userId !== null) {
        const confirmation = confirm('Do you want to unfollow this task?');
        
        if (confirmation) {
            sendUnfollowRequest(taskId, userId);
        } else {
            console.log('Unfollow task action canceled.');
        }
    } else {
        console.log('User ID not provided.');
    }
}

function sendFollowRequest(taskId, userId) {
    fetch(`https://localhost:7168/Developer/followtask/${taskId}/${userId}`, {
        method: 'POST'
    })
        .then(response => response.json())  // Agrega esto para obtener el cuerpo de la respuesta
        .then(data => {
            if (data) {
                console.log('Server response:', data);
            }
            if (response.ok) {
                console.log('Task followed successfully.');
            } else {
                console.error('Error following task.');
            }
        })
        .catch(error => console.error('Error following task:', error));
}

function sendUnfollowRequest(taskId, userId) {
    fetch(`https://localhost:7168/Developer/unfollowtask/${taskId}/${userId}`, {
        method: 'POST'
    })
        .then(response => response.json())  // Agrega esto para obtener el cuerpo de la respuesta
        .then(data => {
            if (data) {
                console.log('Server response:', data);
            }
            if (response.ok) {
                console.log('Task unfollowed successfully.');
            } else {
                console.error('Error unfollowing task.');
            }
        })
        .catch(error => console.error('Error unfollowing task:', error));
}


function displayTasks(tasks) {
    const tasksTable = document.getElementById('tasks');

    tasksTable.innerHTML = '';

    tasks.forEach(task => {
        const row = document.createElement('tr');

        const titleCell = document.createElement('td');
        titleCell.textContent = task.title;

        const actionsCell = document.createElement('td');
        const followButton = document.createElement('button');
        followButton.textContent = 'Follow';
        followButton.onclick = () => followTask(task.id, /* usuarioId */);
        
        const unfollowButton = document.createElement('button');
        unfollowButton.textContent = 'Unfollow';
        unfollowButton.onclick = () => unfollowTask(task.id, /* usuarioId */);

        actionsCell.appendChild(followButton);
        actionsCell.appendChild(unfollowButton);

        row.appendChild(titleCell);
        row.appendChild(actionsCell);

        tasksTable.appendChild(row);
    });
}
