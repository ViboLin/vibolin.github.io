// 微缩版音乐播放器 - 右侧延伸音量面板（适配字体图标）
(function() {
    // 歌曲列表（请根据实际路径修改）
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
            cover: 'image/music/sound02.jpeg'
        }
    ];

    let currentIndex = 0;
    let isPlaying = false;
    let audio = null;

    let playBtn, prevBtn, nextBtn, volumeBtn;
    let playIcon;               // 播放按钮内的图标元素
    let verticalVolume;
    let progressBar, progressFilled;
    let currentTimeSpan, totalTimeSpan, songNameSpan, singerSpan, coverImg;
    let volumeExtension;

    function initPlayer() {
        // 创建 audio 元素
        audio = document.getElementById('mini-audio-player');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'mini-audio-player';
            audio.style.display = 'none';
            document.body.appendChild(audio);
        }

        // 获取 DOM 元素
        playBtn = document.getElementById('mini-play-btn');
        prevBtn = document.getElementById('mini-prev-btn');
        nextBtn = document.getElementById('mini-next-btn');
        volumeBtn = document.getElementById('mini-volume-btn');
        verticalVolume = document.getElementById('mini-vertical-volume');
        progressBar = document.getElementById('mini-progress-bar');
        progressFilled = document.getElementById('mini-progress-filled');
        currentTimeSpan = document.getElementById('mini-current-time');
        totalTimeSpan = document.getElementById('mini-total-time');
        songNameSpan = document.getElementById('mini-song-name');
        singerSpan = document.getElementById('mini-singer');
        coverImg = document.getElementById('mini-cover-img');
        volumeExtension = document.getElementById('mini-volume-extension');

        // 获取播放按钮内的图标元素
        if (playBtn) {
            playIcon = playBtn.querySelector('.iconfont');
        }

        if (!playBtn || !playIcon) {
            console.warn('播放器按钮未找到，请检查 HTML 结构');
            return;
        }

        // 绑定事件
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);
        
        if (volumeBtn && volumeExtension) {
            volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                volumeExtension.classList.toggle('open');
            });
        }

        if (verticalVolume) {
            verticalVolume.addEventListener('input', (e) => {
                if (audio) audio.volume = parseFloat(e.target.value);
            });
            verticalVolume.value = audio ? audio.volume : 0.8;
        }

        if (progressBar) {
            progressBar.addEventListener('click', setProgress);
        }
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', () => {
            totalTimeSpan.textContent = formatTime(audio.duration);
        });
        audio.addEventListener('ended', nextSong);

        loadSong(currentIndex);
        if (audio) audio.volume = verticalVolume ? parseFloat(verticalVolume.value) : 0.8;
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
            // 切换图标为播放图标（根据您的图标库，可能是 'icon-play-circle'）
            if (playIcon) {
                playIcon.className = 'iconfont icon-play-circle';
            }
        } else {
            audio.play();
            // 切换图标为暂停图标（常见的暂停图标类名 'icon-pause'，如果不存在请替换）
            // 如果您的字体库没有暂停图标，可以保留同一个图标，或者使用 'icon-stop'
            if (playIcon) {
                playIcon.className = 'iconfont icon-timeout';   // 请根据实际图标库修改
            }
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayer);
    } else {
        initPlayer();
    }
})();