// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题
    initTheme();

    // 初始化事件监听器
    initEventListeners();

    // 检查用户登录状态
    checkUserLoginStatus();
});

// 初始化主题
function initTheme() {
    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// 初始化事件监听器
function initEventListeners() {
    // 主题切换
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // 用户菜单
    document.getElementById('user-btn').addEventListener('click', toggleUserMenu);

    // 模态框
    document.getElementById('login-link').addEventListener('click', showLoginModal);
    document.getElementById('register-link').addEventListener('click', showRegisterModal);
    document.getElementById('close-login-modal').addEventListener('click', hideLoginModal);
    document.getElementById('close-register-modal').addEventListener('click', hideRegisterModal);
    document.getElementById('show-register-modal').addEventListener('click', showRegisterModal);
    document.getElementById('show-login-modal').addEventListener('click', showLoginModal);

    // 登录和注册表单
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // 语音输入
    document.getElementById('voice-input-btn').addEventListener('click', showVoiceInputModal);
    document.getElementById('close-voice-modal').addEventListener('click', hideVoiceInputModal);
    document.getElementById('start-voice-btn').addEventListener('click', startVoiceRecognition);
    document.getElementById('stop-voice-btn').addEventListener('click', stopVoiceRecognition);

    // 手写输入
    document.getElementById('handwriting-input-btn').addEventListener('click', showHandwritingModal);
    document.getElementById('close-handwriting-modal').addEventListener('click', hideHandwritingModal);
    document.getElementById('clear-handwriting-btn').addEventListener('click', clearHandwritingCanvas);
    document.getElementById('recognize-handwriting-btn').addEventListener('click', recognizeHandwriting);

    // 对话管理
    document.getElementById('new-conversation-btn').addEventListener('click', createNewConversation);
    document.getElementById('create-first-conversation').addEventListener('click', createNewConversation);

    // 生成媒体
    document.getElementById('generate-media-btn').addEventListener('click', generateMedia);

    // 上传到GitHub
    document.getElementById('upload-to-github-btn').addEventListener('click', uploadToGitHub);

    // 事务监控面板
    document.getElementById('close-transaction-monitor').addEventListener('click', hideTransactionMonitor);

    // 语言切换
    document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
}

// 主题切换
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// 用户菜单切换
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('hidden');
}

// 显示登录模态框
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    const modalContent = document.getElementById('login-modal-content');

    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.add('modal-appear');
    }, 10);

    // 隐藏其他模态框
    hideRegisterModal();
    hideVoiceInputModal();
    hideHandwritingModal();
}

// 隐藏登录模态框
function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    const modalContent = document.getElementById('login-modal-content');

    modalContent.classList.remove('modal-appear');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// 显示注册模态框
function showRegisterModal() {
    const modal = document.getElementById('register-modal');
    const modalContent = document.getElementById('register-modal-content');

    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.add('modal-appear');
    }, 10);

    // 隐藏其他模态框
    hideLoginModal();
    hideVoiceInputModal();
    hideHandwritingModal();
}

// 隐藏注册模态框
function hideRegisterModal() {
    const modal = document.getElementById('register-modal');
    const modalContent = document.getElementById('register-modal-content');

    modalContent.classList.remove('modal-appear');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // 模拟登录请求
    simulateLogin(username, password);
}

// 处理注册
function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // 简单验证
    if (password !== confirmPassword) {
        alert('两次输入的密码不匹配');
        return;
    }

    // 模拟注册请求
    simulateRegister(username, email, password);
}

// 模拟登录请求
function simulateLogin(username, password) {
    // 显示加载状态
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>登录中...';

    // 模拟API请求延迟
    setTimeout(() => {
        // 重置按钮
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // 模拟成功
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);

        // 更新UI
        updateUserUI(true, username);

        // 隐藏模态框
        hideLoginModal();

        // 显示成功消息
        showNotification('登录成功', 'success');
    }, 1500);
}

// 模拟注册请求
function simulateRegister(username, email, password) {
    // 显示加载状态
    const submitBtn = document.querySelector('#register-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>注册中...';

    // 模拟API请求延迟
    setTimeout(() => {
        // 重置按钮
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // 模拟成功
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);

        // 更新UI
        updateUserUI(true, username);

        // 隐藏模态框
        hideRegisterModal();

        // 显示成功消息
        showNotification('注册成功', 'success');
    }, 1500);
}

// 检查用户登录状态
function checkUserLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');

    updateUserUI(isLoggedIn, username);
}

// 更新用户UI
function updateUserUI(isLoggedIn, username) {
    const userAvatar = document.getElementById('user-avatar');
    const usernameDisplay = document.getElementById('username-display');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');

    if (isLoggedIn && username) {
        // 已登录
        userAvatar.innerHTML = username.charAt(0).toUpperCase();
        usernameDisplay.textContent = username;
        loginLink.classList.add('hidden');
        registerLink.classList.add('hidden');
        logoutLink.classList.remove('hidden');

        // 添加登出事件
        logoutLink.onclick = function(e) {
            e.preventDefault();
            logout();
        };
    } else {
        // 未登录
        userAvatar.innerHTML = '<i class="fa fa-user"></i>';
        usernameDisplay.textContent = '游客';
        loginLink.classList.remove('hidden');
        registerLink.classList.remove('hidden');
        logoutLink.classList.add('hidden');
    }
}

// 登出
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    updateUserUI(false);
    showNotification('已登出', 'info');
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full opacity-0 flex items-center space-x-3 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;

    // 设置图标
    const icon = type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle';

    notification.innerHTML = `
        <i class="fa ${icon}"></i>
        <span>${message}</span>
    `;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
    }, 10);

    // 自动关闭
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 其他功能实现（语音输入、手写输入等）
// ...（其他功能代码，因篇幅限制，此处省略）