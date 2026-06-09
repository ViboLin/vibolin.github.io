// 微缩版音乐播放器 - 左侧延伸音量面板（紧凑版）
(function() {
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
    ];

    let currentIndex = 0;
    let isPlaying = false;
    let audio = null;

    let playBtn, prevBtn, nextBtn, volumeBtn;
    let verticalVolume;
    let progressBar, progressFilled;
    let currentTimeSpan, totalTimeSpan, songNameSpan, singerSpan, coverImg;
    let volumeExtension;

    function initPlayer() {
        audio = document.getElementById('mini-audio-player');
        if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'mini-audio-player';
            audio.style.display = 'none';
            document.body.appendChild(audio);
        }

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

        if (!playBtn) return;

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

        progressBar.addEventListener('click', setProgress);
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
            audio.play().catch(e => console.log('播放被阻止'));
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayer);
    } else {
        initPlayer();
    }
})();