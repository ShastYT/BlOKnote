document.addEventListener('DOMContentLoaded', () => {
    const stickerContainer = document.getElementById('stickerContainer');
    const addStickerBtn = document.getElementById('addStickerBtn');
    const editModal = document.getElementById('editModal');
    const stickerContent = document.getElementById('stickerContent');
    const stickerColor = document.getElementById('stickerColor');
    const stickerTags = document.getElementById('stickerTags');
    const saveStickerBtn = document.getElementById('saveStickerBtn');
    const deleteStickerBtn = document.getElementById('deleteStickerBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    let currentSticker = null;

    // Добавление нового стикера
    addStickerBtn.addEventListener('click', () => {
        createSticker('Новый стикер', '#ffeb3b', 100, 100, '');
    });

    // Поиск стикеров
    searchBtn.addEventListener('click', searchStickers);
    clearSearchBtn.addEventListener('click', clearSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchStickers();
    });

    function searchStickers() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            clearSearch();
            return;
        }

        const stickers = document.querySelectorAll('.sticker');
        stickers.forEach(sticker => {
            const content = sticker.querySelector('.sticker-content').textContent.toLowerCase();
            const tags = sticker.dataset.tags ? sticker.dataset.tags.toLowerCase() : '';

            if (content.includes(query) || tags.includes(query)) {
                sticker.classList.remove('hidden');
            } else {
                sticker.classList.add('hidden');
            }
        });
    }

    function clearSearch() {
        searchInput.value = '';
        document.querySelectorAll('.sticker').forEach(sticker => {
            sticker.classList.remove('hidden');
        });
    }

    // Создание стикера
    function createSticker(content, color, x, y, tags) {
        const sticker = document.createElement('div');
        sticker.className = 'sticker';
        sticker.style.backgroundColor = color;
        sticker.style.left = `${x}px`;
        sticker.style.top = `${y}px`;
        sticker.style.zIndex = '1';
        sticker.dataset.tags = tags;

        // Добавляем ручку для перетаскивания
        const dragHandle = document.createElement('div');
        dragHandle.className = 'sticker-drag-handle';
        sticker.appendChild(dragHandle);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'sticker-content';
        contentDiv.textContent = content;
        sticker.appendChild(contentDiv);

        if (tags) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'sticker-tags';
            tagsDiv.textContent = `Теги: ${tags}`;
            sticker.appendChild(tagsDiv);
        }

        sticker.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            openEditModal(sticker);
        });

        stickerContainer.appendChild(sticker);
        initStickerDrag(sticker, dragHandle);
        return sticker;
    }

    // Функция перетаскивания
    function initStickerDrag(sticker, dragHandle) {
        let isDragging = false;
        let startX, startY, stickerX, stickerY;

        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;

            // Фиксируем начальные координаты
            startX = e.clientX;
            startY = e.clientY;

            // Получаем текущее положение стикера
            stickerX = parseInt(sticker.style.left) || 0;
            stickerY = parseInt(sticker.style.top) || 0;

            sticker.style.zIndex = '1000';
            dragHandle.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // Вычисляем смещение от начальной точки
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Применяем смещение к стикеру
            sticker.style.left = `${stickerX + dx}px`;
            sticker.style.top = `${stickerY + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                sticker.style.zIndex = '1';
                dragHandle.style.cursor = 'grab';
            }
        });

        // Предотвращаем запуск перетаскивания при клике на содержимое
        sticker.querySelector('.sticker-content').addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        sticker.querySelector('.sticker-tags')?.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
    }

    // Открытие окна редактирования
    function openEditModal(sticker) {
        currentSticker = sticker;
        stickerContent.value = sticker.querySelector('.sticker-content').textContent;
        stickerColor.value = rgbToHex(sticker.style.backgroundColor);
        stickerTags.value = sticker.dataset.tags || '';
        editModal.style.display = 'block';
    }

    // Закрытие модального окна
    function closeModal() {
        editModal.style.display = 'none';
        currentSticker = null;
    }

    // Сохранение изменений
    saveStickerBtn.addEventListener('click', () => {
        if (currentSticker) {
            currentSticker.querySelector('.sticker-content').textContent = stickerContent.value;
            currentSticker.style.backgroundColor = stickerColor.value;

            const tags = stickerTags.value.trim();
            currentSticker.dataset.tags = tags;

            let tagsDiv = currentSticker.querySelector('.sticker-tags');
            if (tags) {
                if (!tagsDiv) {
                    tagsDiv = document.createElement('div');
                    tagsDiv.className = 'sticker-tags';
                    currentSticker.appendChild(tagsDiv);
                }
                tagsDiv.textContent = `Теги: ${tags}`;
            } else if (tagsDiv) {
                tagsDiv.remove();
            }

            closeModal();
        }
    });

    // Удаление стикера
    deleteStickerBtn.addEventListener('click', () => {
        if (currentSticker) {
            currentSticker.remove();
            closeModal();
        }
    });

    // Закрытие модалки
    closeModalBtn.addEventListener('click', closeModal);

    // RGB в HEX
    function rgbToHex(rgb) {
        if (!rgb || rgb === '') return '#ffeb3b';
        if (rgb.startsWith('#')) return rgb;

        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return '#ffeb3b';

        return `#${rgbValues.map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
    }

    // Создаем несколько стикеров при загрузке
    createSticker('Двойной клик для редактирования', '#ffcc80', 200, 200, 'инструкция, помощь');
    createSticker('Перетаскивайте меня', '#a5d6a7', 400, 150, 'пример, тест');
    createSticker('Купить молоко', '#80deea', 300, 300, 'покупки, важно');
});