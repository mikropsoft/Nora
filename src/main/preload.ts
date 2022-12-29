/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */
import { contextBridge, ipcRenderer } from 'electron';
import { LastFMTrackInfoApi } from '../@types/last_fm_api';

export const api = {
  // $ APP PROPERTIES
  isInDevelopment:
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true',

  // $ APP WINDOW CONTROLS
  minimizeApp: (): void => ipcRenderer.send('app/minimize'),
  toggleMaximizeApp: (): void => ipcRenderer.send('app/toggleMaximize'),
  closeApp: (): void => ipcRenderer.send('app/close'),

  // $ APP THEME
  listenForSystemThemeChanges: (
    callback: (e: any, isDarkMode: boolean, usingSystemTheme: boolean) => void
  ) => ipcRenderer.on('app/systemThemeChange', callback),
  changeAppTheme: (theme?: AppTheme): void =>
    ipcRenderer.send('app/changeAppTheme', theme),
  StoplisteningForSystemThemeChanges: (
    callback: (e: any, isDarkMode: boolean, usingSystemTheme: boolean) => void
  ) => ipcRenderer.removeListener('app/systemThemeChange', callback),

  // $ APP PLAYER CONTROLS
  songPlaybackStateChange: (isPlaying: boolean): void =>
    ipcRenderer.send('app/player/songPlaybackStateChange', isPlaying),
  toggleSongPlayback: (callback: (e: any) => void) =>
    ipcRenderer.on('app/player/toggleSongPlaybackState', callback),
  skipForwardToNextSong: (callback: (e: any) => void) =>
    ipcRenderer.on('app/player/skipForward', callback),
  skipBackwardToPreviousSong: (callback: (e: any) => void) =>
    ipcRenderer.on('app/player/skipBackward', callback),
  sendSongPosition: (position: number): void =>
    ipcRenderer.send('app/getSongPosition', position),
  incrementNoOfSongListens: (songId: string): void =>
    ipcRenderer.send('app/incrementNoOfSongListens', songId),
  toggleLikeSongs: (
    songIds: string[],
    isLikeSong?: boolean
  ): Promise<ToggleLikeSongReturnValue | undefined> =>
    ipcRenderer.invoke('app/toggleLikeSongs', songIds, isLikeSong),

  removeTogglePlaybackStateEvent: (callback: (e: any) => void) =>
    ipcRenderer.removeListener('app/player/toggleSongPlaybackState', callback),
  removeSkipBackwardToPreviousSongEvent: (callback: (e: any) => void) =>
    ipcRenderer.removeListener('app/player/skipBackward', callback),
  removeSkipForwardToNextSongEvent: (callback: (e: any) => void) =>
    ipcRenderer.removeListener('app/player/skipForward', callback),

  // $ AUDIO LIBRARY CONTROLS
  checkForStartUpSongs: (): Promise<AudioPlayerData | undefined> =>
    ipcRenderer.invoke('app/checkForStartUpSongs'),
  addMusicFolder: (sortType?: SongSortTypes): Promise<SongData[]> =>
    ipcRenderer.invoke('app/addMusicFolder', sortType),
  // addSongFromPath: (songPath:string): Promise<SongData[]> =>
  //   ipcRenderer.invoke('app/addSongFromPath', songPath),
  getSong: (
    songId: string,
    updateListeningRate = true
  ): Promise<AudioPlayerData> =>
    ipcRenderer.invoke('app/getSong', songId, updateListeningRate),
  getAllSongs: (
    sortType?: SongSortTypes,
    pageNo?: number,
    maxResultsPerPage?: number
  ): Promise<GetAllSongsResult> =>
    ipcRenderer.invoke('app/getAllSongs', sortType, pageNo, maxResultsPerPage),
  getSongInfo: (
    songIds: string[],
    sortType?: SongSortTypes,
    limit?: number
  ): Promise<SongData[] | undefined> =>
    ipcRenderer.invoke('app/getSongInfo', songIds, sortType, limit),
  getSongListeningData: (songIds: string[]): Promise<SongListeningData[]> =>
    ipcRenderer.invoke('app/getSongListeningData', songIds),
  updateSongListeningData: (
    songId: string,
    dataType: ListeningDataTypes,
    dataUpdateType: ListeningDataUpdateTypes
  ): Promise<void> =>
    ipcRenderer.invoke(
      'app/updateSongListeningData',
      songId,
      dataType,
      dataUpdateType
    ),
  resyncSongsLibrary: (): Promise<true> =>
    ipcRenderer.invoke('app/resyncSongsLibrary'),

  removeAMusicFolder: (absolutePath: string): Promise<void> =>
    ipcRenderer.invoke('app/removeAMusicFolder', absolutePath),
  restoreBlacklistedSong: (absolutePath: string): Promise<void> =>
    ipcRenderer.invoke('app/restoreBlacklistedSong', absolutePath),
  removeSongsFromLibrary: (songIds: string[]): PromiseFunctionReturn =>
    ipcRenderer.invoke('app/removeSongsFromLibrary', songIds),
  deleteSongFromSystem: (
    absoluteFilePath: string,
    isPermanentDelete: boolean
  ): PromiseFunctionReturn =>
    ipcRenderer.invoke(
      'app/deleteSongFromSystem',
      absoluteFilePath,
      isPermanentDelete
    ),

  // $ APP PLAYER UNKNOWN SONGS FETCHING APIS
  playSongFromUnknownSource: (
    callback: (_: unknown, audioPlayerData: AudioPlayerData) => void
  ) => ipcRenderer.on('app/playSongFromUnknownSource', callback),
  getSongFromUnknownSource: (songPath: string): Promise<AudioPlayerData> =>
    ipcRenderer.invoke('app/getSongFromUnknownSource', songPath),

  // $ QUIT EVENT HANDLING
  beforeQuitEvent: (callback: (e: any) => void) =>
    ipcRenderer.on('app/beforeQuitEvent', callback),
  removeBeforeQuitEventListener: (callback: (...args: any[]) => void) =>
    ipcRenderer.removeListener('app/beforeQuitEvent', callback),

  // $ APP WINDOW BLUR AND FOCUS EVENTS
  onWindowFocus: (callback: (e: any) => void) =>
    ipcRenderer.on('app/focused', callback),
  onWindowBlur: (callback: (e: any) => void) =>
    ipcRenderer.on('app/blurred', callback),

  // $ APP FULL-SCREEN EVENTS
  onEnterFullscreen: (callback: (e: any) => void) =>
    ipcRenderer.on('app/enteredFullscreen', callback),
  onLeaveFullscreen: (callback: (e: any) => void) =>
    ipcRenderer.on('app/leftFullscreen', callback),

  // $ APP SEARCH
  search: (
    filter: SearchFilters,
    value: string,
    updateSearchHistory?: boolean
  ): Promise<SearchResult> =>
    ipcRenderer.invoke('app/search', filter, value, updateSearchHistory),
  clearSearchHistory: (searchText?: string[]): Promise<boolean> =>
    ipcRenderer.invoke('app/clearSearchHistory', searchText),

  // $ SONG LYRICS
  getSongLyrics: (
    songTitle: string,
    songArtists?: string[],
    songId?: string,
    lyricsType?: LyricsRequestTypes,
    forceDownload = false
  ): Promise<SongLyrics | undefined> =>
    ipcRenderer.invoke(
      'app/getSongLyrics',
      songTitle,
      songArtists,
      songId,
      lyricsType,
      forceDownload
    ),

  saveLyricsToSong: (songId: string, lyrics: SongLyrics) =>
    ipcRenderer.invoke('app/saveLyricsToSong', songId, lyrics),

  // $ APP MESSAGES
  getMessageFromMain: (
    callback: (
      event: unknown,
      message: string,
      messageCode?: MessageCodes,
      data?: Record<string, unknown>
    ) => void
  ) => ipcRenderer.on('app/sendMessageToRendererEvent', callback),
  removeMessageToRendererEventListener: (callback: (...args: any[]) => void) =>
    ipcRenderer.removeListener('app/sendMessageToRendererEvent', callback),

  // $ APP DATA UPDATE EVENTS
  dataUpdateEvent: (
    callback: (e: unknown, dataEvents: DataUpdateEvent[]) => void
  ) => ipcRenderer.on('app/dataUpdateEvent', callback),
  removeDataUpdateEventListeners: () =>
    ipcRenderer.removeAllListeners('app/dataUpdateEvent'),

  // $ APP GLOBAL EVENT LISTENER CONTROLS
  removeIpcEventListener: (
    channel: IpcChannels,
    callback: (...args: any[]) => void
  ) => ipcRenderer.removeListener(channel, callback),

  // $  UPDATE SONG DATA
  updateSongId3Tags: (
    songId: string,
    tags: SongTags,
    sendUpdatedData: boolean
  ): Promise<UpdateSongDataResult> =>
    ipcRenderer.invoke('app/updateSongId3Tags', songId, tags, sendUpdatedData),
  getSongId3Tags: (songPath: string): Promise<SongTags> =>
    ipcRenderer.invoke('app/getSongId3Tags', songPath),
  getImgFileLocation: (): Promise<string> =>
    ipcRenderer.invoke('app/getImgFileLocation'),
  revealSongInFileExplorer: (songId: string): void =>
    ipcRenderer.send('revealSongInFileExplorer', songId),

  // $ FETCH SONG DATA FROM INTERNET
  searchSongMetadataResultsInInternet: (
    songTitle: string,
    songArtists: string[]
  ): Promise<SongMetadataResultFromInternet[]> =>
    ipcRenderer.invoke(
      'app/searchSongMetadataResultsInInternet',
      songTitle,
      songArtists
    ),
  fetchSongMetadataFromInternet: (
    songTitle: string,
    songArtists: string[]
  ): Promise<SongMetadataResultFromInternet[]> =>
    ipcRenderer.invoke(
      'app/fetchSongMetadataFromInternet',
      songTitle,
      songArtists
    ),
  fetchSongInfoFromNet: (
    songTitle: string,
    songArtists: string[]
  ): Promise<LastFMTrackInfoApi | undefined> =>
    ipcRenderer.invoke('app/fetchSongInfoFromNet', songTitle, songArtists),

  // $ APP USER DATA
  getUserData: (): Promise<UserData> => ipcRenderer.invoke('app/getUserData'),
  saveUserData: (dataType: UserDataTypes, data: any) =>
    ipcRenderer.invoke('app/saveUserData', dataType, data),

  // $ APP USER DATA
  getFolderData: (folderPaths: string[]): Promise<MusicFolder[]> =>
    ipcRenderer.invoke('app/getFolderData', folderPaths),

  // $ ARTISTS DATA
  getArtistData: (
    artistIdsOrNames?: string[],
    sortType?: ArtistSortTypes
  ): Promise<Artist[]> =>
    ipcRenderer.invoke('app/getArtistData', artistIdsOrNames, sortType),
  toggleLikeArtist: (
    artistId: string,
    likeArtist: boolean
  ): Promise<ToggleLikeSongReturnValue | undefined> =>
    ipcRenderer.invoke('app/toggleLikeArtist', artistId, likeArtist),
  getArtistArtworks: (
    artistId: string
  ): Promise<ArtistInfoFromNet | undefined> =>
    ipcRenderer.invoke('app/getArtistArtworks', artistId),

  // $ GENRES DATA
  getGenresData: (
    genreIds?: string[],
    sortType?: GenreSortTypes
  ): Promise<Genre[]> =>
    ipcRenderer.invoke('app/getGenresData', genreIds, sortType),

  // $ ALBUMS DATA
  getAlbumData: (
    albumIds?: string[],
    sortType?: AlbumSortTypes
  ): Promise<Album[]> =>
    ipcRenderer.invoke('app/getAlbumData', albumIds, sortType),

  // $ PLAYLIST DATA AND CONTROLS
  getPlaylistData: (
    playlistIds?: string[],
    sortType?: PlaylistSortTypes,
    onlyMutablePlaylists?: boolean
  ): Promise<Playlist[]> =>
    ipcRenderer.invoke(
      'app/getPlaylistData',
      playlistIds,
      sortType,
      onlyMutablePlaylists
    ),
  addNewPlaylist: (
    playlistName: string,
    songIds?: string[],
    artworkPath?: string
  ): Promise<{ success: boolean; message?: string; playlist?: Playlist }> =>
    ipcRenderer.invoke(
      'app/addNewPlaylist',
      playlistName,
      songIds,
      artworkPath
    ),
  addSongToPlaylist: (
    playlistId: string,
    songId: string
  ): PromiseFunctionReturn =>
    ipcRenderer.invoke('app/addSongToPlaylist', playlistId, songId),

  // $ APP PLAYLISTS DATA UPDATE
  removeSongFromPlaylist: (
    playlistId: string,
    songId: string
  ): PromiseFunctionReturn =>
    ipcRenderer.invoke('app/removeSongFromPlaylist', playlistId, songId),
  clearSongHistory: (): PromiseFunctionReturn =>
    ipcRenderer.invoke('app/clearSongHistory'),
  removePlaylist: (playlistId: string): PromiseFunctionReturn =>
    ipcRenderer.invoke('app/removePlaylist', playlistId),

  // $ APP PAGES STATE
  savePageSortingState: (pageType: PageSortTypes, state: unknown): void =>
    ipcRenderer.send('app/savePageSortState', pageType, state),

  // $ APP LOGS
  sendLogs: (
    logs: string,
    forceWindowRestart = false,
    forceMainRestart = false
  ): Promise<undefined> =>
    ipcRenderer.invoke(
      'app/getRendererLogs',
      logs,
      forceWindowRestart,
      forceMainRestart
    ),

  // $ APP MINI PLAYER CONTROLS
  toggleMiniPlayer: (isMiniPlayerActive: boolean): Promise<void> =>
    ipcRenderer.invoke('app/toggleMiniPlayer', isMiniPlayerActive),
  toggleMiniPlayerAlwaysOnTop: (
    isMiniPlayerAlwaysOnTop: boolean
  ): Promise<void> =>
    ipcRenderer.invoke(
      'app/toggleMiniPlayerAlwaysOnTop',
      isMiniPlayerAlwaysOnTop
    ),

  // $ APP SETTINGS HELPER FUNCTIONS
  openInBrowser: (url: string): void =>
    ipcRenderer.send('app/openInBrowser', url),
  toggleAutoLaunch: (autoLaunchState: boolean): Promise<void> =>
    ipcRenderer.invoke('app/toggleAutoLaunch', autoLaunchState),
  openLogFile: (): void => ipcRenderer.send('app/openLogFile'),
  openDevtools: () => ipcRenderer.send('app/openDevTools'),
  networkStatusChange: (isConnected: boolean): void =>
    ipcRenderer.send('app/networkStatusChange', isConnected),

  // $ APP RESTART OR RESET
  restartRenderer: (reason: string): void =>
    ipcRenderer.send('app/restartRenderer', reason),
  restartApp: (reason: string): void =>
    ipcRenderer.send('app/restartApp', reason),
  resetApp: (): void => {
    ipcRenderer.removeAllListeners('app/beforeQuitEvent');
    ipcRenderer.send('app/resetApp');
  },
};

contextBridge.exposeInMainWorld('api', api);
