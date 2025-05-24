// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================

// Данные авторизации
let authToken = localStorage.getItem('authToken') || null;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
// Данные тренажёра
let currentDepositTask = {};
let currentAnnuityTask = {};
let currentDiffTask = {};
let currentInvestTask = {};
let currentEgeTask = {};
let score = 0;
let totalTasks = 0;
let answeredDeposit = false;
let answeredAnnuity = false;
let answeredDiff = false;
let answeredInvest = false;
let answeredEge = false;
let currentLevel = 'basic';
let egeTasksCompleted = 0;
let egeTotalScore = 0;
// ==================== АВТОРИЗАЦИЯ ====================

// Инициализация интерфейса авторизации
function initAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    const profileBtn = document.getElementById('profile-btn');
    
    if (authToken && currentUser) {
        // Пользователь авторизован
        authBtn.classList.add('hidden');
        profileBtn.classList.remove('hidden');
        document.getElementById('user-email').textContent = currentUser.email;
        
        // Обновляем меню
        updateMenuForAuthUser();
    } else {
        // Пользователь не авторизован
        authBtn.classList.remove('hidden');
        profileBtn.classList.add('hidden');
        
        // Обновляем меню
        updateMenuForGuest();
    }
}
// Обновление меню для авторизованного пользователя
function updateMenuForAuthUser() {
    const menuItems = `
        <li><a href="#" onclick="showProfile()">Профиль</a></li>
        <li><a href="#">Статистика</a></li>
        <li><a href="#">Таблица лидеров</a></li>
        <li><a href="#" onclick="logout()">Выйти</a></li>
    `;
    document.querySelector('#sidebar-menu ul').innerHTML = menuItems;
}

// Обновление меню для гостя
function updateMenuForGuest() {
    const menuItems = `
        <li><a href="#">О тренажёре</a></li>
        <li><a href="#">Таблица лидеров</a></li>
        <li><a href="#" onclick="openAuthModal()">Войти</a></li>
        <li><a href="#" onclick="openAuthModal('register')">Регистрация</a></li>
    `;
    document.querySelector('#sidebar-menu ul').innerHTML = menuItems;
}
// Функции для модального окна авторизации
function openAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const title = modal.querySelector('h2');
    const submitBtn = modal.querySelector('#auth-submit');
    const switchLink = modal.querySelector('#auth-switch-mode');
    
    if (mode === 'login') {
        title.textContent = 'Авторизация';
        submitBtn.textContent = 'Войти';
        switchLink.innerHTML = 'Нет аккаунта? <a href="#" class="text-blue-400 hover:underline" onclick="openAuthModal(\'register\')">Зарегистрируйтесь</a>';
    } else {
        title.textContent = 'Регистрация';
        submitBtn.textContent = 'Зарегистрироваться';
        switchLink.innerHTML = 'Уже есть аккаунт? <a href="#" class="text-blue-400 hover:underline" onclick="openAuthModal(\'login\')">Войдите</a>';
    }
    
    modal.dataset.mode = mode;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('auth-error').classList.add('hidden');
    document.getElementById('login-form').reset();
}

// Валидация формы
function validateAuthForm(email, password, isRegister = false) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errorElement = document.getElementById('auth-error');
    
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
    
    if (isRegister && password.length < 8) {
        showAuthError('Пароль должен содержать минимум 8 символов');
        return false;
    }
    
    return true;
}

// Показать ошибку авторизации
function showAuthError(message) {
    const errorElement = document.getElementById('auth-error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

// Имитация API для авторизации
async function authApiRequest(url, data) {
    // В реальном приложении здесь будет fetch к вашему бэкенду
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Имитация успешного ответа
            if (url === '/login' && data.email === 'test@example.com' && data.password === 'password123') {
                resolve({
                    token: 'mock_jwt_token',
                    user: { email: data.email }
                });
            } 
            // Имитация регистрации
            else if (url === '/register') {
                resolve({
                    token: 'mock_jwt_token',
                    user: { email: data.email }
                });
            } 
            else {
                reject(new Error('Неверный email или пароль'));
            }
        }, 1000);
    });
}

// Обработчик формы авторизации/регистрации
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const modal = document.getElementById('auth-modal');
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const isRegister = modal.dataset.mode === 'register';
    const submitBtn = document.getElementById('auth-submit');
    const loader = document.getElementById('auth-loader');
    const authText = document.getElementById('auth-text');
    
    // Валидация
    if (!validateAuthForm(email, password, isRegister)) return;
    
    try {
        // Показываем лоадер
        submitBtn.disabled = true;
        authText.classList.add('hidden');
        loader.classList.remove('hidden');
        
        // Имитация запроса к API
        const response = await authApiRequest(
            isRegister ? '/register' : '/login', 
            { email, password }
        );
        
        // Сохраняем токен и данные пользователя
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Обновляем интерфейс
        initAuthUI();
        closeAuthModal();
        
        // Показываем уведомление об успешной авторизации
        showToast(isRegister ? 'Регистрация прошла успешно!' : 'Вы успешно вошли!');
        
    } catch (error) {
        showAuthError(error.message || 'Ошибка при авторизации');
    } finally {
        submitBtn.disabled = false;
        authText.classList.remove('hidden');
        loader.classList.add('hidden');
    }
});

// Выход из системы
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    initAuthUI();
    closeMenu();
    showToast('Вы вышли из системы');
}

// Показать профиль пользователя
function showProfile() {
    if (!currentUser) return;
    
    alert(`Профиль пользователя:\nEmail: ${currentUser.email}`);
    closeMenu();
}

// Показать toast-уведомление
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

  // Закрытие по клику вне модального окна
  document.getElementById('auth-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      closeAuthModal();
    }
  });

// ==================== УПРАВЛЕНИЕ МЕНЮ ====================

function toggleMenu() {
    const sidebar = document.getElementById('sidebar-menu');
    const overlay = document.getElementById('menu-overlay');
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function closeMenu() {
    document.getElementById('sidebar-menu').classList.remove('open');
    document.getElementById('menu-overlay').style.display = 'none';
    document.body.style.overflow = '';
}

// Глобальные переменные
let currentDepositTask = {};
let currentAnnuityTask = {};
let currentDiffTask = {};
let currentInvestTask = {};
let currentEgeTask = {};
let score = 0;
let totalTasks = 0;
let answeredDeposit = false;
let answeredAnnuity = false;
let answeredDiff = false;
let answeredInvest = false;
let answeredEge = false;
let currentLevel = 'basic'; // 'basic' или 'advanced'
let egeTasksCompleted = 0;
let egeTotalScore = 0;

// Управление боковым меню
function toggleMenu() {
  const sidebar = document.getElementById('sidebar-menu');
  const overlay = document.getElementById('menu-overlay');
  
  // Проверка на существование элементов для надежности
  if (sidebar && overlay) {
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    
    // Блокировка прокрутки тела страницы при открытом меню
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
  }
}
// Создание анимированного фона
function createBubbles() {
    const container = document.getElementById('bubbles-container');
    if (!container) return;
    
    container.innerHTML = '';
    const colors = [
        'rgba(0, 242, 255, 0.1)',
        'rgba(180, 0, 255, 0.1)',
        'rgba(255, 0, 195, 0.1)'
    ];
    
    for (let i = 0; i < 20; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('neon-bubble');
        
        const size = Math.random() * 200 + 50;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * -20;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = 500 + Math.random() * 500;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        bubble.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${posX}px;
            top: ${posY}px;
            background: ${color};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            --tx: ${tx}px;
            --ty: ${ty}px;
        `;
        
        container.appendChild(bubble);
    }
}

// Управление табами
function openTab(event, tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.add('hidden');
        tabContents[i].classList.remove('active');
    }
    
    const tabButtons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('tab-active');
        tabButtons[i].classList.add('tab-inactive');
    }
    
    document.getElementById(tabName).classList.remove('hidden');
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.remove('tab-inactive');
    event.currentTarget.classList.add('tab-active');
    
    // Генерация задач при переключении вкладок
    if (tabName === 'deposit') generateDepositTask();
    if (tabName === 'annuity') generateAnnuityTask();
    if (tabName === 'diff') generateDiffTask();
    if (tabName === 'invest') generateInvestTask();
    if (tabName === 'ege') generateEgeTask();
}

// Переключение уровня сложности
function changeLevel(level) {
    currentLevel = level;
    
    // Обновляем стили кнопок
    document.getElementById('basic-tab').className = level === 'basic' ? 'level-tab active' : 'level-tab inactive';
    document.getElementById('advanced-tab').className = level === 'advanced' ? 'level-tab active' : 'level-tab inactive';
    
    // Перегенерируем текущую задачу
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const tabId = activeTab.id;
        if (tabId === 'deposit') generateDepositTask();
        if (tabId === 'annuity') generateAnnuityTask();
        if (tabId === 'diff') generateDiffTask();
        if (tabId === 'invest') generateInvestTask();
        if (tabId === 'ege') generateEgeTask();
    }
}

// Установка уровня сложности для задач ЕГЭ
function setEgeLevel(level) {
    currentLevel = level;
    
    // Обновляем стили кнопок
    document.getElementById('ege-basic-btn').className = level === 'basic' ? 'px-4 py-2 rounded-l-lg font-medium bg-red-900/50 text-white border border-red-500' : 'px-4 py-2 rounded-l-lg font-medium bg-gray-800/50 text-white/70 border border-gray-700';
    document.getElementById('ege-advanced-btn').className = level === 'advanced' ? 'px-4 py-2 rounded-r-lg font-medium bg-red-900/50 text-white border border-red-500' : 'px-4 py-2 rounded-r-lg font-medium bg-gray-800/50 text-white/70 border border-gray-700';
    
    // Сброс счетчиков при смене уровня
    egeTasksCompleted = 0;
    egeTotalScore = 0;
    document.getElementById('ege-score').textContent = '0';
    document.getElementById('ege-tasks').textContent = '0/10';
    document.getElementById('ege-new-task-btn').disabled = false;
    
    // Генерируем новую задачу
    generateEgeTask();
}

// Обновление прогресса
function updateProgress() {
    let totalCorrect = 0;
    let totalTasks = 0;
    
    ['deposit', 'annuity', 'diff', 'invest', 'ege'].forEach(type => {
        totalCorrect += parseInt(document.getElementById(`${type}-score`).textContent);
        totalTasks += parseInt(document.getElementById(`${type}-total`).textContent);
    });
    
    const progress = totalTasks > 0 ? Math.round((totalCorrect / totalTasks) * 100) : 0;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('total-score').textContent = `${progress}%`;
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    createBubbles();
    generateDepositTask();
    setEgeLevel('basic');
});

// Проверка ответов для вкладов
function checkDepositAnswer() {
    const alertDiv = document.getElementById('deposit-alert');
    const answerInput = document.getElementById('deposit-answer');
    const resultDiv = document.getElementById('deposit-result');
    
    if (answeredDeposit) {
        resultDiv.textContent = "Вы уже ответили! Нажмите 'Новая задача'.";
        resultDiv.className = 'bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value;
    const userAnswer = parseFloat(userInput);
    
    if (isNaN(userAnswer)) {
        alertDiv.textContent = 'Пожалуйста, введите корректное число';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredDeposit = true;
    totalTasks++;
    
    const roundedAnswer = Math.round(userAnswer * 100) / 100;
    const isCorrect = Math.abs(roundedAnswer - currentDepositTask.correct) < 0.01;
    
    if (isCorrect) {
        resultDiv.textContent = `✅ Правильно! Ответ: ${currentDepositTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-green-900/20 text-green-400 neon-border';
        score++;
    } else {
        resultDiv.textContent = `❌ Неправильно. Правильный ответ: ${currentDepositTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-red-900/20 text-red-400 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;
    
    const scoreSpan = document.getElementById('deposit-score');
    scoreSpan.textContent = parseInt(scoreSpan.textContent) + (isCorrect ? 1 : 0);
    const totalSpan = document.getElementById('deposit-total');
    totalSpan.textContent = parseInt(totalSpan.textContent) + 1;
    
    updateProgress();
}

// Проверка ответов для аннуитетных кредитов
function checkAnnuityAnswer() {
    const alertDiv = document.getElementById('annuity-alert');
    const answerInput = document.getElementById('annuity-answer');
    const resultDiv = document.getElementById('annuity-result');
    
    if (answeredAnnuity) {
        resultDiv.textContent = "Вы уже ответили! Нажмите 'Новая задача'.";
        resultDiv.className = 'bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value;
    const userAnswer = parseFloat(userInput);
    
    if (isNaN(userAnswer)) {
        alertDiv.textContent = 'Пожалуйста, введите корректное число';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredAnnuity = true;
    totalTasks++;
    
    const roundedAnswer = Math.round(userAnswer * 100) / 100;
    const isCorrect = Math.abs(roundedAnswer - currentAnnuityTask.correct) < 0.01;
    
    if (isCorrect) {
        resultDiv.textContent = `✅ Правильно! Ответ: ${currentAnnuityTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-green-900/20 text-green-400 neon-border';
        score++;
    } else {
        resultDiv.textContent = `❌ Неправильно. Правильный ответ: ${currentAnnuityTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-red-900/20 text-red-400 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;
    
    const scoreSpan = document.getElementById('annuity-score');
    scoreSpan.textContent = parseInt(scoreSpan.textContent) + (isCorrect ? 1 : 0);
    const totalSpan = document.getElementById('annuity-total');
    totalSpan.textContent = parseInt(totalSpan.textContent) + 1;
    
    updateProgress();
}

// Проверка ответов для дифференцированных кредитов
function checkDiffAnswer() {
    const alertDiv = document.getElementById('diff-alert');
    const answerInput = document.getElementById('diff-answer');
    const resultDiv = document.getElementById('diff-result');
    
    if (answeredDiff) {
        resultDiv.textContent = "Вы уже ответили! Нажмите 'Новая задача'.";
        resultDiv.className = 'bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value;
    const parts = userInput.trim().split(/\s+/);
    
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        alertDiv.textContent = 'Пожалуйста, введите два числа через пробел';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredDiff = true;
    totalTasks++;
    
    const userAnswer1 = parseFloat(parts[0]);
    const userAnswer2 = parseFloat(parts[1]);
    const isCorrect = Math.abs(userAnswer1 - currentDiffTask.firstPayment) < 0.01 && 
                     Math.abs(userAnswer2 - currentDiffTask.lastPayment) < 0.01;
    
    if (isCorrect) {
        resultDiv.textContent = `✅ Правильно! Ответ: ${currentDiffTask.firstPayment.toLocaleString('ru-RU')} руб. и ${currentDiffTask.lastPayment.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-green-900/20 text-green-400 neon-border';
        score++;
    } else {
        resultDiv.textContent = `❌ Неправильно. Правильный ответ: ${currentDiffTask.firstPayment.toLocaleString('ru-RU')} руб. и ${currentDiffTask.lastPayment.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-red-900/20 text-red-400 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;
    
    const scoreSpan = document.getElementById('diff-score');
    scoreSpan.textContent = parseInt(scoreSpan.textContent) + (isCorrect ? 1 : 0);
    const totalSpan = document.getElementById('diff-total');
    totalSpan.textContent = parseInt(totalSpan.textContent) + 1;
    
    updateProgress();
}

// Проверка ответов для инвестиций
function checkInvestAnswer() {
    const alertDiv = document.getElementById('invest-alert');
    const answerInput = document.getElementById('invest-answer');
    const resultDiv = document.getElementById('invest-result');
    
    if (answeredInvest) {
        resultDiv.textContent = "Вы уже ответили! Нажмите 'Новая задача'.";
        resultDiv.className = 'bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value;
    const userAnswer = parseFloat(userInput);
    
    if (isNaN(userAnswer)) {
        alertDiv.textContent = 'Пожалуйста, введите корректное число';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredInvest = true;
    totalTasks++;
    
    const roundedAnswer = Math.round(userAnswer * 100) / 100;
    const isCorrect = Math.abs(roundedAnswer - currentInvestTask.correct) < 0.01;
    
    if (isCorrect) {
        resultDiv.textContent = `✅ Правильно! Ответ: ${currentInvestTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-green-900/20 text-green-400 neon-border';
        score++;
    } else {
        resultDiv.textContent = `❌ Неправильно. Правильный ответ: ${currentInvestTask.correct.toLocaleString('ru-RU')} руб.`;
        resultDiv.className = 'bg-red-900/20 text-red-400 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;
    
    const scoreSpan = document.getElementById('invest-score');
    scoreSpan.textContent = parseInt(scoreSpan.textContent) + (isCorrect ? 1 : 0);
    const totalSpan = document.getElementById('invest-total');
    totalSpan.textContent = parseInt(totalSpan.textContent) + 1;
    
    updateProgress();
}

// Проверка ответов для задач ЕГЭ
function checkEgeAnswer() {
    const alertDiv = document.getElementById('ege-alert');
    const answerInput = document.getElementById('ege-answer');
    const resultDiv = document.getElementById('ege-result');
    
    if (answeredEge) {
        resultDiv.innerHTML = `
            <div class="flex items-start">
                <div class="mr-2">⚠️</div>
                <div>Вы уже ответили! Нажмите 'Новая задача'.</div>
            </div>
        `;
        resultDiv.className = 'result-container bg-yellow-900/20 text-yellow-400 neon-border';
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const userInput = answerInput.value.trim();
    
    if (userInput === '') {
        alertDiv.textContent = 'Пожалуйста, введите ответ';
        alertDiv.classList.remove('hidden');
        return;
    }
    
    answeredEge = true;
    totalTasks++;
    egeTasksCompleted++;
    
    const isCorrect = userInput === currentEgeTask.correct;
    const pointsEarned = currentLevel === 'basic' ? 1 : 2;
    
    if (isCorrect) {
        egeTotalScore += pointsEarned;
        resultDiv.innerHTML = `
            <div class="flex items-start text-sm">
                <div class="mr-2 mt-1">✅</div>
                <div>
                    <p class="font-bold text-green-400">Правильно! +${pointsEarned} балл${pointsEarned > 1 ? 'а' : ''}</p>
                    <p class="mt-1">Ответ: <span class="font-mono">${currentEgeTask.correct}</span></p>
                    <details class="mt-1 text-gray-300">
                        <summary class="cursor-pointer hover:text-white">Показать решение</summary>
                        <div class="mt-1 bg-gray-900/50 p-2 rounded">${currentEgeTask.solution}</div>
                    </details>
                </div>
            </div>
        `;
        resultDiv.className = 'result-container bg-green-900/10 neon-border';
    } else {
        resultDiv.innerHTML = `
            <div class="flex items-start text-sm">
                <div class="mr-2 mt-1">❌</div>
                <div>
                    <p class="font-bold text-red-400">Неправильно</p>
                    <p class="mt-1">Правильный ответ: <span class="font-mono">${currentEgeTask.correct}</span></p>
                    <details class="mt-1 text-gray-300" open>
                        <summary class="cursor-pointer hover:text-white">Решение</summary>
                        <div class="mt-1 bg-gray-900/50 p-2 rounded">${currentEgeTask.solution}</div>
                    </details>
                </div>
            </div>
        `;
        resultDiv.className = 'result-container bg-red-900/10 neon-border';
    }
    
    resultDiv.classList.remove('hidden');
    answerInput.disabled = true;

    // Обновление счетчиков
    document.getElementById('ege-score').textContent = egeTotalScore;
    document.getElementById('ege-tasks').textContent = `${egeTasksCompleted}/10`;
    
    // Проверка завершения 10 задач
    if (egeTasksCompleted >= 10) {
        const maxPossible = currentLevel === 'basic' ? 10 : 20;
        resultDiv.innerHTML += `<br><br><strong>Тест завершен!</strong> Вы набрали ${egeTotalScore} баллов из ${maxPossible} возможных.`;
        document.getElementById('ege-answer').disabled = true;
        document.getElementById('ege-new-task-btn').disabled = true;
    }
    
    updateProgress();
}

// Генерация задач для вкладов
function generateDepositTask() {
    let principal, rate, years, isCompound;
    
    if (currentLevel === 'basic') {
        principal = Math.floor(Math.random() * 90000) + 10000;
        rate = Math.floor(Math.random() * 11) + 5;
        years = Math.floor(Math.random() * 5) + 1;
        isCompound = Math.random() > 0.5;
    } else {
        // Более сложные задачи для повышенного уровня
        principal = Math.floor(Math.random() * 900000) + 100000;
        rate = Math.floor(Math.random() * 15) + 5;
        years = Math.floor(Math.random() * 10) + 1;
        isCompound = true; // В повышенном уровне всегда сложные проценты
        
        // 30% вероятности добавить ежемесячную капитализацию
        if (Math.random() < 0.3) {
            const monthlyRate = rate / 12;
            const months = years * 12;
            
            currentDepositTask = {
                correct: principal * Math.pow(1 + monthlyRate / 100, months),
                question: `Вклад ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с ежемесячной капитализацией. Сколько получит клиент?`
            };
            
            document.getElementById('deposit-question').textContent = currentDepositTask.question;
            document.getElementById('deposit-answer').value = '';
            document.getElementById('deposit-result').classList.add('hidden');
            document.getElementById('deposit-answer').disabled = false;
            document.getElementById('deposit-alert').classList.add('hidden');
            answeredDeposit = false;
            return;
        }
    }
    
    if (isCompound) {
        currentDepositTask = {
            correct: principal * Math.pow(1 + rate / 100, years),
            question: `Вклад ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с капитализацией. Сколько получит клиент?`
        };
    } else {
        currentDepositTask = {
            correct: principal * (1 + rate / 100 * years),
            question: `Вклад ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} без капитализации. Сколько получит клиент?`
        };
    }
    
    document.getElementById('deposit-question').textContent = currentDepositTask.question;
    document.getElementById('deposit-answer').value = '';
    document.getElementById('deposit-result').classList.add('hidden');
    document.getElementById('deposit-answer').disabled = false;
    document.getElementById('deposit-alert').classList.add('hidden');
    answeredDeposit = false;
}

// Генерация задач для аннуитетных кредитов
function generateAnnuityTask() {
    let principal, rate, years;
    
    if (currentLevel === 'basic') {
        principal = Math.floor(Math.random() * 900000) + 100000;
        rate = Math.floor(Math.random() * 11) + 10;
        years = Math.floor(Math.random() * 5) + 1;
    } else {
        // Более сложные задачи для повышенного уровня
        principal = Math.floor(Math.random() * 5000000) + 1000000;
        rate = Math.floor(Math.random() * 15) + 10;
        years = Math.floor(Math.random() * 10) + 1;
        
        // 30% вероятности добавить комиссию
        if (Math.random() < 0.3) {
            const commission = Math.floor(Math.random() * 5) + 1;
            const months = years * 12;
            const monthlyRate = rate / 100 / 12;
            const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                           (Math.pow(1 + monthlyRate, months) - 1);
            
            currentAnnuityTask = {
                correct: payment + (principal * commission / 100 / 12),
                question: `Кредит ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с аннуитетными платежами. Банк берёт ${commission}% от суммы кредита в качестве ежемесячной комиссии. Какой будет ежемесячный платёж?`
            };
            
            document.getElementById('annuity-question').textContent = currentAnnuityTask.question;
            document.getElementById('annuity-answer').value = '';
            document.getElementById('annuity-result').classList.add('hidden');
            document.getElementById('annuity-answer').disabled = false;
            document.getElementById('annuity-alert').classList.add('hidden');
            answeredAnnuity = false;
            return;
        }
    }
    
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    
    currentAnnuityTask = {
        correct: principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1),
        question: `Кредит ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с аннуитетными платежами. Какой будет ежемесячный платёж?`
    };
    
    document.getElementById('annuity-question').textContent = currentAnnuityTask.question;
    document.getElementById('annuity-answer').value = '';
    document.getElementById('annuity-result').classList.add('hidden');
    document.getElementById('annuity-answer').disabled = false;
    document.getElementById('annuity-alert').classList.add('hidden');
    answeredAnnuity = false;
}

// Генерация задач для дифференцированных кредитов
function generateDiffTask() {
    let principal, rate, years;
    
    if (currentLevel === 'basic') {
        principal = Math.floor(Math.random() * 900000) + 100000;
        rate = Math.floor(Math.random() * 11) + 10;
        years = Math.floor(Math.random() * 5) + 1;
    } else {
        // Более сложные задачи для повышенного уровня
        principal = Math.floor(Math.random() * 5000000) + 1000000;
        rate = Math.floor(Math.random() * 15) + 10;
        years = Math.floor(Math.random() * 10) + 1;
        
        // 30% вероятности добавить комиссию
        if (Math.random() < 0.3) {
            const commission = Math.floor(Math.random() * 5) + 1;
            const months = years * 12;
            const monthlyPrincipal = principal / months;
            const firstPayment = monthlyPrincipal + principal * (rate / 100 / 12) + (principal * commission / 100);
            const lastPayment = monthlyPrincipal + monthlyPrincipal * (rate / 100 / 12) + (monthlyPrincipal * commission / 100);
            
            currentDiffTask = {
                firstPayment: firstPayment,
                lastPayment: lastPayment,
                question: `Кредит ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с дифференцированными платежами. Банк берёт ${commission}% от остатка долга в качестве ежемесячной комиссии. Какой будет первый и последний платежи? (введите через пробел)`
            };
            
            document.getElementById('diff-question').textContent = currentDiffTask.question;
            document.getElementById('diff-answer').value = '';
            document.getElementById('diff-result').classList.add('hidden');
            document.getElementById('diff-answer').disabled = false;
            document.getElementById('diff-alert').classList.add('hidden');
            answeredDiff = false;
            return;
        }
    }
    
    const months = years * 12;
    const monthlyPrincipal = principal / months;
    
    currentDiffTask = {
        firstPayment: monthlyPrincipal + principal * (rate / 100 / 12),
        lastPayment: monthlyPrincipal + monthlyPrincipal * (rate / 100 / 12),
        question: `Кредит ${formatNumber(principal)} руб. под ${rate}% годовых на ${years} ${getYearWord(years)} с дифференцированными платежами. Какой будет первый и последний платежи? (введите через пробел)`
    };
    
    document.getElementById('diff-question').textContent = currentDiffTask.question;
    document.getElementById('diff-answer').value = '';
    document.getElementById('diff-result').classList.add('hidden');
    document.getElementById('diff-answer').disabled = false;
    document.getElementById('diff-alert').classList.add('hidden');
    answeredDiff = false;
}

// Генерация задач для инвестиций
function generateInvestTask() {
    let target, rate, years;
    
    if (currentLevel === 'basic') {
        target = Math.floor(Math.random() * 9000000) + 1000000;
        rate = Math.floor(Math.random() * 8) + 5;
        years = Math.floor(Math.random() * 15) + 5;
        
        currentInvestTask = {
            correct: target / Math.pow(1 + rate / 100, years),
            question: `Какую сумму вам нужно инвестировать сегодня под ${rate}% годовых, чтобы через ${years} ${getYearWord(years)} получить ${formatNumber(target)} руб.?`
        };
    } else {
        // Более сложные задачи для повышенного уровня
        target = Math.floor(Math.random() * 90000000) + 10000000;
        rate = Math.floor(Math.random() * 15) + 5;
        years = Math.floor(Math.random() * 30) + 10;
        
        // 30% вероятности добавить ежемесячное пополнение
        if (Math.random() < 0.3) {
            const monthlyPayment = Math.floor(Math.random() * 50000) + 10000;
            const monthlyRate = rate / 12 / 100;
            const months = years * 12;
            const futureValue = monthlyPayment * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
            
            currentInvestTask = {
                correct: futureValue,
                question: `Вы планируете ежемесячно вносить ${formatNumber(monthlyPayment)} руб. на инвестиционный счёт под ${rate}% годовых с ежемесячной капитализацией. Какую сумму вы накопите через ${years} ${getYearWord(years)}?`
            };
            
            document.getElementById('invest-question').textContent = currentInvestTask.question;
            document.getElementById('invest-answer').value = '';
            document.getElementById('invest-result').classList.add('hidden');
            document.getElementById('invest-answer').disabled = false;
            document.getElementById('invest-alert').classList.add('hidden');
            answeredInvest = false;
            return;
        }
        
        currentInvestTask = {
            correct: target / Math.pow(1 + rate / 100, years),
            question: `Какую сумму вам нужно инвестировать сегодня под ${rate}% годовых, чтобы через ${years} ${getYearWord(years)} получить ${formatNumber(target)} руб.?`
        };
    }
    
    document.getElementById('invest-question').textContent = currentInvestTask.question;
    document.getElementById('invest-answer').value = '';
    document.getElementById('invest-result').classList.add('hidden');
    document.getElementById('invest-answer').disabled = false;
    document.getElementById('invest-alert').classList.add('hidden');
    answeredInvest = false;
}

// Генерация задач ЕГЭ
function generateEgeTask() {
    // Проверка завершения 10 задач
    if (egeTasksCompleted >= 10) {
        document.getElementById('ege-question').textContent = "Вы уже решили 10 задач. Максимальное количество задач достигнуто.";
        document.getElementById('ege-answer').disabled = true;
        document.getElementById('ege-new-task-btn').disabled = true;
        return;
    }
    
    // Генерация задач для ЕГЭ в зависимости от уровня сложности
    if (currentLevel === 'basic') {
        generateBasicEgeTask();
    } else {
        generateAdvancedEgeTask();
    }
}

// Генерация базовых задач ЕГЭ (№15)
function generateBasicEgeTask() {
    const taskTypes = ['deposit', 'credit', 'discount'];
    const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    
    let question, correct, solution;
    const amount = Math.round((10000 + Math.random() * 90000) / 1000) * 1000; // Сумма от 10к до 100к, кратная 1000
    const years = 1 + Math.floor(Math.random() * 5); // От 1 до 5 лет
    const rate = 5 + Math.floor(Math.random() * 16); // Ставка от 5% до 20%
    
    switch(type) {
        case 'deposit':
            // Вклад с капитализацией
            const capitalization = ['ежегодно', 'ежеквартально', 'ежемесячно'][Math.floor(Math.random() * 3)];
            let periodsPerYear, totalPeriods;
            
            if (capitalization === 'ежегодно') {
                periodsPerYear = 1;
                totalPeriods = years;
            } else if (capitalization === 'ежеквартально') {
                periodsPerYear = 4;
                totalPeriods = years * 4;
            } else {
                periodsPerYear = 12;
                totalPeriods = years * 12;
            }
            
            const periodRate = rate / periodsPerYear / 100;
            const finalAmount = Math.round(amount * Math.pow(1 + periodRate, totalPeriods));
            
            question = `Вкладчик положил в банк ${amount.toLocaleString('ru-RU')} рублей под ${rate}% годовых с капитализацией ${capitalization}. Какая сумма будет на счету через ${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}?`;
            correct = finalAmount.toString();
            solution = `Используем формулу сложных процентов: S = P × (1 + r)^n = ${amount} × (1 + ${periodRate.toFixed(4)})^{${totalPeriods}} ≈ ${finalAmount} руб.`;
            break;
            
        case 'credit':
            // Аннуитетный кредит
            const months = years * 12;
            const monthlyRate = rate / 12 / 100;
            const annuityPayment = Math.round(amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1));
            
            question = `Кредит в ${amount.toLocaleString('ru-RU')} рублей выдан под ${rate}% годовых на ${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} с аннуитетными платежами. Найдите ежемесячный платеж.`;
            correct = annuityPayment.toString();
            solution = `Месячная ставка: ${rate}%/12 = ${(rate/12).toFixed(2)}%. Количество месяцев: ${months}. Платёж = (${amount}×${monthlyRate.toFixed(4)}×(1+${monthlyRate.toFixed(4)})^{${months}})/((1+${monthlyRate.toFixed(4)})^{${months}}-1) ≈ ${annuityPayment} руб.`;
            break;
            
        case 'discount':
            // Дисконтирование
            const futureAmount = Math.round((amount * (1 + 0.1 * Math.random())) / 1000) * 1000;
            const discountRate = 5 + Math.floor(Math.random() * 11); // От 5% до 15%
            const presentValue = Math.round(futureAmount / Math.pow(1 + discountRate/100, years));
            
            question = `Какую сумму нужно положить в банк под ${discountRate}% годовых с ежегодной капитализацией, чтобы через ${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'} получить ${futureAmount.toLocaleString('ru-RU')} рублей?`;
            correct = presentValue.toString();
            solution = `Используем формулу дисконтирования: P = S / (1 + r)^n = ${futureAmount} / (1 + ${discountRate/100})^{${years}} ≈ ${presentValue} руб.`;
            break;
    }
    
    currentEgeTask = {
        correct: correct,
        question: question,
        solution: solution
    };
    
    document.getElementById('ege-question').textContent = currentEgeTask.question;
    document.getElementById('ege-answer').value = '';
    document.getElementById('ege-result').classList.add('hidden');
    document.getElementById('ege-answer').disabled = false;
    document.getElementById('ege-alert').classList.add('hidden');
    answeredEge = false;
}

// Генерация сложных задач ЕГЭ (№17)
function generateAdvancedEgeTask() {
    const taskTypes = ['two-payments', 'equal-reduction', 'varying-payments', 'deposit-additions'];
    const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    
    let question, correct, solution;
    const amount = Math.round((1000000 + Math.random() * 9000000) / 100000) * 100000; // От 1 млн до 10 млн
    const years = 2 + Math.floor(Math.random() * 4); // От 2 до 5 лет
    const rate = 10 + Math.floor(Math.random() * 21); // Ставка от 10% до 30%
    
    switch(type) {
        case 'two-payments':
            // Кредит с двумя равными платежами
            const totalAmount = amount * Math.pow(1 + rate/100, 2);
            const payment = Math.round(totalAmount / (1 + (1 + rate/100)));
            
            question = `31 декабря 2024 года заемщик взял в банке ${(amount/1000000).toLocaleString('ru-RU')} млн рублей в кредит под ${rate}% годовых. Схема выплаты кредита следующая — 31 декабря каждого следующего года банк начисляет проценты на оставшуюся сумму долга, затем заемщик переводит в банк X рублей. Какой должна быть сумма X, чтобы заемщик выплатил долг двумя равными платежами?`;
            correct = payment.toString();
            solution = `После первого года долг составит: ${amount} × 1.${rate} = ${Math.round(amount * (1 + rate/100))}. После выплаты X руб. останется: ${Math.round(amount * (1 + rate/100))} - X. На второй год остаток увеличивается на ${rate}%: (${Math.round(amount * (1 + rate/100))} - X) × 1.${rate}. После второй выплаты X руб. долг должен быть погашен: (${Math.round(amount * (1 + rate/100))} - X) × 1.${rate} - X = 0. Решая уравнение, получаем X = ${payment} руб.`;
            break;
            
        case 'equal-reduction':
            // Кредит с равномерным уменьшением долга
            const months = years * 12;
            const totalPayment = Math.round(amount * (1 + 0.3 + 0.1 * Math.random())); // Общая выплата на 30-40% больше
            const r = Math.round((totalPayment/amount - 1) * 10 * 100) / 100; // Расчетная ставка
            
            question = `15 января планируется взять кредит в банке на ${months} месяцев. Условия его возврата таковы: 1-го числа каждого месяца долг возрастает на r% по сравнению с концом предыдущего месяца; со 2-го по 14-е число каждого месяца необходимо выплатить часть долга; 15-го числа каждого месяца долг должен быть на одну и ту же сумму меньше долга на 15-е число предыдущего месяца. Известно, что общая сумма выплат после полного погашения кредита на ${Math.round((totalPayment/amount - 1)*100)}% больше суммы, взятой в кредит. Найдите r.`;
            correct = r.toString();
            solution = `Пусть сумма кредита S. По условию, долг уменьшается равномерно: каждый месяц на S/${months}. Проценты: (S + (S - S/${months}) + (S - 2S/${months}) + ... + S/${months}) × r/100 = S × (1 + ${months-1}/${months} + ${months-2}/${months} + ... + 1/${months}) × r/100 = S × (${months+1}/2) × r/100 = ${(months+1)/200}S × r. Итого выплаты: S + ${(months+1)/200}S × r = ${totalPayment/amount}S ⇒ ${(months+1)/200} × r = ${totalPayment/amount - 1} ⇒ r = ${r}.`;
            break;
            
        case 'varying-payments':
            // Кредит с разными платежами по годам
            const annualPayment = Math.round(amount / years);
            const totalInterest = annualPayment * rate/100 * (years + 1) / 2;
            const totalPaymentVar = amount + totalInterest;
            
            question = `В июле планируется взять кредит на сумму ${(amount/1000000).toLocaleString('ru-RU')} млн рублей на ${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}. Условия возврата: каждый январь долг возрастает на ${rate}% по сравнению с концом предыдущего года; с февраля по июнь каждого года необходимо выплатить часть долга; в июле каждого года долг должен быть на одну и ту же сумму меньше долга на июль предыдущего года. Сколько рублей составит общая сумма выплат?`;
            correct = Math.round(totalPaymentVar).toString();
            solution = `Ежегодное уменьшение долга: ${amount} / ${years} = ${annualPayment} руб. Проценты: (${amount} + ${amount - annualPayment} + ${amount - 2*annualPayment} + ... + ${annualPayment}) × ${rate/100} = ${amount} × ${(years + 1)/2} × ${rate/100} = ${totalInterest} руб. Общая сумма выплат: ${amount} + ${totalInterest} = ${Math.round(totalPaymentVar)} руб.`;
            break;
            
        case 'deposit-additions':
            // Вклад с ежегодными пополнениями
            const additions = Math.round((100000 + Math.random() * 400000) / 10000) * 10000; // Пополнения от 100к до 500к
            const finalAmount = Math.round(amount * Math.pow(1 + rate/100, 5) + additions * (Math.pow(1 + rate/100, 4) + Math.pow(1 + rate/100, 3) + Math.pow(1 + rate/100, 2) + (1 + rate/100)));
            
            question = `В банк помещена сумма ${(amount/1000000).toLocaleString('ru-RU')} млн рублей под ${rate}% годовых. В конце каждого из первых четырех лет хранения после начисления процентов вкладчик дополнительно вносил на счет ${additions.toLocaleString('ru-RU')} рублей. Какая сумма будет на счету к концу пятого года?`;
            correct = finalAmount.toString();
            solution = `Через 5 лет основная сумма составит: ${amount} × 1.${rate}^5 ≈ ${Math.round(amount * Math.pow(1 + rate/100, 5))} руб. Добавки с процентами: ${additions} × (1.${rate}^4 + 1.${rate}^3 + 1.${rate}^2 + 1.${rate}) ≈ ${Math.round(additions * (Math.pow(1 + rate/100, 4) + Math.pow(1 + rate/100, 3) + Math.pow(1 + rate/100, 2) + (1 + rate/100)))} руб. Итого: ${Math.round(amount * Math.pow(1 + rate/100, 5))} + ${Math.round(additions * (Math.pow(1 + rate/100, 4) + Math.pow(1 + rate/100, 3) + Math.pow(1 + rate/100, 2) + (1 + rate/100)))} ≈ ${finalAmount} руб.`;
            break;
    }
    
    currentEgeTask = {
        correct: correct,
        question: question,
        solution: solution
    };
    
    document.getElementById('ege-question').textContent = currentEgeTask.question;
    document.getElementById('ege-answer').value = '';
    document.getElementById('ege-result').classList.add('hidden');
    document.getElementById('ege-answer').disabled = false;
    document.getElementById('ege-alert').classList.add('hidden');
    answeredEge = false;
}

// Вспомогательные функции
function formatNumber(num) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(num));
}

function getYearWord(years) {
    const lastDigit = years % 10;
    const lastTwoDigits = years % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'лет';
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
}

// Управление меню
function toggleMenu() {
    const sidebar = document.getElementById('sidebar-menu');
    const overlay = document.getElementById('menu-overlay');
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
}

function closeMenu() {
    document.getElementById('sidebar-menu').classList.remove('open');
    document.getElementById('menu-overlay').style.display = 'none';
}

// Закрытие меню при клике вне или нажатии ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMenu();
    }
});

document.getElementById('close-menu').addEventListener('click', () => {
    closeMenu();
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMenu();
    }
});
// Функции для авторизации
function openAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

// Обработчик формы входа
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  // Здесь можно добавить логику входа
  alert('Функция входа будет реализована позже');
  closeAuthModal();
});

// Добавьте вызов openAuthModal() для кнопки входа в меню
document.querySelector('aside li:nth-child(4) a').addEventListener('click', function(e) {
  e.preventDefault();
  toggleMenu();
  openAuthModal();
});
