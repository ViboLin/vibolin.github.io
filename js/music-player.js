// music-player.js - 微缩版音乐播放器（优化版）
(function() {
    // 配置项
    const songs = [
        {
            name: 'Sea of Tranquility',
            singer: 'Nigel Stanford',
            src: 'sound/Sea of Tranquility-BeMax.mp3',
            cover: 'images/music/sound01.jpeg'
        },
        {
            name: 'Белая кошка',
            singer: 'Мельница',
            src: 'sound/Белаякошка (小白猫).mp3',
            cover: 'images/music/sound02.jpeg'
        }
    ];

    // 图标类名映射（根据实际图标库调整）
    const ICONS = {
        play: 'iconfont icon-play-circle',
        pause: 'iconfont icon-timeout'   // 如无暂停图标，可替换为其他
    };

    let currentIndex = 0;
    let isPlaying = false;
    let audio = null;
    let playIcon = null;

    // DOM 元素（延迟获取）
    let elements = {};

    function initPlayer() {
        // 获取或创建音频元素
        audio = document.getElementById('mini-audio-player');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'mini-audio-player';
            audio.style.display = 'none';
            document.body.appendChild(audio);
        }

        // 缓存 DOM 元素
        elements = {
            playBtn: document.getElementById('mini-play-btn'),
            prevBtn: document.getElementById('mini-prev-btn'),
            nextBtn: document.getElementById('mini-next-btn'),
            volumeBtn: document.getElementById('mini-volume-btn'),
            verticalVolume: document.getElementById('mini-vertical-volume'),
            progressBar: document.getElementById('mini-progress-bar'),
            progressFilled: document.getElementById('mini-progress-filled'),
            currentTime: document.getElementById('mini-current-time'),
            totalTime: document.getElementById('mini-total-time'),
            songName: document.getElementById('mini-song-name'),
            singer: document.getElementById('mini-singer'),
            coverImg: document.getElementById('mini-cover-img'),
            volumeExtension: document.getElementById('mini-volume-extension')
        };

        if (!elements.playBtn) return;
        playIcon = elements.playBtn.querySelector('.iconfont');

        // 绑定事件
        elements.playBtn.addEventListener('click', togglePlay);
        elements.prevBtn.addEventListener('click', prevSong);
        elements.nextBtn.addEventListener('click', nextSong);

        if (elements.volumeBtn && elements.volumeExtension) {
            elements.volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.volumeExtension.classList.toggle('open');
            });
        }

        if (elements.verticalVolume) {
            audio.volume = parseFloat(elements.verticalVolume.value); // 初始化为滑块当前值
            elements.verticalVolume.addEventListener('input', (e) => {
            audio.volume = parseFloat(e.target.value);
            });
        }

        if (elements.progressBar) {
            elements.progressBar.addEventListener('click', setProgress);
        }

        // 音频事件
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => {
            elements.totalTime.textContent = formatTime(audio.duration);
        });
        audio.addEventListener('ended', nextSong);
        audio.addEventListener('error', () => {
            console.warn('音频加载失败:', audio.src);
            // 可在此处显示错误提示，保持界面不变
        });

        // 初始音量
        if (elements.verticalVolume) {
            elements.verticalVolume.value = audio.volume;
        }

        loadSong(currentIndex);
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function loadSong(index) {
        const song = songs[index];
        if (!song) return;

        // 重置界面
        elements.songName.textContent = song.name;
        elements.singer.textContent = song.singer;
        elements.coverImg.src = song.cover;
        elements.progressFilled.style.width = '0%';
        elements.currentTime.textContent = '00:00';
        elements.totalTime.textContent = '00:00';

        // 切换音频源
        const wasPlaying = isPlaying;
        audio.pause();
        audio.src = song.src;
        audio.load();

        // 如果之前正在播放，则自动播放新歌
        if (wasPlaying) {
            audio.play().catch(e => console.log('自动播放被阻止:', e));
        }
    }

    function updateProgress() {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        elements.progressFilled.style.width = `${percent}%`;
        elements.currentTime.textContent = formatTime(audio.currentTime);
        elements.totalTime.textContent = formatTime(audio.duration);
    }

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            if (playIcon) playIcon.className = ICONS.play;
        } else {
            audio.play();
            if (playIcon) playIcon.className = ICONS.pause;
        }
        isPlaying = !isPlaying;
    }

    function nextSong() {
        currentIndex = (currentIndex + 1) % songs.length;
        loadSong(currentIndex);
    }

    function prevSong() {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        loadSong(currentIndex);
    }

    function setProgress(e) {
        const rect = elements.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));
        audio.currentTime = percent * audio.duration;
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayer);
    } else {
        initPlayer();
    }
})();