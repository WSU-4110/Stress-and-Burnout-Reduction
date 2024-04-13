export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  const view = url.searchParams.get('view') || 'default';
  const categoryId = url.searchParams.get('category_id');
  const selectedDate = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
  const page = await renderPage(view, categoryId, selectedDate, env);
  
  return new Response(page, { headers: { 'Content-Type': 'text/html' } });
}

export async function onRequestPost({ request, env }) {
  const url = new URL(request.url);
  const formData = await request.formData();

  try {
    if (url.pathname.endsWith('/add-task')) {
      await addTask(formData, env);
    } else if (url.pathname.includes('/update-task/')) {
      const id = url.pathname.split('/').pop();
      await updateTask(id, formData, env);
    } else if (url.pathname.endsWith('/add-category')) {
      await addCategory(formData, env);
    } else if (url.pathname.includes('/update-category/')) {
      const id = url.pathname.split('/').pop();
      await updateCategory(id, formData, env);
    }
    return new Response(null, { status: 303, headers: { 'Location': url.origin + '/goals' } });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  const url = new URL(request.url);

  try {
    if (url.pathname.includes('/delete-task/')) {
      const id = url.pathname.split('/').pop();
      await deleteTask(id, env);
    } else if (url.pathname.includes('/delete-category/')) {
      const id = url.pathname.split('/').pop();
      await deleteCategory(id, env);
    } else if (url.pathname.includes('/reset-category/')) {
      const id = url.pathname.split('/').pop();
      await resetCategory(id, env);
    }
    return new Response(null, { status: 204 });
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }
}

async function renderPage(view, categoryId, selectedDate, env) {
  const tasks = await getTasks(view, categoryId, selectedDate, env);
  const categories = await getAllCategories(env);

  let categoriesOptions = '<option value="">None</option>';
  categories.forEach(category => {
    categoriesOptions += `<option value="${category.id}">${category.name}</option>`;
  });

  let tasksRows = tasks
    .map(task => {
      return `
          <tr>
              <td><input type="text" class="form-control" value="${task.description}" name="description" form="update-form-${task.id}" required/></td>
              <td><input type="datetime-local" class="form-control" value="${task.due_date}" name="due_date" form="update-form-${task.id}" required/></td>
              <td><select class="form-select" form="update-form-${task.id}" name="category_id">${categoriesOptions.replace(`value="${task.category_id}"`, `value="${task.category_id}" selected`)}</select></td>
              <td><input type="number" class="form-control" min="1" max="4" value="${task.priority_level || ''}" name="priority_level" form="update-form-${task.id}"/></td>
              <td><select class="form-select" form="update-form-${task.id}" name="status" required>
                  <option value="active" ${task.status === 'active' ? 'selected' : ''}>Active</option>
                  <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
              </select></td>
              <td><button class="btn btn-info" form="update-form-${task.id}" type="submit">Update</button></td>
              <td><button class="btn btn-danger" onclick="deleteTask(${task.id})">Delete</button></td>
          </tr>
          <form id="update-form-${task.id}" method="post" action="/goals/update-task/${task.id}" style="display:none;"></form>
      `;
    })
    .join('');

  let categoriesRows = categories
    .map(category => {
      return `<tr>
          <td><input type="text" class="form-control" value="${category.name}" name="name" form="update-category-form-${category.id}" required/></td>
          <td>
              <button class="btn btn-success" form="update-category-form-${category.id}" type="submit">Update</button>
              <button class="btn btn-secondary" onclick="setView('category', ${category.id})" class="${view === 'category' && category.id === categoryId ? 'btn-danger' : 'btn-primary'} view-btn">Sort By</button>
              <button class="btn btn-warning" onclick="resetCategory(${category.id})">Reset</button>
              <button class="btn btn-danger" onclick="deleteCategory(${category.id})">Delete</button>
          </td>
          <form id="update-category-form-${category.id}" method="post" action="/goals/update-category/${category.id}" style="display:none;"></form>
      </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>ToDo List</title>
    <script>
    function deleteTask(id) {
        fetch('/goals/delete-task/' + id, { method: 'DELETE' })
        .then(() => {
            location.reload();
        })
        .catch(error => alert('Error deleting task: ' + error));
    }
    function deleteCategory(id) {
        fetch('/goals/delete-category/' + id, { method: 'DELETE' })
        .then(() => {
            location.reload();
        })
        .catch(error => alert('Error deleting category: ' + error));
    }
    function resetCategory(id) {
        fetch('/goals/reset-category/' + id, { method: 'DELETE' })
        .then(() => {
            location.reload();
        })
        .catch(error => alert('Error resetting category: ' + error));
    }
    function setView(view, categoryId = '', selectedDate = '') {
        localStorage.setItem('view', view);
        if(categoryId) {
            localStorage.setItem('category_id', categoryId);
        }
        if(selectedDate) {
            localStorage.setItem('selected_date', selectedDate);
        }
        const params = new URLSearchParams({ view });
        if(categoryId) {
            params.append('category_id', categoryId);
        }
        if(selectedDate) {
            params.append('date', selectedDate);
        }
        fetch('?' + params.toString())
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newTable = doc.querySelector('tbody');
            document.querySelector('tbody').innerHTML = newTable.innerHTML;
            updateViewButtons(view);
        })
        .catch(error => alert('Error setting view: ' + error));
    }
    function updateViewButtons(currentView) {
        document.querySelectorAll('button.view-btn').forEach(btn => {
            btn.classList.add('btn-primary');
            btn.classList.remove('btn-danger');
            if(btn.dataset.view === currentView){
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-danger');
            }
        });
    }
    document.addEventListener('DOMContentLoaded', function() {
        const currentView = localStorage.getItem('view') || 'default';
        const categoryId = localStorage.getItem('category_id') || '';
        const selectedDate = localStorage.getItem('selected_date') || new Date().toISOString().split('T')[0];
        setView(currentView, categoryId, selectedDate);
    });
    </script>
</head>
<body>
    <div class="container mt-5">
        <h1 class="mb-4">ToDo List</h1>
        <div class="mb-3">
            <button class="btn btn-primary me-2 view-btn" data-view="default" onclick="setView('default')">Default View</button>
            <button class="btn btn-primary me-2 view-btn" data-view="everything" onclick="setView('everything')">Everything View</button>
            <button class="btn btn-primary me-2 view-btn" data-view="category" onclick="setView('category')">Category View</button>
            <button class="btn btn-primary me-2 view-btn" data-view="completed" onclick="setView('completed')">Completed View</button>
        </div>
        <div class="mb-4">
            <input type="date" id="selectedDate" class="form-control w-auto d-inline" value="${selectedDate}">
            <button class="btn btn-info ms-2" onclick="setView('completed', '', document.getElementById('selectedDate').value)">Sort by Date</button>
        </div>
        <div>
            <form action="/goals/add-task" method="post" class="mb-4">
                <div class="row g-3">
                    <div class="col">
                        <input type="text" class="form-control" name="description" placeholder="Description" required/>
                    </div>
                    <div class="col">
                        <input type="datetime-local" class="form-control" name="due_date" required/>
                    </div>
                    <div class="col">
                        <select class="form-select" name="category_id">${categoriesOptions}</select>
                    </div>
                    <div class="col">
                        <input type="number" class="form-control" name="priority_level" min="1" max="4" placeholder="Priority (1-4)"/>
                    </div>
                    <div class="col">
                        <select class="form-select" name="status" required>
                            <option value="active" selected>Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div class="col-auto">
                        <button type="submit" class="btn btn-success">Add Task</button>
                    </div>
                </div>
            </form>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th colspan="2">Actions</th>
                    </tr>
                </thead>
                <tbody>${tasksRows}</tbody>
            </table>
        </div>
        <div>
            <form action="/goals/add-category" method="post" class="mb-4">
                <div class="input-group">
                    <input type="text" class="form-control" name="name" placeholder="Category Name" required/>
                    <button class="btn btn-success" type="submit">Add Category</button>
                </div>
            </form>
        </div>
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-light">
                    <tr>
                        <th>Category</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>${categoriesRows}</tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
}

async function getTasks(view, categoryId, selectedDate, env) {
  let stmt;
  const today = new Date().toISOString().split('T')[0];  // Keeping only the date part, time is ignored
  if (view === 'default') {
    // Modify the query to compare only the date parts; time is irrelevant for the comparison
    stmt = env.COOLFROG_GOALS.prepare(`SELECT * FROM tasks WHERE DATE(due_date) <= ? AND status = 'active' ORDER BY priority_level IS NULL, priority_level`);
    return (await stmt.bind(today).all()).results;
  } else if (view === 'category' && categoryId) {
    stmt = env.COOLFROG_GOALS.prepare(`SELECT * FROM tasks WHERE category_id = ? ORDER BY priority_level IS NULL, priority_level, due_date`);
    return (await stmt.bind(categoryId).all()).results;
  } else if (view === 'completed' && selectedDate) {
    stmt = env.COOLFROG_GOALS.prepare(`SELECT * FROM tasks WHERE status = 'completed' AND DATE(due_date) = ? ORDER BY due_date`);
    return (await stmt.bind(selectedDate).all()).results;
  } else {  // 'everything' view and others default to showing all tasks
    stmt = env.COOLFROG_GOALS.prepare(`SELECT * FROM tasks ORDER BY due_date, priority_level`);
    return (await stmt.all()).results;
  }
}

async function getAllCategories(env) {
  const stmt = env.COOLFROG_GOALS.prepare('SELECT * FROM categories ORDER BY name');
  return (await stmt.all()).results;
}

async function addTask(formData, env) {
  const description = formData.get('description');
  const due_date = formData.get('due_date');
  const category_id = formData.get('category_id') || null;
  const priority_level = formData.get('priority_level') || null;
  const status = formData.get('status');
  const stmt = env.COOLFROG_GOALS.prepare('INSERT INTO tasks (description, due_date, category_id, priority_level, status) VALUES (?, ?, ?, ?, ?)');
  await stmt.bind(description, due_date, category_id, priority_level, status).run();
}

async function addCategory(formData, env) {
  const name = formData.get('name');
  const stmt = env.COOLFROG_GOALS.prepare('INSERT INTO categories (name) VALUES (?)');
  await stmt.bind(name).run();
}

async function deleteTask(id, env) {
  const stmt = env.COOLFROG_GOALS.prepare(`DELETE FROM tasks WHERE id = ?`);
  await stmt.bind(id).run();
}

async function updateTask(id, formData, env) {
  const description = formData.get('description');
  const due_date = formData.get('due_date');
  const category_id = formData.get('category_id') || null;
  const priority_level = formData.get('priority_level') || null;
  const status = formData.get('status');
  const stmt = env.COOLFROG_GOALS.prepare(`UPDATE tasks SET description = ?, due_date = ?, category_id = ?, priority_level = ?, status = ? WHERE id = ?`);
  await stmt.bind(description, due_date, category_id, priority_level, status, id).run();
}

async function updateCategory(id, formData, env) {
  const name = formData.get('name');
  const stmt = env.COOLFROG_GOALS.prepare(`UPDATE categories SET name = ? WHERE id = ?`);
  await stmt.bind(name, id).run();
}

async function resetCategory(id, env) {
  const stmt = env.COOLFROG_GOALS.prepare('UPDATE tasks SET category_id = NULL WHERE category_id = ?');
  await stmt.bind(id).run();
}

async function deleteCategory(id, env) {
  // Delete tasks in the category first
  const deleteTasksStmt = env.COOLFROG_GOALS.prepare(`DELETE FROM tasks WHERE category_id = ?`);
  await deleteTasksStmt.bind(id).run();
  // Then delete the category
  const deleteCategoryStmt = env.COOLFROG_GOALS.prepare(`DELETE FROM categories WHERE id = ?`);
  await deleteCategoryStmt.bind(id).run();
}