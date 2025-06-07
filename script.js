document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const stickerContainer = document.getElementById('stickerContainer');
    const addStickerBtn = document.getElementById('addStickerBtn');
    const editModal = document.getElementById('editModal');
    const confirmModal = document.getElementById('confirmModal');
    const stickerContent = document.getElementById('stickerContent');
    const stickerColor = document.getElementById('stickerColor');
    const stickerTags = document.getElementById('stickerTags');
    const saveStickerBtn = document.getElementById('saveStickerBtn');
    const deleteStickerBtn = document.getElementById('deleteStickerBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const centerStickersBtn = document.getElementById('centerStickersBtn');

    let currentSticker = null;
    let isPanning = false;
    let startPanX, startPanY;
    let containerOffset = { x: 0, y: 0 };
    let lastPanPosition = { x: 0, y: 0 };

    function saveStickers() {
        const stickers = [];
        document.querySelectorAll('.sticker').forEach(sticker => {
            stickers.push({
                content: sticker.querySelector('.sticker-content').textContent,
                color: sticker.style.backgroundColor,
                x: parseInt(sticker.style.left),
                y: parseInt(sticker.style.top),
                tags: sticker.dataset.tags || ''
            });
        });
        localStorage.setItem('stickers', JSON.stringify(stickers));
    }

    function loadStickers() {
        const savedStickers = localStorage.getItem('stickers');
        if (savedStickers) {
            JSON.parse(savedStickers).forEach(sticker => {
                createSticker(sticker.content, sticker.color, sticker.x, sticker.y, sticker.tags);
            });
        } else {
            // Создаем начальные стикеры, если нет сохраненных
            createSticker('Двойной клик для редактирования', '#ffcc80', 200, 200, 'инструкция, помощь');
            createSticker('Перетаскивайте за правый верхний угол', '#a5d6a7', 400, 150, 'пример, тест');
            createSticker('Купить молоко', '#80deea', 300, 300, 'покупки, важно');
        }
    }

    // Добавление нового стикера
    addStickerBtn.addEventListener('click', () => {
        const viewportCenterX = window.innerWidth / 2 - 125;
        const viewportCenterY = window.innerHeight / 2 - 90;
        createSticker('Новый стикер', '#ffeb3b',
            viewportCenterX - containerOffset.x,
            viewportCenterY - containerOffset.y,
            '');
    });

    centerStickersBtn.addEventListener('click', () => {
        stickerContainer.style.transition = 'transform 0.5s ease-out';
        stickerContainer.style.transform = 'translate(0, 0)';
        containerOffset = { x: 0, y: 0 };

        setTimeout(() => {
            stickerContainer.style.transition = 'none';
        }, 500);
    });

    function centerView(x, y) {
        const targetX = -x + window.innerWidth / 2 - 125;
        const targetY = -y + window.innerHeight / 2 - 90;

        stickerContainer.style.transition = 'transform 0.5s ease-out';
        stickerContainer.style.transform = `translate(${targetX}px, ${targetY}px)`;

        setTimeout(() => {
            containerX = targetX;
            containerY = targetY;
            stickerContainer.style.transition = 'none';
        }, 500);
    }

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
                sticker.style.display = 'block';
                sticker.style.animation = 'popIn 0.3s ease-out';
            } else {
                sticker.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    sticker.style.display = 'none';
                }, 300);
            }
        });
    }

    function clearSearch() {
        searchInput.value = '';
        const stickers = document.querySelectorAll('.sticker');
        stickers.forEach(sticker => {
            sticker.style.display = 'block';
            sticker.style.animation = 'popIn 0.3s ease-out';
        });
    }

    // Создание стикера
    function createSticker(content, color, x, y, tags) {
        const sticker = document.createElement('div');
        sticker.className = 'sticker';
        sticker.style.backgroundColor = color;
        sticker.style.left = `${x}px`;
        sticker.style.top = `${y}px`;
        sticker.dataset.tags = tags;

        // Ручка для перетаскивания
        const dragHandle = document.createElement('div');
        dragHandle.className = 'sticker-drag-handle';
        sticker.appendChild(dragHandle);

        // Содержимое стикера
        const contentDiv = document.createElement('div');
        contentDiv.className = 'sticker-content';
        contentDiv.textContent = content;
        sticker.appendChild(contentDiv);

        // Теги
        if (tags) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'sticker-tags';
            tagsDiv.textContent = `Теги: ${tags}`;
            sticker.appendChild(tagsDiv);
        }

        // Двойной клик для редактирования
        sticker.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            openEditModal(sticker);
        });

        stickerContainer.appendChild(sticker);
        initStickerDrag(sticker, dragHandle);
        return sticker;
    }

    // Перетаскивание стикера
    function initStickerDrag(sticker, dragHandle) {
        let isDragging = false;
        let startX, startY, stickerX, stickerY;

        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            sticker.classList.add('dragging');
            startX = e.clientX;
            startY = e.clientY;
            stickerX = parseInt(sticker.style.left) || 0;
            stickerY = parseInt(sticker.style.top) || 0;
            sticker.style.zIndex = '1000';
            dragHandle.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            sticker.style.left = `${stickerX + dx}px`;
            sticker.style.top = `${stickerY + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                sticker.style.zIndex = '1';
                dragHandle.style.cursor = 'grab';
                sticker.classList.remove('dragging');
            }
        });

        sticker.querySelector('.sticker-content').addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        sticker.querySelector('.sticker-tags')?.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
    }

    // Открытие модального окна редактирования
    function openEditModal(sticker) {
        currentSticker = sticker;
        stickerContent.value = sticker.querySelector('.sticker-content').textContent;
        stickerColor.value = rgbToHex(sticker.style.backgroundColor);
        stickerTags.value = sticker.dataset.tags || '';
        editModal.style.display = 'block';
    }

    // Закрытие модальных окон
    function closeModal() {
        editModal.style.display = 'none';
        confirmModal.style.display = 'none';
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
            saveStickers();
            closeModal();

        }
    });

    deleteStickerBtn.addEventListener('click', () => {
        confirmModal.style.display = 'block';
    });

    // Удаление стикера
    confirmDeleteBtn.addEventListener('click', () => {
        if (currentSticker) {
            currentSticker.style.transform = 'scale(0.8)';
            currentSticker.style.opacity = '0';
            currentSticker.style.transition = 'all 0.3s ease';

            setTimeout(() => {
                if (currentSticker && currentSticker.parentNode) {
                    currentSticker.remove();
                }
                saveStickers();
                closeModal();
            }, 300);
        }
    });

    cancelDeleteBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);

    stickerContainer.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.app-header, .controls, .sticker-drag-handle, .modal')) {
            isPanning = true;
            startPanX = e.clientX;
            startPanY = e.clientY;
            stickerContainer.style.cursor = 'grabbing';
            lastPanPosition = { ...containerOffset };
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            const dx = e.clientX - startPanX;
            const dy = e.clientY - startPanY;

            containerOffset.x = lastPanPosition.x + dx;
            containerOffset.y = lastPanPosition.y + dy;

            stickerContainer.style.transform = `translate(${containerOffset.x}px, ${containerOffset.y}px)`;
        }
    });

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeModal();
        }
    });

    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            closeModal();
        }
    });

    document.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            stickerContainer.style.cursor = 'grab';
        }
    });


    // Вспомогательная функция
    function rgbToHex(rgb) {
        if (!rgb || rgb === '') return '#ffeb3b';
        if (rgb.startsWith('#')) return rgb;
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues || rgbValues.length < 3) return '#ffeb3b';
        return `#${rgbValues.map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
    }

    // Создаем начальные стикеры
    loadStickers();
});