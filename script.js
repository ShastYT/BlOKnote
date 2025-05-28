// Получаем элементы из HTML
const notesList = document.getElementById('notes-list');
const noteTitle = document.getElementById('note-title');
const noteText = document.getElementById('note-text');
const noteTags = document.getElementById('note-tags');
const saveBtn = document.getElementById('save-btn');
const searchInput = document.getElementById('search-input');

// Загружаем заметки из LocalStorage
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Сохраняем заметки в LocalStorage
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

let selectedColor = '#fff9c4'; // Желтый по умолчанию

// Обработчики цветовых опций
document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', () => {
        selectedColor = option.dataset.color;
        document.querySelectorAll('.color-option').forEach(opt =>
            opt.classList.remove('selected'));
        option.classList.add('selected');
    });
});

// Рендерим заметки
function renderNotes(filteredNotes = notes) {
    notesList.innerHTML = '';

    filteredNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.style.backgroundColor = note.color || '#fff9c4';

        // Название заметки
        const titleElement = document.createElement('div');
        titleElement.className = 'note-title';
        titleElement.textContent = note.title || 'Без названия';

        // Содержимое заметки
        const contentElement = document.createElement('div');
        contentElement.className = 'note-content';

        const lines = note.text.split('\n').filter(line => line.trim());
        lines.slice(0, 3).forEach(line => {
            const lineElement = document.createElement('span');
            lineElement.className = 'note-line';
            lineElement.textContent = line;
            contentElement.appendChild(lineElement);
        });

        if (lines.length > 3) {
            const moreElement = document.createElement('span');
            moreElement.className = 'note-line more';
            moreElement.textContent = '...';
            contentElement.appendChild(moreElement);
        }

        // Теги
        const tagsElement = document.createElement('div');
        tagsElement.className = 'note-tags';
        tagsElement.textContent = `Теги: ${note.tags.join(', ')}`;

        // Кнопки управления
        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.onclick = () => editNote(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = () => deleteNote(index);

        const btnContainer = document.createElement('div');
        btnContainer.className = 'note-actions';
        btnContainer.appendChild(editBtn);
        btnContainer.appendChild(deleteBtn);

        // Собираем заметку
        noteElement.appendChild(titleElement);
        noteElement.appendChild(contentElement);
        noteElement.appendChild(tagsElement);
        noteElement.appendChild(btnContainer);

        notesList.appendChild(noteElement);
    });
}

// Сохраняем заметку
function saveNote() {
    const title = noteTitle.value.trim();
    const text = noteText.value.trim();
    const tags = noteTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (text || title) {
        notes.push({
            title: title || 'Без названия',
            text,
            tags,
            color: selectedColor
        });
        saveNotes();
        renderNotes();
        noteTitle.value = '';
        noteText.value = '';
        noteTags.value = '';
    }
}

// Редактируем заметку
function editNote(index) {
    const note = notes[index];
    noteTitle.value = note.title;
    noteText.value = note.text;
    noteTags.value = note.tags.join(', ');
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.color === note.color);
    });
    selectedColor = note.color;
    deleteNote(index);
}

// Удаляем заметку
function deleteNote(index) {
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
}

// Обработчики событий
saveBtn.addEventListener('click', saveNote);
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(searchTerm) ||
        note.title.toLowerCase().includes(searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    renderNotes(filteredNotes);
});

// Инициализация
document.querySelector('.color-option').classList.add('selected');
renderNotes();