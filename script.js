document.addEventListener('DOMContentLoaded', () => {
    const songTitleElement = document.getElementById('song-title');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.querySelector('.progress-container');
    const audioPlayer = document.getElementById('audio-player');
    const playlistElement = document.getElementById('playlist');
    const albumButtons = document.querySelectorAll('.album-btn');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const modeBtn = document.getElementById('mode-btn');

    const albums = {
        '1': [
            { title: 'KARINA FOR LOVE - like Karina [Cover by like jennie]', src: 'like Karina.WAV' },
            { title: 'KARINA FOR LOVE - lively Karina', src: 'LIVELY.mp3' },
            { title: 'KARINA FOR LOVE - love Karina', src: 'LOVE.mp3' },
            { title: 'KARINA FOR LOVE - lucky Karina', src: 'lucky Karina.WAV' },
        ],
        '2': [
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song1.mp3' },
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song2.mp3' },
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song3.mp3' },
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song4.mp3' },
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song5.mp3' },
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song6.mp3' },
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song7.mp3' },
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song8.mp3' },
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song9.mp3' },
            { title: 'COMING SOON - COMING SOON', src: 'music/album2-song10.mp3' },
        ]
    };

    // 新增：播放模式定义
    const PLAY_MODES = {
        SEQUENTIAL: 'sequential', // 顺序播放
        SINGLE: 'single',         // 单曲循环
        RANDOM: 'random'          // 随机播放
    };
    const modeCycle = [PLAY_MODES.SEQUENTIAL, PLAY_MODES.SINGLE, PLAY_MODES.RANDOM];
    const modeText = {
        [PLAY_MODES.SEQUENTIAL]: '顺序',
        [PLAY_MODES.SINGLE]: '循环',
        [PLAY_MODES.RANDOM]: '随机'
    };
    let currentModeIndex = 0;

    let currentAlbumId = '1';
    let currentSongIndex = 0;
    let isPlaying = false;
    let currentVolume = 1;

    function loadAlbum(albumId) {
        currentAlbumId = albumId;
        const songs = albums[currentAlbumId];
        playlistElement.innerHTML = '';
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = song.title;
            li.dataset.index = index;
            playlistElement.appendChild(li);
        });
        loadSong(0, false); // 切换专辑时不自动播放
        updatePlaylistUI();
    }

    function loadSong(index, autoplay = true) {
        songTitleElement.classList.add('fade-out');
        setTimeout(() => {
            currentSongIndex = index;
            const song = albums[currentAlbumId][currentSongIndex];
            songTitleElement.textContent = song.title;
            audioPlayer.src = song.src;
            updatePlaylistUI();
            songTitleElement.classList.remove('fade-out');
            if (autoplay) {
                playSong();
            }
        }, 400);
    }

    function playSong() {
        isPlaying = true;
        playPauseBtn.textContent = '❚❚';
        audioPlayer.play().catch(error => console.error("Playback failed:", error));
    }

    function pauseSong() {
        isPlaying = false;
        playPauseBtn.textContent = '▶';
        audioPlayer.pause();
    }

    function prevSong() {
        const songCount = albums[currentAlbumId].length;
        currentSongIndex = (currentSongIndex - 1 + songCount) % songCount;
        loadSong(currentSongIndex);
    }

    function nextSong() {
        const songCount = albums[currentAlbumId].length;
        currentSongIndex = (currentSongIndex + 1) % songCount;
        loadSong(currentSongIndex);
    }
    
    function playRandomSong() {
        const songCount = albums[currentAlbumId].length;
        if (songCount <= 1) {
            nextSong();
            return;
        }
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * songCount);
        } while (randomIndex === currentSongIndex);
        loadSong(randomIndex);
    }

    // 新增：切换播放模式的函数
    function changePlayMode() {
        currentModeIndex = (currentModeIndex + 1) % modeCycle.length;
        const newMode = modeCycle[currentModeIndex];
        modeBtn.textContent = modeText[newMode];
    }

    // 新增：处理歌曲播放结束的逻辑
    function handleSongEnd() {
        const currentMode = modeCycle[currentModeIndex];
        switch (currentMode) {
            case PLAY_MODES.SINGLE:
                audioPlayer.currentTime = 0;
                playSong();
                break;
            case PLAY_MODES.RANDOM:
                playRandomSong();
                break;
            case PLAY_MODES.SEQUENTIAL:
            default:
                nextSong();
                break;
        }
    }
    
    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        if (duration) {
            audioPlayer.currentTime = (clickX / width) * duration;
        }
    }

    function setVolume() {
        currentVolume = volumeSlider.value;
        audioPlayer.volume = currentVolume;
    }

    function toggleMute() {
        if (audioPlayer.volume > 0) {
            currentVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
            volumeSlider.value = 0;
        } else {
            const restoreVolume = currentVolume > 0 ? currentVolume : 1;
            audioPlayer.volume = restoreVolume;
            volumeSlider.value = restoreVolume;
        }
    }

    function updateVolumeIcon() {
        if (audioPlayer.volume == 0) {
            volumeIcon.textContent = '静音';
        } else {
            volumeIcon.textContent = '音量';
        }
    }

    function updatePlaylistUI() {
        const listItems = playlistElement.querySelectorAll('li');
        listItems.forEach((item, index) => {
            item.classList.toggle('active', index === currentSongIndex);
        });
    }

    // 事件监听
    playPauseBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', handleSongEnd); // 修改
    audioPlayer.addEventListener('volumechange', updateVolumeIcon);
    progressContainer.addEventListener('click', setProgress);
    volumeSlider.addEventListener('input', setVolume);
    volumeIcon.addEventListener('click', toggleMute);
    modeBtn.addEventListener('click', changePlayMode); // 新增

    albumButtons.forEach(button => {
        button.addEventListener('click', () => {
            albumButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadAlbum(button.dataset.album);
            pauseSong();
        });
    });

    playlistElement.addEventListener('click', (e) => {
        if (e.target && e.target.tagName === 'LI') {
            const songIndex = parseInt(e.target.dataset.index);
            if (songIndex !== currentSongIndex) {
                loadSong(songIndex);
            } else {
                isPlaying ? pauseSong() : playSong();
            }
        }
    });

    // 初始化
    loadAlbum(currentAlbumId);
    audioPlayer.volume = volumeSlider.value;
});