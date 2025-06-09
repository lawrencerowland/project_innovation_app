const categories = ['General', 'UI', 'Process', 'Cost Reduction'];
let ideas = JSON.parse(localStorage.getItem('ideas') || '[]');

function populateCategories() {
  const select = document.getElementById('idea-category');
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

function saveIdeas() {
  localStorage.setItem('ideas', JSON.stringify(ideas));
}

function renderIdeas() {
  const list = document.getElementById('ideas-list');
  list.innerHTML = '';
  ideas.forEach((idea, index) => {
    const li = document.createElement('li');
    li.className = 'idea-item';
    li.innerHTML = `<h3>${idea.title}</h3><p>${idea.description}</p><p><strong>Category:</strong> ${idea.category}</p>`;
    list.appendChild(li);
  });
}

function addIdea(event) {
  event.preventDefault();
  const title = document.getElementById('idea-title').value.trim();
  const description = document.getElementById('idea-description').value.trim();
  const category = document.getElementById('idea-category').value;
  if (!title || !description) return;
  const newIdea = { title, description, category, status: 'Submitted', created: new Date().toISOString() };
  ideas.push(newIdea);
  saveIdeas();
  renderIdeas();
  event.target.reset();
}

document.getElementById('idea-form').addEventListener('submit', addIdea);

populateCategories();
renderIdeas();
