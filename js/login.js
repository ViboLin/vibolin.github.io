// login.js - 登录/注册逻辑（继承博客主题，明文存储模拟）
(function () {
    // ---------- 配置 ----------
    const ACCOUNTS_JSON_URL = './account.json';
    const HOME_PAGE_URL = './index.html';

    let accounts = [];
    let authCard;

    // ---------- 主题切换 ----------
    function initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const html = document.documentElement;
                const current = html.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                html.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
            });
        }
    }

    // ---------- 账户数据管理 ----------
    async function loadAccounts() {
        try {
            const res = await fetch(ACCOUNTS_JSON_URL);
            if (!res.ok) throw new Error('账户文件加载失败');
            accounts = await res.json();
        } catch (e) {
            console.warn('account.json 加载失败，使用空账户列表', e);
            accounts = [];
        }

        // 合并本地注册的账户
        const localRegistered = JSON.parse(localStorage.getItem('registeredAccounts') || '[]');
        localRegistered.forEach(localUser => {
            if (!accounts.find(a => a.email === localUser.email)) {
                accounts.push(localUser);
            }
        });
    }

    function saveRegisteredAccount(user) {
        const local = JSON.parse(localStorage.getItem('registeredAccounts') || '[]');
        local.push(user);
        localStorage.setItem('registeredAccounts', JSON.stringify(local));
        accounts.push(user);
    }

    // ---------- 消息提示 ----------
    function showMessage(text, isError = true) {
        const area = document.getElementById('msgArea');
        if (!area) return;
        const cls = isError ? 'msg-error' : 'msg-success';
        area.innerHTML = `<span class="${cls}">${text}</span>`;
        setTimeout(() => { if (area.firstChild) area.innerHTML = ''; }, 4000);
    }

    // ---------- 登录处理 ----------
    function handleLogin() {
        const email = document.getElementById('loginEmail')?.value.trim();
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
            showMessage('邮箱和密码不能为空');
            return;
        }

        const user = accounts.find(a => a.email === email && a.password === password);
        if (!user) {
            showMessage('邮箱或密码错误');
            return;
        }

        const remember = document.getElementById('rememberMe')?.checked;
        if (remember) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('loginUser', user.username || user.email);
        showMessage(`✅ 登录成功！欢迎回来，${user.username || user.email}`, false);

        setTimeout(() => {
            window.location.href = HOME_PAGE_URL;
        }, 1000);
    }

    // ---------- 注册处理 ----------
    function handleRegister() {
        const username = document.getElementById('regUsername')?.value.trim();
        const email = document.getElementById('regEmail')?.value.trim();
        const password = document.getElementById('regPassword')?.value;
        const password2 = document.getElementById('regPassword2')?.value;

        if (!username || !email || !password) {
            showMessage('请填写完整信息');
            return;
        }
        if (password !== password2) {
            showMessage('两次密码不一致');
            return;
        }
        if (accounts.some(a => a.email === email)) {
            showMessage('该邮箱已被注册');
            return;
        }

        saveRegisteredAccount({ email, username, password });
        showMessage('🎉 注册成功！即将跳转登录...', false);
        setTimeout(() => renderLoginForm(), 1500);
    }

    // ---------- 渲染登录表单 ----------
    function renderLoginForm() {
        if (!authCard) return;
        authCard.innerHTML = `
            <h1 class="card-title">登录</h1>
            <div class="message-area" id="msgArea"></div>

            <div class="input-row">
                <label for="loginEmail">邮箱：</label>
                <input type="email" id="loginEmail" placeholder="your@email.com" autocomplete="email">
            </div>
            <div class="input-row">
                <label for="loginPassword">密码：</label>
                <input type="password" id="loginPassword" placeholder="请输入密码" autocomplete="current-password">
            </div>

            <div class="form-options">
                <label class="checkbox-label">
                    <input type="checkbox" id="rememberMe"> 记住我
                </label>
                <a href="#" class="forgot-link" id="forgotLink">忘记密码?</a>
            </div>

            <button class="btn-primary" id="loginBtn">登 录</button>

            <div class="switch-prompt">
                👋 还没有账号？
                <a href="#" id="toRegisterLink">立即注册</a>
            </div>
        `;

        // 事件绑定
        document.getElementById('loginBtn').addEventListener('click', handleLogin);
        document.getElementById('toRegisterLink').addEventListener('click', (e) => {
            e.preventDefault();
            renderRegisterForm();
        });
        document.getElementById('forgotLink').addEventListener('click', (e) => {
            e.preventDefault();
            showMessage('演示模式：请联系管理员重置密码', false);
        });

        // 自动填充
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            document.getElementById('loginEmail').value = remembered;
            document.getElementById('rememberMe').checked = true;
        }

        // 回车提交
        ['loginEmail', 'loginPassword'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleLogin();
            });
        });

        // 将导出按钮嵌入卡片底部
        insertExportButton();
    }

    // ---------- 渲染注册表单 ----------
    function renderRegisterForm() {
        if (!authCard) return;
        authCard.innerHTML = `
            <h1 class="card-title">注册</h1>
            <div class="message-area" id="msgArea"></div>

            <div class="input-row">
                <label for="regUsername">用户名：</label>
                <input type="text" id="regUsername" placeholder="给自己起个名字">
            </div>
            <div class="input-row">
                <label for="regEmail">邮箱：</label>
                <input type="email" id="regEmail" placeholder="your@email.com">
            </div>
            <div class="input-row">
                <label for="regPassword">密码：</label>
                <input type="password" id="regPassword" placeholder="设置密码">
            </div>
            <div class="input-row">
                <label for="regPassword2">确认密码：</label>
                <input type="password" id="regPassword2" placeholder="再次输入密码">
            </div>

            <button class="btn-primary" id="registerBtn">注 册</button>

            <div class="switch-prompt">
                🔐 已有账号？
                <a href="#" id="toLoginLink">去登录</a>
            </div>
        `;

        document.getElementById('registerBtn').addEventListener('click', handleRegister);
        document.getElementById('toLoginLink').addEventListener('click', (e) => {
            e.preventDefault();
            renderLoginForm();
        });

        ['regUsername', 'regEmail', 'regPassword', 'regPassword2'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleRegister();
            });
        });

        // 将导出按钮嵌入卡片底部
        insertExportButton();
    }

    // ---------- 导出按钮（动态插入卡片内部） ----------
    function insertExportButton() {
        if (!authCard) return;
        // 移除可能已存在的旧按钮
        const oldBtn = authCard.querySelector('.export-btn');
        if (oldBtn) oldBtn.remove();

        // 创建导出按钮区域
        const exportHtml = `
            <div class="export-inner" style="margin-top: 1.2rem; padding-top: 1rem; border-top: 1px solid var(--glass-border); text-align: center;">
                <button id="exportBtn" class="export-btn">📥 导出注册用户 (account.json)</button>
            </div>
        `;
        authCard.insertAdjacentHTML('beforeend', exportHtml);

        // 绑定事件
        const btn = document.getElementById('exportBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                alert('已导出，请联系网站所有者添加');
            });
        }
    }

    // ---------- 初始化 ----------
    document.addEventListener('DOMContentLoaded', async () => {
        authCard = document.getElementById('authCard');
        initTheme();
        await loadAccounts();
        renderLoginForm();   // 登录表单 + 内部导出按钮
    });
})();