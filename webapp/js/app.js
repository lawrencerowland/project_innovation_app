let categories = [];
let statuses = [];
let ideas = JSON.parse(localStorage.getItem('ideas') || '[]');
ideas.forEach(i => {
  if (!i.comments) i.comments = [];
});
let currentIdeaIndex = null;

function populateCategories() {
  const ideaSelect = document.getElementById('idea-category');
  ideaSelect.innerHTML = '';
  const filterSelect = document.getElementById('filter-category');
  filterSelect.innerHTML = '<option value="">All</option>';
  categories.forEach(cat => {
    const option1 = document.createElement('option');
    option1.value = cat;
    option1.textContent = cat;
    ideaSelect.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = cat;
    option2.textContent = cat;
    filterSelect.appendChild(option2);
  });
}

function populateStatuses() {
  const filterSelect = document.getElementById('filter-status');
  filterSelect.innerHTML = '<option value="">All</option>';
  statuses.forEach(st => {
    const option = document.createElement('option');
    option.value = st;
    option.textContent = st;
    filterSelect.appendChild(option);
  });
}

function loadStatuses() {
  fetch('data/statuses.json')
    .then(res => res.json())
    .then(data => {
      statuses = data.ideaStatuses || [];
      populateStatuses();
      filterIdeas();
    })
    .catch(err => console.error('Failed to load statuses', err));
}

function saveIdeas() {
  localStorage.setItem('ideas', JSON.stringify(ideas));
}

function renderIdeas(data = ideas) {
  const list = document.getElementById('ideas-list');
  list.innerHTML = '';
  data.forEach((idea, idx) => {
    const li = document.createElement('li');
    li.className = 'idea-item';
    const snippet = idea.description.length > 120 ? idea.description.slice(0, 117) + '...' : idea.description;
    li.innerHTML = `<h3>${idea.title}</h3><p>${snippet}</p><p><strong>Category:</strong> ${idea.category}</p><p><strong>Status:</strong> ${idea.status}</p>`;
    li.addEventListener('click', () => openIdeaModal(idx));
    list.appendChild(li);
  });
}

function addIdea(event) {
  event.preventDefault();
  const title = document.getElementById('idea-title').value.trim();
  const description = document.getElementById('idea-description').value.trim();
  const category = document.getElementById('idea-category').value;
  if (!title || !description) return;
  const newIdea = new Idea(title, description, category);
  ideas.push(newIdea);
  saveIdeas();
  filterIdeas();
  event.target.reset();
}

function filterIdeas() {
  const search = document.getElementById('filter-search').value.toLowerCase();
  const cat = document.getElementById('filter-category').value;
  const stat = document.getElementById('filter-status').value;
  const filtered = ideas.filter(idea => {
    const matchSearch = !search || idea.title.toLowerCase().includes(search) || idea.description.toLowerCase().includes(search);
    const matchCat = !cat || idea.category === cat;
    const matchStatus = !stat || idea.status === stat;
    return matchSearch && matchCat && matchStatus;
  });
  renderIdeas(filtered);
}

function renderComments(comments) {
  const list = document.getElementById('comments-list');
  list.innerHTML = '';
  comments.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.author || 'Anon'}: ${c.text}`;
    list.appendChild(li);
  });
}

function openIdeaModal(index) {
  currentIdeaIndex = index;
  const idea = ideas[index];
  document.getElementById('modal-title').textContent = idea.title;
  document.getElementById('modal-description').textContent = idea.description;
  renderComments(idea.comments || []);
  document.getElementById('idea-modal').classList.remove('hidden');
}

function closeIdeaModal() {
  document.getElementById('idea-modal').classList.add('hidden');
  currentIdeaIndex = null;
}

function addComment(event) {
  event.preventDefault();
  const text = document.getElementById('comment-text').value.trim();
  if (!text || currentIdeaIndex === null) return;
  const comment = new Comment(text, '');
  ideas[currentIdeaIndex].comments.push(comment);
  saveIdeas();
  renderComments(ideas[currentIdeaIndex].comments);
  event.target.reset();
}

document.getElementById('idea-form').addEventListener('submit', addIdea);
document.getElementById('filter-search').addEventListener('input', filterIdeas);
document.getElementById('filter-category').addEventListener('change', filterIdeas);
document.getElementById('filter-status').addEventListener('change', filterIdeas);
document.getElementById('comment-form').addEventListener('submit', addComment);
document.getElementById('close-modal').addEventListener('click', closeIdeaModal);

function loadCategories() {
  fetch('data/categories.json')
    .then(res => res.json())
    .then(data => {
      categories = data;
      populateCategories();
      filterIdeas();
    })
    .catch(err => console.error('Failed to load categories', err));
}

loadCategories();
loadStatuses();
filterIdeas();
