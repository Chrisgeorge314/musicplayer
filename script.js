/* --- APPLICATION DATA CORE --- */
const songsData = [
    { id: 1, name: "Snowman", artist: "Sia", phone: "5575741235", cover: "cover/cover1.jpg", src: "music/song1.mp3", featured: true },
    { id: 2, name: "Sia - Cheap Thrills (Lyrics) ft. Sean Paul", artist: "Sia", phone: "5575741235", cover: "cover/cover2.jpg", src: "music/song2.mp3", featured: true },
    { id: 3, name: "Badtameez Dil", artist: "Pritam", phone: "8475698425", cover: "cover/cover3.jpg", src: "music/song3.mp3", featured: true },
    { id: 4, name: "Stephen Sanchez, Em Beihold - Until I Found You", artist: "Stephen Sanchez", phone: "8745963214", cover: "cover/cover4.jpg", src: "music/song4.mp3", featured: false },
    { id: 5, name: "Ed Sheeran - Perfect", artist: "Ed Sheeran", phone: "8796547589", cover: "cover/cover5.jpg", src: "music/song5.mp3", featured: false }
];

const artistsData = [
    { name: "Sia", photo: "author/artist1.jpg", email: "sia3@gmail.com", phone: "5575741235", bio: "Sia Furler is an Australian singer and songwriter known for hit songs like Chandelier, Cheap Thrills, and Titanium.", personalLife: "To protect her privacy from toxic celebrity culture and paparazzi, she famously adopted her iconic trademark oversized, two-toned wigs to conceal her face during public performances.", spotify: "https://open.spotify.com/artist/5WUlDfRSoLAfcVSX1WnrxN", insta: "https://www.instagram.com/siamusic/", popular: ["Chandelier", "Cheap Thrills", "Titanium", "Elastic Heart", "Unstoppable"] },
    { name: "Pritam", photo: "author/artist3.jpg", email: "pritamr@gmail.com", phone: "8475698425", bio: "Pritam Chakraborty, universally known as Pritam, is a master Indian music composer best known for composing hit Bollywood film soundtracks.", personalLife: "Born in Kolkata into a musical family, he graduated from the prestigious FTII. He lives a low-profile family life in Mumbai.", spotify: "https://open.spotify.com/artist/1wRPtKGflJrBx9BmLsSwlU", insta: "https://www.instagram.com/ipritamofficial/", popular: ["Kesariya", "Tum Hi Ho Bandhu", "Badtameez Dil", "Ae Dil Hai Mushkil", "Ilahi"] },
    { name: "Stephen Sanchez", photo: "author/artist4.jpg", email: "stephenio@gmail.com", phone: "8745963214", bio: "Stephen Sanchez is an American singer and songwriter recognized for channelizing the aesthetic, emotional delivery, and sonic architecture of 1950s old-school crooners.", personalLife: "Growing up in Northern California, Stephen spent his formative years listening to old vinyl records at his grandparents' house, which heavily shaped his vintage artistic philosophy.", spotify: "https://open.spotify.com/artist/5XKFrudbV4IiuE5WuTPRmT", insta: "https://www.instagram.com/stephensanchezofficial/", popular: ["Until I Found You", "Evangeline", "Be More", "Only Girl", "High"] },
    { name: "Ed Sheeran", photo: "author/artist5.jpg", email: "edsheeran@gmail.com", phone: "8796547589", bio: "Edward Christopher Sheeran is a globally celebrated English singer-songwriter known for his acoustic-driven pop hits.", personalLife: "Ed grew up in Suffolk, singing in a local church choir. He is happily married to his childhood sweetheart, Cherry Seaborn, and they have two daughters.", spotify: "https://open.spotify.com/artist/6eUKZXaKkcviH0Ku9w2n3V", insta: "https://www.instagram.com/teddysphotos/", popular: ["Shape of You", "Perfect", "Thinking Out Loud", "Photograph", "Castle on the Hill"] }
];

/* --- STORAGE REGISTERS --- */
let customPlaylists = JSON.parse(localStorage.getItem('soundsphere_playlists')) || [];
let favorites = JSON.parse(localStorage.getItem('soundsphere_favs')) || [];
let playbackHistory = JSON.parse(localStorage.getItem('soundsphere_history')) || [];
let currentUser = JSON.parse(localStorage.getItem('soundsphere_user')) || null;

/* --- COMPLIANT TRACK CHANNELS QUEUES --- */
let baseContextSongs = [...songsData];   
let activePlaybackQueue = [...songsData]; 
let currentTrackIndex = -1;
let isPlaying = false;
let isShuffleActive = false;
let authIsLoginMode = false;
let activePlaylistContextId = null;

const nativeAudio = document.getElementById('native-audio-pipeline');
const masterPlayBtn = document.getElementById('player-master-play');
const progressFill = document.getElementById('player-progress-fill');
const progressTimeline = document.getElementById('progress-timeline-click');
const volumeFill = document.getElementById('player-volume-fill');
const volumeSlider = document.getElementById('volume-slider-click');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const shuffleBtn = document.getElementById('player-shuffle-btn');

document.addEventListener("DOMContentLoaded", () => {
    renderUI();
    renderLandingPreviewGrid('all'); 
    setupRouting();
    setupAudioListeners();
    setupValidation();
    setupMobileMenu();
    setupThemeToggle();
    setupAuthEngine();
    setupAccountActions();
    setupLandingInteractions();
    setupPlaylistCreatorModalTriggers();
    syncLibraryMetrics();

    if (currentUser) unlockApplication(false);
    else lockApplicationDefaults();

    if (localStorage.getItem('soundsphere_theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
});

/* --- LANDING SCROLL ROUTINES --- */
function setupLandingInteractions() {
    const loginModals = document.querySelectorAll('.open-login-modal-btn');
    const modalCloseBtn = document.getElementById('close-auth-modal-btn');
    const authOverlayModal = document.getElementById('auth-gateway');
    const exploreNav = document.getElementById('landing-explore-nav');
    const featuredNav = document.getElementById('landing-featured-nav');
    const scrollAnchor = document.getElementById('landing-preview-anchor');

    loginModals.forEach(btn => btn.onclick = () => authOverlayModal.classList.add('modal-active'));
    if (modalCloseBtn) modalCloseBtn.onclick = () => authOverlayModal.classList.remove('modal-active');

    if (exploreNav && scrollAnchor) {
        exploreNav.onclick = () => { renderLandingPreviewGrid('all'); scrollAnchor.scrollIntoView({ behavior: 'smooth' }); };
    }
    if (featuredNav && scrollAnchor) {
        featuredNav.onclick = () => { renderLandingPreviewGrid('featured'); scrollAnchor.scrollIntoView({ behavior: 'smooth' }); };
    }
}

function renderLandingPreviewGrid(mode) {
    const targetGrid = document.getElementById('landing-showcase-grid');
    const titleText = document.getElementById('preview-grid-title');
    if (!targetGrid) return;
    targetGrid.innerHTML = '';
    
    let dataset = songsData;
    if (mode === 'featured') {
        dataset = songsData.filter(s => s.featured);
        if (titleText) titleText.innerHTML = `<i class="fa-solid fa-fire text-primary"></i> Trending Tracks`;
    } else {
        if (titleText) titleText.innerHTML = `<i class="fa-solid fa-compass text-primary"></i> Explore Songs`;
    }

    dataset.forEach(song => {
        targetGrid.insertAdjacentHTML('beforeend', `
            <div class="music-card" onclick="triggerLandingModalNotice('${song.name}')">
                <div class="card-img-wrapper">
                    <img src="${song.cover}">
                    <button class="card-play-overlay-btn" style="opacity:1; transform:translateY(0);"><i class="fa-solid fa-play"></i></button>
                </div>
                <h3>${song.name}</h3><p>${song.artist}</p>
                <div class="card-action-bar"><span class="artist-phone-link"><i class="fa-solid fa-lock"></i> Preview Mode</span></div>
            </div>`);
    });
}

function triggerLandingModalNotice(trackName) {
    showToast(`Create a free account to stream "${trackName}"!`);
    document.getElementById('auth-gateway').classList.add('modal-active');
}

/* --- PLAYLIST MODALS --- */
function setupPlaylistCreatorModalTriggers() {
    const triggerBtn = document.getElementById('trigger-playlist-modal-btn');
    if (triggerBtn) {
        triggerBtn.onclick = (e) => {
            e.preventDefault();
            document.getElementById('playlist-creator-modal').classList.add('modal-active');
        };
    }
}

function closePlaylistCreatorModal() {
    document.getElementById('playlist-creator-modal').classList.remove('modal-active');
    document.getElementById('playlist-creation-form').reset();
}

function handleCustomPlaylistGenerationSubmit(event) {
    event.preventDefault();
    const nameVal = document.getElementById('modal-playlist-name').value.trim();
    const descVal = document.getElementById('modal-playlist-desc').value.trim() || "Custom User Collection";
    const fileInput = document.getElementById('modal-playlist-file');
    
    if (!nameVal) return;
    const newID = "playlist-" + Date.now();
    
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const fileReaderInstance = new FileReader();
        fileReaderInstance.onload = function(e) {
            saveAndMountNewPlaylistNode(newID, nameVal, descVal, e.target.result);
        };
        fileReaderInstance.readAsDataURL(fileInput.files[0]);
    } else {
        saveAndMountNewPlaylistNode(newID, nameVal, descVal, "cover/cover2.jpg");
    }
}

function saveAndMountNewPlaylistNode(id, name, bio, coverImageSrc) {
    customPlaylists.push({ id: id, name: name, description: bio, cover: coverImageSrc, songs: [] });
    localStorage.setItem('soundsphere_playlists', JSON.stringify(customPlaylists));
    showToast(`Playlist "${name}" created cleanly!`);
    closePlaylistCreatorModal();
    renderUI(); 
    syncLibraryMetrics();
}

/* --- AUTH PIPELINE --- */
function setupAuthEngine() {
    const authForm = document.getElementById('auth-form');
    const switchModeBtn = document.getElementById('auth-switch-mode');
    if (switchModeBtn) {
        switchModeBtn.onclick = () => {
            authIsLoginMode = !authIsLoginMode;
            document.getElementById('auth-title').innerText = authIsLoginMode ? "Welcome Back" : "Create Your Account";
            document.getElementById('auth-name-group').style.display = authIsLoginMode ? "none" : "block";
        };
    }
    if (authForm) {
        authForm.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value.trim();
            if (email) {
                currentUser = { name: document.getElementById('auth-name').value.trim() || "User", email: email, phone: document.getElementById('auth-phone').value.trim() || "9876543210" };
                localStorage.setItem('soundsphere_user', JSON.stringify(currentUser));
                unlockApplication(true);
            }
        };
    }
}

function lockApplicationDefaults() {
    document.getElementById('landing-welcome-screen').classList.remove('welcome-hidden');
    document.getElementById('main-application-workspace').classList.add('app-hidden');
    document.getElementById('global-player-dock').style.display = 'none';
}

function unlockApplication(triggerToast) {
    document.getElementById('auth-gateway').classList.remove('modal-active');
    document.getElementById('landing-welcome-screen').classList.add('welcome-hidden');
    document.getElementById('main-application-workspace').classList.remove('app-hidden');
    document.getElementById('global-player-dock').style.display = 'grid';
    if(currentUser) document.getElementById('user-display-name').innerText = currentUser.name;
    document.getElementById('sidebar-user-badge').classList.remove('hidden');
    navigateTo('home-view');
}

/* --- DESIGN GENERATOR LAYOUT CARDS --- */
function renderUI() {
    const featuredGrid = document.getElementById('featured-songs-grid');
    const allSongsGrid = document.getElementById('all-songs-grid');
    const artistsGrid = document.getElementById('artists-grid');

    if (featuredGrid) featuredGrid.innerHTML = '';
    if (allSongsGrid) allSongsGrid.innerHTML = '';
    
    let dropdownOptions = `<option value="" disabled selected>Add to playlist...</option>`;
    customPlaylists.forEach(pl => {
        dropdownOptions += `<option value="${pl.id}">${pl.name}</option>`;
    });

    songsData.forEach((song, idx) => {
        const isFav = favorites.includes(song.id) ? 'favorited' : '';
        const heartClass = favorites.includes(song.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        
        const cardHTML = `
            <div class="music-card" id="track-card-${song.id}">
                <div class="card-img-wrapper" onclick="playSongGlobalContextIndex(${idx})">
                    <img src="${song.cover}">
                    <button class="card-play-overlay-btn" id="overlay-btn-${song.id}"><i class="fa-solid fa-play"></i></button>
                </div>
                <h3>${song.name}</h3><p>${song.artist}</p>
                <div class="card-action-bar">
                    <a href="tel:${song.phone}" class="artist-phone-link"><i class="fa-solid fa-phone"></i> Call</a>
                    <button class="card-icon-action-btn ${isFav}" id="card-heart-${song.id}" onclick="toggleFavorite(${song.id}, event)"><i class="${heartClass}"></i></button>
                    <button class="card-icon-action-btn" title="View Artist Profile" onclick="viewArtistDetails('${song.artist}', event)"><i class="fa-solid fa-eye"></i></button>
                </div>
                <select class="playlist-select-dropdown" onclick="event.stopPropagation()" onchange="handleDropdownPlaylistAdd(${song.id}, this)">
                    ${dropdownOptions}
                </select>
            </div>`;
        
        if (allSongsGrid) allSongsGrid.insertAdjacentHTML('beforeend', cardHTML);
        if (song.featured && featuredGrid) featuredGrid.insertAdjacentHTML('beforeend', cardHTML);
    });

    if (artistsGrid) {
        artistsGrid.innerHTML = '';
        artistsData.forEach(artist => {
            artistsGrid.insertAdjacentHTML('beforeend', `
                <div class="artist-circle-card" onclick="viewArtistDetails('${artist.name}', event)">
                    <div class="artist-avatar-wrapper"><img src="${artist.photo}"></div>
                    <h3>${artist.name}</h3>
                    <p style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Artist Profile</p>
                </div>`);
        });
    }
}

function syncLibraryMetrics() {
    const songCountEl = document.getElementById('library-liked-songs-count');
    if (songCountEl) songCountEl.innerText = `${favorites.length} songs favorited`;
    
    const shelf = document.getElementById('custom-playlists-shelf-target');
    if (!shelf) return;
    shelf.innerHTML = '';

    if (customPlaylists.length === 0) {
        shelf.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size: 0.9rem; font-style: italic; padding: 10px 4px;">No playlists built yet. Click "+ Create Playlist" above to start custom collections!</p>`;
        return;
    }

    customPlaylists.forEach(pl => {
        shelf.innerHTML += `
            <div class="artist-circle-card" style="border-radius:12px; text-align:left;" onclick="openPlaylistView('${pl.id}')">
                <div class="artist-avatar-wrapper" style="border-radius:8px; width:100%; height:130px;"><img src="${pl.cover}" style="border-radius:8px;"></div>
                <h3 style="margin-top:12px; font-size:1.05rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${pl.name}</h3>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${pl.songs.length} tracks assigned</p>
            </div>`;
    });
}

function handleDropdownPlaylistAdd(songId, selectNode) {
    const playlistId = selectNode.value;
    if (!playlistId) return;
    
    const targetPlaylist = customPlaylists.find(p => p.id === playlistId);
    if (targetPlaylist) {
        if (!targetPlaylist.songs.includes(songId)) {
            targetPlaylist.songs.push(songId);
            localStorage.setItem('soundsphere_playlists', JSON.stringify(customPlaylists));
            showToast(`Added to "${targetPlaylist.name}" playlist.`);
            syncLibraryMetrics();
        } else {
            showToast("Track already added to this playlist.");
        }
    }
    selectNode.value = ""; 
}

/* --- PLAYLIST DETAILED CANVAS DATA TABLE GENERATOR --- */
function openPlaylistView(id) {
    activePlaylistContextId = id;
    const canvas = document.getElementById('playlist-tracklist-canvas');
    if (!canvas) return;
    
    canvas.innerHTML = '';
    canvas.classList.remove('hidden');

    let title, desc, cover;
    if (id === 'liked-songs-id') {
        title = "Liked Songs"; desc = "Your personal library space layer"; cover = "cover/cover3.jpg";
        baseContextSongs = songsData.filter(s => favorites.includes(s.id));
    } else {
        const pl = customPlaylists.find(p => p.id === id);
        if (!pl) return;
        title = pl.name; desc = pl.description; cover = pl.cover;
        baseContextSongs = songsData.filter(s => pl.songs.includes(s.id));
    }

    let rowsHTML = '';
    if (baseContextSongs.length === 0) {
        rowsHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:var(--text-muted); font-style:italic;">Playlist is empty. Add elements using option dropdown menus on the Music page!</td></tr>`;
    } else {
        baseContextSongs.forEach((song, idx) => {
            rowsHTML += `
                <tr onclick="playFromPlaylistTableItemClick(${idx})">
                    <td style="width:40px; text-align:center; font-weight:600;">${idx + 1}</td>
                    <td>
                        <div class="table-row-track-meta">
                            <img src="${song.cover}" class="table-row-cover-img">
                            <div><strong style="color:#fff; display:block;">${song.name}</strong><span>${song.artist}</span></div>
                        </div>
                    </td>
                    <td>Premium Release Soundtrack</td>
                    <td style="text-align:right;"><button class="table-row-play-trigger-btn"><i class="fa-solid fa-play"></i></button></td>
                </tr>`;
        });
    }

    canvas.innerHTML = `
        <div class="playlist-banner-header-node">
            <img src="${cover}" class="playlist-banner-art-cover">
            <div class="playlist-header-meta-text">
                <span>Playlist Collection</span>
                <h1>${title}</h1>
                <p style="color:var(--text-muted); font-size:0.9rem;">${desc} • ${baseContextSongs.length} tracks loaded</p>
            </div>
        </div>
        <div class="playlist-runtime-control-row">
            <button class="play-action-circle-btn" onclick="triggerPlaylistMasterContextPlay()"><i class="fa-solid fa-play"></i></button>
            <button class="playlist-utility-icon-link ${isShuffleActive ? 'active-shuffle' : ''}" id="playlist-shuffle-toggle" onclick="togglePlaylistShuffle()"><i class="fa-solid fa-shuffle"></i></button>
        </div>
        <table class="playlist-table-container">
            <thead>
                <tr><th style="width:40px; text-align:center;">#</th><th>Title</th><th>Album Matrix</th><th style="text-align:right;"><i class="fa-regular fa-clock"></i></th></tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
        </table>`;
    
    canvas.scrollIntoView({ behavior: 'smooth' });
}

/* =================================================== */
/* --- SHUFFLE CONTROLLER RUNTIME PIPELINE --- */
/* =================================================== */
function togglePlaylistShuffle() {
    isShuffleActive = !isShuffleActive;
    
    const uiContextShuffleBtn = document.getElementById('playlist-shuffle-toggle');
    const bottomStickyBarShuffleBtn = document.getElementById('player-shuffle-btn');
    
    if (isShuffleActive) {
        if (uiContextShuffleBtn) uiContextShuffleBtn.classList.add('active-shuffle');
        if (bottomStickyBarShuffleBtn) bottomStickyBarShuffleBtn.classList.add('active-control');
        
        let currentlyPlayingTrack = currentTrackIndex !== -1 ? activePlaybackQueue[currentTrackIndex] : null;
        generateRandomizedPlaybackQueue();
        
        if (currentlyPlayingTrack) {
            currentTrackIndex = activePlaybackQueue.findIndex(s => s.id === currentlyPlayingTrack.id);
        }
    } else {
        if (uiContextShuffleBtn) uiContextShuffleBtn.classList.remove('active-shuffle');
        if (bottomStickyBarShuffleBtn) bottomStickyBarShuffleBtn.classList.remove('active-control');
        
        let currentlyPlayingTrack = currentTrackIndex !== -1 ? activePlaybackQueue[currentTrackIndex] : null;
        activePlaybackQueue = [...baseContextSongs];
        
        if (currentlyPlayingTrack) {
            currentTrackIndex = activePlaybackQueue.findIndex(s => s.id === currentlyPlayingTrack.id);
        }
    }
}

function generateRandomizedPlaybackQueue() {
    activePlaybackQueue = [...baseContextSongs];
    for (let i = activePlaybackQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activePlaybackQueue[i], activePlaybackQueue[j]] = [activePlaybackQueue[j], activePlaybackQueue[i]];
    }
}

function triggerPlaylistMasterContextPlay() {
    if (baseContextSongs.length === 0) { 
        showToast("No track entries loaded to deploy stream lines.", true); 
        return; 
    }
    if (isShuffleActive) {
        generateRandomizedPlaybackQueue();
        playSongFromQueueIndex(0);
    } else {
        activePlaybackQueue = [...baseContextSongs];
        playSongFromQueueIndex(0);
    }
}

function playFromPlaylistTableItemClick(tableIndex) {
    if (isShuffleActive) {
        const targetTrackSelection = baseContextSongs[tableIndex];
        generateRandomizedPlaybackQueue();
        
        activePlaybackQueue = activePlaybackQueue.filter(s => s.id !== targetTrackSelection.id);
        activePlaybackQueue.unshift(targetTrackSelection);
        
        playSongFromQueueIndex(0);
    } else {
        activePlaybackQueue = [...baseContextSongs];
        playSongFromQueueIndex(tableIndex);
    }
}

function playSongGlobalContextIndex(songsDataIndex) {
    activePlaylistContextId = null;
    baseContextSongs = [...songsData];
    
    isShuffleActive = false;
    const uiContextShuffleBtn = document.getElementById('playlist-shuffle-toggle');
    const bottomStickyBarShuffleBtn = document.getElementById('player-shuffle-btn');
    if (uiContextShuffleBtn) uiContextShuffleBtn.classList.remove('active-shuffle');
    if (bottomStickyBarShuffleBtn) bottomStickyBarShuffleBtn.classList.remove('active-control');
    
    activePlaybackQueue = [...songsData];
    playSongFromQueueIndex(songsDataIndex);
}

function playSongFromQueueIndex(queueIndex) {
    if (queueIndex < 0 || queueIndex >= activePlaybackQueue.length) return;
    currentTrackIndex = queueIndex;
    const track = activePlaybackQueue[queueIndex];

    nativeAudio.src = track.src;
    nativeAudio.load();
    appendTrackToHistory(track);
    
    nativeAudio.play().then(() => {
        isPlaying = true;
        masterPlayBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        
        document.getElementById('global-player-cover').src = track.cover;
        document.getElementById('global-player-title').innerText = track.name;
        document.getElementById('global-player-artist').innerText = track.artist;
        
        document.querySelectorAll('.music-card').forEach(c => c.classList.remove('playing-active'));
        const activeCard = document.getElementById(`track-card-${track.id}`);
        if(activeCard) activeCard.classList.add('playing-active');
        
        syncGlobalFavHeartState(track.id);
    }).catch(() => showToast("Pipeline failed to deploy track segment.", true));
}

/* --- DYNAMIC LIKED folder --- */
function toggleFavorite(id, event) {
    if (event) event.stopPropagation();
    const idx = favorites.indexOf(id);
    
    if (idx > -1) {
        favorites.splice(idx, 1);
        showToast("Removed from Liked Songs folder.");
    } else {
        favorites.push(id);
        showToast("Saved allocation to Liked Songs folder.");
    }
    localStorage.setItem('soundsphere_favs', JSON.stringify(favorites));
    
    const heartIcon = document.getElementById(`card-heart-${id}`)?.querySelector('i');
    if (heartIcon) {
        heartIcon.className = favorites.includes(id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }
    
    syncLibraryMetrics();
    
    if (activePlaylistContextId === 'liked-songs-id') {
        baseContextSongs = songsData.filter(s => favorites.includes(s.id));
        openPlaylistView('liked-songs-id');
    }
    
    if (currentTrackIndex !== -1 && activePlaybackQueue[currentTrackIndex].id === id) {
        syncGlobalFavHeartState(id);
    }
}

function toggleGlobalFavorite() {
    if (currentTrackIndex === -1) return;
    const currentTrack = activePlaybackQueue[currentTrackIndex];
    toggleFavorite(currentTrack.id);
}

function syncGlobalFavHeartState(songId) {
    const favToggle = document.getElementById('global-player-fav-toggle');
    if (!favToggle) return;
    if (favorites.includes(songId)) {
        favToggle.classList.add('favorited');
        favToggle.innerHTML = `<i class="fa-solid fa-heart" style="color:var(--accent-red);"></i>`;
    } else {
        favToggle.classList.remove('favorited');
        favToggle.innerHTML = `<i class="fa-regular fa-heart"></i>`;
    }
}

/* --- HUD CONTROL BUTTON ACTIONS --- */
function setupAudioListeners() {
    masterPlayBtn.addEventListener('click', () => {
        if (currentTrackIndex === -1) playSongFromQueueIndex(0);
        else {
            if (isPlaying) { nativeAudio.pause(); isPlaying = false; masterPlayBtn.innerHTML = `<i class="fa-solid fa-play"></i>`; }
            else { nativeAudio.play(); isPlaying = true; masterPlayBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`; }
        }
    });

    document.getElementById('player-prev-btn').addEventListener('click', () => {
        let idx = currentTrackIndex - 1 < 0 ? activePlaybackQueue.length - 1 : currentTrackIndex - 1;
        playSongFromQueueIndex(idx);
    });

    document.getElementById('player-next-btn').addEventListener('click', () => {
        let idx = currentTrackIndex + 1 >= activePlaybackQueue.length ? 0 : currentTrackIndex + 1;
        playSongFromQueueIndex(idx);
    });

    if (shuffleBtn) {
        shuffleBtn.onclick = () => { 
            togglePlaylistShuffle(); 
            if (activePlaylistContextId) openPlaylistView(activePlaylistContextId); 
        };
    }

    nativeAudio.addEventListener('timeupdate', () => {
        if (!nativeAudio.duration) return;
        const percentage = (nativeAudio.currentTime / nativeAudio.duration) * 100;
        progressFill.style.width = `${percentage}%`;
        timeCurrent.innerText = formatTime(nativeAudio.currentTime);
        timeTotal.innerText = formatTime(nativeAudio.duration);
    });

    nativeAudio.addEventListener('ended', () => {
        let idx = currentTrackIndex + 1 >= activePlaybackQueue.length ? 0 : currentTrackIndex + 1;
        playSongFromQueueIndex(idx);
    });

    progressTimeline.addEventListener('click', (e) => {
        const rect = progressTimeline.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (nativeAudio.duration) nativeAudio.currentTime = pos * nativeAudio.duration;
    });

    volumeSlider.addEventListener('click', (e) => {
        const rect = volumeSlider.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        nativeAudio.volume = pos;
        volumeFill.style.width = `${pos * 100}%`;
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/* --- NAV METRICS --- */
function setupRouting() {
    document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-menu .nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            navigateTo(link.getAttribute('data-target'));
        });
    });
}

function navigateTo(viewId) {
    document.querySelectorAll('.view-panel').forEach(panel => { panel.classList.remove('active-view'); panel.style.display = 'none'; });
    const target = document.getElementById(viewId);
    if (target) { target.classList.add('active-view'); target.style.display = 'block'; }
    if (viewId === 'artists-view') showArtistList();
    if (viewId === 'playlists-view') {
        syncLibraryMetrics();
        document.getElementById('playlist-tracklist-canvas').classList.add('hidden'); 
    }
    document.querySelector('.sidebar').classList.remove('mobile-open');
}

/* ==================================================================== */
/* --- FIXED ISSUE HOOK: DETAILED BIOGRAPHY GRID SWAPS WORKSPACE --- */
/* ==================================================================== */
function viewArtistDetails(artistName, event) {
    if (event) { 
        event.preventDefault(); 
        event.stopPropagation(); 
    }
    
    const artist = artistsData.find(a => a.name.toLowerCase() === artistName.toLowerCase());
    if (!artist) return;
    
    let tracksHTML = '';
    artist.popular.forEach((track, index) => {
        tracksHTML += `
            <div class="popular-song-row">
                <span class="popular-song-index">${index + 1}</span>
                <i class="fa-solid fa-play" style="color: var(--primary-color); font-size: 0.85rem;"></i>
                <span style="flex:1; font-weight:600; margin-left:10px;">${track}</span>
                <span style="font-size:0.8rem; color:var(--text-muted);">Top Track Release</span>
            </div>`;
    });

    document.getElementById('artist-detail-content').innerHTML = `
        <div class="artist-profile-header-card">
            <img src="${artist.photo}" class="profile-large-avatar" alt="${artist.name}">
            <div class="profile-header-details">
                <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary-color); font-weight: 700; letter-spacing: 1px;">Verified Artist Profile</span>
                <h2 style="font-size: 2.2rem; margin-top: 4px; margin-bottom: 12px;">${artist.name}</h2>
                <h4 style="margin-bottom: 4px;"><i class="fa-solid fa-book-open text-primary"></i> Biography</h4>
                <p class="artist-bio-text" style="margin-top: 0; margin-bottom: 16px;">${artist.bio}</p>
                <h4 style="margin-bottom: 4px;"><i class="fa-solid fa-heart-pulse text-primary"></i> Personal Life</h4>
                <p class="artist-bio-text" style="margin-top: 0; margin-bottom: 20px; font-style: italic;">${artist.personalLife}</p>
                <div class="artist-meta-info-row">
                    <span><i class="fa-solid fa-envelope"></i> ${artist.email}</span>
                    <span><i class="fa-solid fa-phone"></i> ${artist.phone}</span>
                </div>
                <div class="social-links-row">
                    <a href="${artist.spotify}" target="_blank" class="social-icon-btn"><i class="fa-brands fa-spotify"></i></a>
                    <a href="${artist.insta}" target="_blank" class="social-icon-btn"><i class="fa-brands fa-instagram"></i></a>
                </div>
            </div>
        </div>
        <div class="popular-tracks-list-container">
            <h3 style="margin-bottom: 20px;"><i class="fa-solid fa-fire text-primary"></i> Popular Releases Matrix</h3>
            ${tracksHTML}
        </div>`;

    // CRITICAL REPAIR FIX NODES: Toggle display values explicitly 
    document.getElementById('artist-list-subview').style.display = 'none';
    document.getElementById('artist-detail-subview').style.display = 'block';
    
    // Highlight sidebar active item tracking layers cleanly
    document.querySelectorAll('.nav-menu .nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-target="artists-view"]').classList.add('active');
    
    // Push global layout panel visible
    document.querySelectorAll('.view-panel').forEach(panel => { panel.classList.remove('active-view'); panel.style.display = 'none'; });
    const parentPanel = document.getElementById('artists-view');
    parentPanel.classList.add('active-view');
    parentPanel.style.display = 'block';
}

function showArtistList() {
    document.getElementById('artist-detail-subview').style.display = 'none';
    document.getElementById('artist-list-subview').style.display = 'block';
}

/* --- CONTACT VALIDATIONS MODULE WITH TOASTER ALERTS --- */
function setupValidation() {
    const form = document.getElementById('contact-form');
    const msgInput = document.getElementById('form-message');
    const wordCounter = document.getElementById('word-count');

    if (msgInput && wordCounter) {
        msgInput.addEventListener('input', () => {
            const words = msgInput.value.trim().split(/\s+/).filter(w => w.length > 0);
            wordCounter.innerText = words.length;
            if (words.length > 200) {
                document.getElementById('err-message').innerText = "Word boundary exceeded (Max 200 words limit).";
            } else {
                document.getElementById('err-message').innerText = "";
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let valid = true;
            
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const message = msgInput ? msgInput.value.trim() : "";

            document.querySelectorAll('.error-msg').forEach(el => el.innerText = "");

            if (!name) { document.getElementById('err-name').innerText = "Full Name is required."; valid = false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('err-email').innerText = "Provide a valid email format pattern."; valid = false; }
            if (!/^\d{10}$/.test(phone)) { document.getElementById('err-phone').innerText = "Phone number must be exactly 10 digits."; valid = false; }
            
            const words = message.split(/\s+/).filter(w => w.length > 0);
            if (!message) { document.getElementById('err-message').innerText = "Message block context cannot be empty."; valid = false; }
            else if (words.length > 200) { document.getElementById('err-message').innerText = "Exceeded the 200 words limit configuration bounds."; valid = false; }

            if (valid) {
                showToast("Message deployed successfully!");
                form.reset();
                if (wordCounter) wordCounter.innerText = 0;
            } else {
                showToast("Please correct layout form errors.", true);
            }
        });
    }
}

function setupAccountActions() {
    const userBadge = document.getElementById('sidebar-user-badge');
    const signoutBtn = document.getElementById('account-signout-btn');
    if (userBadge) {
        userBadge.addEventListener('click', () => {
            document.querySelectorAll('.nav-menu .nav-link').forEach(l => l.classList.remove('active'));
            document.getElementById('profile-card-name').innerText = currentUser.name;
            document.getElementById('profile-card-email').innerText = currentUser.email;
            document.getElementById('profile-card-phone').innerText = currentUser.phone;
            document.getElementById('profile-card-count').innerText = playbackHistory.length;
            
            let historyHTML = '';
            playbackHistory.forEach(t => {
                historyHTML += `<div class="history-timeline-row"><img src="${t.cover}" class="history-timeline-img"><div><h4>${t.name}</h4><p>${t.artist}</p></div><span class="history-timestamp-badge">${t.timestamp}</span></div>`;
            });
            document.getElementById('account-history-timeline-target').innerHTML = historyHTML || '<p>No log entries logged yet.</p>';
            navigateTo('account-view');
        });
    }
    if (signoutBtn) {
        signoutBtn.onclick = () => {
            if(isPlaying) { nativeAudio.pause(); isPlaying = false; masterPlayBtn.innerHTML = `<i class="fa-solid fa-play"></i>`; }
            localStorage.removeItem('soundsphere_user');
            currentUser = null;
            userBadge.classList.add('hidden');
            lockApplicationDefaults();
        };
    }
}

function appendTrackToHistory(songObj) {
    playbackHistory = playbackHistory.filter(item => item.id !== songObj.id);
    playbackHistory.unshift({ id: songObj.id, name: songObj.name, artist: songObj.artist, cover: songObj.cover, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    if (playbackHistory.length > 5) playbackHistory.pop();
    localStorage.setItem('soundsphere_history', JSON.stringify(playbackHistory));
}

function showToast(msg, isError = false) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

function setupMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggle) toggle.onclick = (e) => { e.stopPropagation(); sidebar.classList.toggle('mobile-open'); };
    document.addEventListener('click', (e) => { if (sidebar && !sidebar.contains(e.target) && toggle && !toggle.contains(e.target)) sidebar.classList.remove('mobile-open'); });
}

function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
        btn.onclick = () => {
            const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('soundsphere_theme', theme);
            btn.innerHTML = `<i class="fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}"></i> <span>${theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>`;
        };
    }
}