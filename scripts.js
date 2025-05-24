// ==================== АВТОРИЗАЦИЯ ====================
// Функции для модального окна авторизации
function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    modal.classList.add('animate__animated', 'animate__fadeIn');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('animate__animated', 'animate__fadeOut');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('animate__fadeIn', 'animate__fadeOut');
        document.body.style.overflow = '';
    }, 300);
}

// Валидация формы
function validateAuthForm(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showAuthError('Пожалуйста, введите email');
        return false;
    }
    if (!emailRegex.test(email)) {
        showAuthError('Пожалуйста, введите корректный email');
        return false;
    }
    if (!password || password.length < 6) {
        showAuthError('Пароль должен содержать минимум 6 символов');
        return false;
    }
    return true;
}

// Показать ошибку авторизации
function showAuthError(message) {
    const errorElement = document.getElementById('auth-error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

// Обработчик формы входа
document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const submitBtn = document.getElementById('auth-submit');
    const loader = document.getElementById('auth-loader');

    // Очистка предыдущих ошибок
    document.getElementById('auth-error').classList.add('hidden');

    // Простая валидация
    if (!validateAuthForm(email, password)) {
        return;
    }

    // Блокировка кнопки и показ лоадера
    submitBtn.disabled = true;
    loader.classList.remove('hidden');

    // Имитация отправки данных на сервер
    setTimeout(() => {
        try {
            // Здесь должна быть реальная логика авторизации
            console.log(`Попытка входа: ${email}`);
            
            // Имитация успешного входа
            alert(`Вы успешно вошли как ${email}`);
            closeAuthModal();
            updateUIAfterAuth(email);
        } catch (error) {
            showAuthError(error.message || 'Ошибка при авторизации');
        } finally {
            submitBtn.disabled = false;
            loader.classList.add('hidden');
        }
    }, 1500);
});

// Обновление интерфейса после авторизации
function updateUIAfterAuth(email) {
    // Меняем кнопку меню на email пользователя
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
        menuBtn.innerHTML = `
            <span class="truncate max-w-[120px]">${email}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
        `;
    }

    // Можно добавить дополнительные изменения интерфейса для авторизованного пользователя
    console.log(`Пользователь ${email} авторизован`);
}

// Закрытие модального окна при клике вне его области
document.getElementById('auth-modal')?.addEventListener('click', function (e) {
    if (e.target === this) {
        closeAuthModal();
    }
});

// Управление боковым меню
function toggleMenu() {
    const sidebar = document.getElementById('sidebar-menu');
    const overlay = document.getElementById('menu-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }
}

function closeMenu() {
    const sidebar = document.getElementById('sidebar-menu');
    const overlay = document.getElementById('menu-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Обработчики событий для меню
document.addEventListener('DOMContentLoaded', () => {
    // Обработчик клика по пункту "Авторизация" в меню
    const authLinks = document.querySelectorAll('[data-auth-open]');
    authLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            closeMenu();
            openAuthModal();
        });
    });

    // Закрытие меню при клике вне его
    document.getElementById('menu-overlay')?.addEventListener('click', closeMenu);

    // Закрытие меню при нажатии ESC
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    // Обработчики для закрытия меню
    document.getElementById('close-menu')?.addEventListener('click', closeMenu);
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
});
