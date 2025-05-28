// Получаем элементы из HTML
const notesList = document.getElementById('notes-list');
const noteTitle = document.getElementById('note-title');
const noteText = document.getElementById('note-text');
const noteTags = document.getElementById('note-tags');
const saveBtn = document.getElementById('save-btn');
const searchInput = document.getElementById('search-input');
const colorPicker = document.getElementById('note-color');
const recentColorsContainer = document.getElementById('recent-colors');
const colorPreview = document.querySelector('.color-preview');


// Загружаем заметки из LocalStorage
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let editingIndex = null;
let selectedColor = colorPicker.value;
let recentColors = JSON.parse(localStorage.getItem('recentColors')) || ['#fff9c4', '#e3f2fd', '#f3e5f5'];

// Сохраняем заметки в LocalStorage
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Обработчик цветовых опций
colorPicker.addEventListener('input', (e) => {
    selectedColor = e.target.value;
    colorPreview.style.backgroundColor = selectedColor;
});

function updateRecentColors() {
    recentColorsContainer.innerHTML = '';
    recentColors.forEach(color => {
        const colorElement = document.createElement('div');
        colorElement.className = 'recent-color';
        colorElement.style.backgroundColor = color;
        colorElement.title = color;
        colorElement.addEventListener('click', () => {
            colorPicker.value = color;
            selectedColor = color;
            colorPreview.style.backgroundColor = color;
        });
        recentColorsContainer.appendChild(colorElement);
    });
}

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
        // Добавляем текущий цвет в историю
        if (!recentColors.includes(selectedColor)) {
            recentColors.unshift(selectedColor);
            if (recentColors.length > 5) recentColors.pop();
            localStorage.setItem('recentColors', JSON.stringify(recentColors));
            updateRecentColors();
        }

        const noteData = {
            title: title || 'Без названия',
            text,
            tags,
            color: selectedColor
        };

        if (editingIndex !== null) {
            notes[editingIndex] = noteData;
            editingIndex = null;
        } else {
            notes.push(noteData);
        }

        saveNotes();
        renderNotes();
        resetForm();
    }
}

// Редактируем заметку
function editNote(index) {
    const note = notes[index];
    noteTitle.value = note.title;
    noteText.value = note.text;
    noteTags.value = note.tags.join(', ');
    colorPicker.value = note.color;
    selectedColor = note.color;
    editingIndex = index;
}

// Удаляем заметку
function deleteNote(index) {
    if (confirm('Удалить эту заметку?')) {
        notes.splice(index, 1);
        saveNotes();
        renderNotes();
        if (editingIndex === index) {
            resetForm();
            editingIndex = null;
        }
    }
}

// Сбрасываем форму
function resetForm() {
    noteTitle.value = '';
    noteText.value = '';
    noteTags.value = '';
    editingIndex = null;
    colorPicker.value = "#fff9c4";
    selectedColor = "#fff9c4";
    colorPreview.style.backgroundColor = "#fff9c4";
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

// Первый рендер
renderNotes();
updateRecentColors();