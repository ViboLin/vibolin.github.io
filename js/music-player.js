// 微缩版音乐播放器 - 独立逻辑
(function() {
    // 歌曲列表（请替换为您的实际音乐文件）
    const songs = [
        {
            name: 'Sea of Tranquility',
            singer: 'Nigel Stanford',
            src: 'sound/Sea of Tranquility-BeMax.mp3',
            cover: 'image/sound01.jpeg'
        },
        {
            name: 'Белая кошка',
            singer: 'Мельница',
            src: 'sound/Белаякошка (小白猫).mp3',
            cover: 'image/sound02.jpeg'
        }
        // 可继续添加
    ];

    let currentIndex = 0;
    let isPlaying = false;
    let audio = null;

    // DOM 元素
    let playBtn, prevBtn, nextBtn, volumeSlider, progressBar, progressFilled;
    let currentTimeSpan, totalTimeSpan, songNameSpan, singerSpan, coverImg;

    // 初始化播放器
    function initPlayer() {
        audio = document.getElementById('mini-audio-player');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'mini-audio-player';
            audio.style.display = 'none';
            document.body.appendChild(audio);
        }

        // 获取 UI 元素
        playBtn = document.getElementById('mini-play-btn');
        prevBtn = document.getElementById('mini-prev-btn');
        nextBtn = document.getElementById('mini-next-btn');
        volumeSlider = document.getElementById('mini-volume');
        progressBar = document.getElementById('mini-progress-bar');
        progressFilled = document.getElementById('mini-progress-filled');
        currentTimeSpan = document.getElementById('mini-current-time');
        totalTimeSpan = document.getElementById('mini-total-time');
        songNameSpan = document.getElementById('mini-song-name');
        singerSpan = document.getElementById('mini-singer');
        coverImg = document.getElementById('mini-cover-img');

        if (!playBtn) return; // 未找到播放器容器，不初始化

        // 绑定事件
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);
        volumeSlider.addEventListener('input', (e) => {
            if (audio) audio.volume = parseFloat(e.target.value);
        });
        progressBar.addEventListener('click', setProgress);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => {
            totalTimeSpan.textContent = formatTime(audio.duration);
        });
        audio.addEventListener('ended', nextSong);

        // 加载第一首歌曲
        loadSong(currentIndex);
        audio.volume = parseFloat(volumeSlider.value);
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
        audio.src = song.src;
        songNameSpan.textContent = song.name;
        singerSpan.textContent = song.singer;
        coverImg.src = song.cover;
        progressFilled.style.width = '0%';
        currentTimeSpan.textContent = '00:00';
        totalTimeSpan.textContent = '00:00';
        if (isPlaying) {
            audio.play().catch(e => console.log('自动播放被阻止'));
        }
    }

    function updateProgress() {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFilled.style.width = `${percent}%`;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
        totalTimeSpan.textContent = formatTime(audio.duration);
    }

    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playBtn.textContent = '▶️';
        } else {
            audio.play();
            playBtn.textContent = '⏸️';
        }
        isPlaying = !isPlaying;
    }

    function nextSong() {
        currentIndex = (currentIndex + 1) % songs.length;
        loadSong(currentIndex);
        if (isPlaying) audio.play();
    }

    function prevSong() {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        loadSong(currentIndex);
        if (isPlaying) audio.play();
    }

    function setProgress(e) {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = clickX / rect.width;
        audio.currentTime = percent * audio.duration;
    }

    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayer);
    } else {
        initPlayer();
    }
})();