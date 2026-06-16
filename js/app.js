// app.js - 个人博客交互逻辑（含分类导航 + 最近文章）
document.addEventListener('DOMContentLoaded', () => {
    // ---------- 主题切换 ----------
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    const articlesContainer = document.getElementById('articles-container');
    const contentArea = document.getElementById('content');
    const categoryList = document.getElementById('category-list');
    const recentPosts = document.getElementById('recent-posts');

    if (!articlesContainer) return;

    let allFiles = [];                // 存储全部文章数据
    let currentCategory = 'all';     // 当前选中的分类

    // 防 XSS 工具函数
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        })[m]);
    }

    // 根据 currentCategory 渲染右侧文章列表
    function renderArticles() {
        let filtered = allFiles;
        if (currentCategory !== 'all') {
            filtered = allFiles.filter(f => f.category === currentCategory);
        }

        const html = filtered.map(file => {
            const cover = file.cover || 'images/default-cover.jpg';
            const title = file.title || file.name.replace('.md', '');
            return `
                <article class="article-card" data-file="${file.name}">
                    <img class="card-cover" src="${cover}" alt="${escapeHtml(title)}" loading="lazy">
                    <div>
                        <h3 class="card-title">${escapeHtml(title)}</h3>
                    </div>
                </article>
            `;
        }).join('');

        articlesContainer.innerHTML = html || '<p>ERROR！该分类下暂无文章</p>';
    }

    // 加载并展示文章详情
    async function loadArticle(fileName) {
        contentArea.innerHTML = `<div class="glass-card" style="margin-top:0;"><p>WAITING！文章加载中...</p></div>`;
        contentArea.style.display = 'block';
        articlesContainer.style.display = 'none';

        try {
            const response = await fetch(`./text/${fileName}`);
            if (!response.ok) throw new Error('文章不存在');
            const mdText = await response.text();
            const parsedHtml = await marked.parse(mdText);

            const cardDiv = document.createElement('div');
            cardDiv.className = 'glass-card';
            cardDiv.style.marginTop = '0';

            const backBtn = document.createElement('div');
            backBtn.className = 'back-button';
            backBtn.textContent = '← 返回文章列表';
            backBtn.addEventListener('click', showArticleList);

            const markdownDiv = document.createElement('div');
            markdownDiv.className = 'markdown-body';
            markdownDiv.innerHTML = parsedHtml;

            cardDiv.appendChild(backBtn);
            cardDiv.appendChild(markdownDiv);

            contentArea.innerHTML = '';
            contentArea.appendChild(cardDiv);
        } catch (err) {
            console.error(err);
            const errorCard = document.createElement('div');
            errorCard.className = 'glass-card';
            errorCard.style.marginTop = '0';
            const backBtn = document.createElement('div');
            backBtn.className = 'back-button';
            backBtn.textContent = '← 返回文章列表';
            backBtn.addEventListener('click', showArticleList);
            const errorMsg = document.createElement('p');
            errorMsg.style.color = 'red';
            errorMsg.textContent = 'ERROR！文章加载失败，请稍后重试。';
            errorCard.appendChild(backBtn);
            errorCard.appendChild(errorMsg);
            contentArea.innerHTML = '';
            contentArea.appendChild(errorCard);
        }
    }

    // 返回文章列表（并保持当前分类筛选状态）
    function showArticleList() {
        articlesContainer.style.display = '';
        contentArea.style.display = 'none';
        contentArea.innerHTML = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        renderArticles();   // 重新渲染，保留分类
    }

    // 初始化分类按钮和最近文章列表
    function initNavigation() {
        // 提取所有不重复的分类
        const categories = [...new Set(allFiles.map(f => f.category).filter(Boolean))];

        // 生成“全部”按钮
        const allBtn = document.createElement('button');
        allBtn.className = 'category-btn active';
        allBtn.textContent = '全部';
        allBtn.addEventListener('click', () => {
            currentCategory = 'all';
            renderArticles();
            updateCategoryActive();
        });
        categoryList.appendChild(allBtn);

        // 生成各个分类按钮
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = cat;
            btn.addEventListener('click', () => {
                currentCategory = cat;
                renderArticles();
                updateCategoryActive();
            });
            categoryList.appendChild(btn);
        });

        // 更新按钮激活样式
        function updateCategoryActive() {
            const buttons = categoryList.querySelectorAll('.category-btn');
            buttons.forEach(btn => {
                const isActive = (currentCategory === 'all' && btn.textContent === '全部') || btn.textContent === currentCategory;
                btn.classList.toggle('active', isActive);
            });
        }

        // 最近文章：取前 3 篇
        const recent = allFiles.slice(0, 3);
        recentPosts.innerHTML = '';
        if (recent.length === 0) {
            recentPosts.innerHTML = '<li class="recent-post-item" style="color:var(--text-secondary);">暂无文章</li>';
            return;
        }

        recent.forEach(file => {
            const li = document.createElement('li');
            li.className = 'recent-post-item';
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'recent-post-link';
            a.textContent = file.title || file.name.replace('.md', '');
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadArticle(file.name);
            });
            li.appendChild(a);
            recentPosts.appendChild(li);
        });
    }

    // ---------- 加载文章数据 ----------
    fetch('./list.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(files => {
            allFiles = files;
            renderArticles();       // 初始渲染全部文章
            initNavigation();      // 初始化分类和最近文章
        })
        .catch(err => {
            console.error('加载 list.json 失败:', err);
            articlesContainer.innerHTML = '<p>ERROR！无法加载文章列表，请检查 list.json 文件是否存在且格式正确。</p>';
        });

    // 文章卡片点击委托（右侧列表）
    articlesContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.article-card');
        if (!card) return;
        const fileName = card.dataset.file;
        if (fileName) {
            loadArticle(fileName);
        }
    });
});