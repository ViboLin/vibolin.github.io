// app.js - 个人博客交互逻辑（无自动滚动）
document.addEventListener('DOMContentLoaded', () => {
    // 主题切换
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

    if (!articlesContainer) return;

    // 加载文章列表
    fetch('./list.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(files => {
            const html = files.map(file => {
                const cover = file.cover || 'images/default-cover.jpg';
                const title = file.title || file.name.replace('.md', '');
                return `
                    <article class="article-card" data-file="${file.name}">
                        <img class="card-cover" src="${cover}" alt="${title}" loading="lazy">
                        <div>
                            <h3 class="card-title">${escapeHtml(title)}</h3>
                        </div>
                    </article>
                `;
            }).join('');
            articlesContainer.innerHTML = html;

            // 绑定文章点击事件
            articlesContainer.addEventListener('click', async (e) => {
                const card = e.target.closest('.article-card');
                if (!card) return;
                const fileName = card.dataset.file;
                if (!fileName) return;

                // 显示加载中（使用毛玻璃卡片）
                contentArea.innerHTML = `
                    <div class="glass-card" style="margin-top:0;">
                        <p>⏳ 文章加载中...</p>
                    </div>
                `;
                contentArea.style.display = 'block';
                articlesContainer.style.display = 'none';

                // ❌ 已移除自动滚动代码

                try {
                    const response = await fetch(`./text/${fileName}`);
                    if (!response.ok) throw new Error('文章不存在');
                    const mdText = await response.text();
                    const parsedHtml = await marked.parse(mdText);

                    // 构建完整文章卡片
                    contentArea.innerHTML = `
                        <div class="glass-card" style="margin-top:0;">
                            <div class="back-button" id="backToListBtn">← 返回文章列表</div>
                            <div class="markdown-body">${parsedHtml}</div>
                        </div>
                    `;

                    // 绑定返回按钮事件
                    const backBtn = document.getElementById('backToListBtn');
                    if (backBtn) {
                        backBtn.addEventListener('click', () => {
                            articlesContainer.style.display = '';
                            contentArea.style.display = 'none';
                            contentArea.innerHTML = '';
                            window.scrollTo({ top: 0, behavior: 'smooth' }); // 返回列表时滚动到顶部（保留）
                        });
                    }

                    // ❌ 已移除自动滚动代码
                } catch (err) {
                    console.error(err);
                    contentArea.innerHTML = `
                        <div class="glass-card" style="margin-top:0;">
                            <div class="back-button" id="backToListBtn">← 返回文章列表</div>
                            <p style="color: red;">❌ 文章加载失败，请稍后重试。</p>
                        </div>
                    `;
                    const backBtn = document.getElementById('backToListBtn');
                    if (backBtn) {
                        backBtn.addEventListener('click', () => {
                            articlesContainer.style.display = '';
                            contentArea.style.display = 'none';
                            contentArea.innerHTML = '';
                        });
                    }
                    // ❌ 已移除自动滚动代码
                }
            });
        })
        .catch(err => {
            console.error('加载 list.json 失败:', err);
            articlesContainer.innerHTML = '<p>⚠️ 无法加载文章列表，请检查 list.json 文件是否存在且格式正确。</p>';
        });

    // 简单防 XSS
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
});