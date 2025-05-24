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

// ==================== ФИНАНСОВЫЙ ТРЕНАЖЁР ====================

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
    
    const userInput = answerInput.value.trim();
    const parts = userInput.split(/\s+/);
    
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    createBubbles();
    generateDepositTask();
    setEgeLevel('basic');
    initAuthUI();
    
    // Обработчик клика по кнопке входа в хедере
    document.getElementById('auth-btn').addEventListener('click', () => openAuthModal());
    
    // Обработчик клика по кнопке профиля
    document.getElementById('profile-btn').addEventListener('click', showProfile);
    
    // Закрытие модального окна при клике вне его
    document.getElementById('auth-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAuthModal();
        }
    });
    
    // Закрытие меню при клике на пункт меню
    document.querySelector('#sidebar-menu ul').addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            closeMenu();
        }
    });
    
    // Закрытие меню при нажатии ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
            closeAuthModal();
        }
    });
});

// ==================== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ====================

// Открытие модального окна при клике на "Авторизация" в меню
document.querySelector('aside li:nth-child(4) a').addEventListener('click', function(e) {
    e.preventDefault();
    closeMenu();
    openAuthModal();
});

// Закрытие по ESC
document.addEventListener('keydown', function(e) {
    if(e.key === 'Escape' && !document.getElementById('auth-modal').classList.contains('hidden')) {
        closeAuthModal();
    }
});

// Обработчик формы входа
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Здесь можно добавить логику входа
    alert('Функция входа будет реализована позже');
    closeAuthModal();
});
