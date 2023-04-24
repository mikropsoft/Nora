/* eslint-disable promise/no-nesting */
/* eslint-disable no-console */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable consistent-return */
/* eslint-disable no-else-return */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/self-closing-comp */
/* eslint-disable import/prefer-default-export */
import React from 'react';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import useResizeObserver from 'renderer/hooks/useResizeObserver';

import ErrorPrompt from '../ErrorPrompt';
import MainContainer from '../MainContainer';
import Button from '../Button';
import Img from '../Img';
import RecentlyAddedSongs from './RecentlyAddedSongs';
import RecentlyPlayedSongs from './RecentlyPlayedSongs';
import RecentlyPlayedArtists from './RecentlyPlayedArtists';
import MostLovedSongs from './MostLovedSongs';
import MostLovedArtists from './MostLovedArtists';
import AddMusicFoldersPrompt from '../MusicFoldersPage/AddMusicFoldersPrompt';

import NoSongsImage from '../../../../assets/images/svg/Empty Inbox _Monochromatic.svg';
import DataFetchingImage from '../../../../assets/images/svg/Umbrella_Monochromatic.svg';

interface HomePageReducer {
  latestSongs: (AudioInfo | null)[];
  recentlyPlayedSongs: SongData[];
  recentSongArtists: Artist[];
  mostLovedSongs: AudioInfo[];
  mostLovedArtists: Artist[];
}

type HomePageReducerActionTypes =
  | 'SONGS_DATA'
  | 'RECENTLY_PLAYED_SONGS_DATA'
  | 'RECENT_SONGS_ARTISTS'
  | 'MOST_LOVED_ARTISTS'
  | 'MOST_LOVED_SONGS';

const reducer = (
  state: HomePageReducer,
  action: { type: HomePageReducerActionTypes; data?: any }
): HomePageReducer => {
  switch (action.type) {
    case 'SONGS_DATA':
      return {
        ...state,
        latestSongs: action.data,
      };
    case 'RECENTLY_PLAYED_SONGS_DATA':
      return {
        ...state,
        recentlyPlayedSongs: action.data,
      };
    case 'RECENT_SONGS_ARTISTS':
      return {
        ...state,
        recentSongArtists: action.data,
      };
    case 'MOST_LOVED_SONGS':
      return {
        ...state,
        mostLovedSongs: action.data,
      };
    case 'MOST_LOVED_ARTISTS':
      return {
        ...state,
        mostLovedArtists: action.data,
      };
    default:
      return state;
  }
};

const HomePage = () => {
  const { updateContextMenuData, changePromptMenuData, addNewNotifications } =
    React.useContext(AppUpdateContext);

  const [content, dispatch] = React.useReducer(reducer, {
    latestSongs: [],
    recentlyPlayedSongs: [],
    recentSongArtists: [],
    mostLovedSongs: [],
    mostLovedArtists: [],
  });

  const SONG_CARD_WIDTH = 320;
  const ARTIST_WIDTH = 175;

  const recentlyAddedSongsContainerRef = React.useRef<HTMLDivElement>(null);
  const recentlyAddedSongsContainerDiamensions = useResizeObserver(
    recentlyAddedSongsContainerRef
  );
  const {
    noOfRecentlyAddedSongCards,
    noOfRecentandLovedArtists,
    noOfRecentandLovedSongCards,
  } = React.useMemo(() => {
    const { width } = recentlyAddedSongsContainerDiamensions;

    return {
      noOfRecentlyAddedSongCards: Math.floor(width / SONG_CARD_WIDTH) * 2 || 5,
      noOfRecentandLovedSongCards: Math.floor(width / SONG_CARD_WIDTH) || 3,
      noOfRecentandLovedArtists: Math.floor(width / ARTIST_WIDTH) || 5,
    };
  }, [recentlyAddedSongsContainerDiamensions]);

  const fetchLatestSongs = React.useCallback(() => {
    window.api
      .getAllSongs('dateAddedAscending', 1, noOfRecentlyAddedSongCards)
      .then((audioData) => {
        if (!audioData || audioData.data.length === 0)
          return dispatch({ type: 'SONGS_DATA', data: [null] });
        else {
          dispatch({
            type: 'SONGS_DATA',
            data: audioData.data,
          });
          return undefined;
        }
      });
  }, [noOfRecentlyAddedSongCards]);

  const fetchRecentlyPlayedSongs = React.useCallback(async () => {
    const recentSongs = await window.api
      .getPlaylistData(['History'])
      .catch((err) => console.error(err));
    if (
      Array.isArray(recentSongs) &&
      recentSongs.length > 0 &&
      Array.isArray(recentSongs[0].songs) &&
      recentSongs[0].songs.length > 0
    )
      window.api
        .getSongInfo(
          recentSongs[0].songs,
          undefined,
          noOfRecentandLovedSongCards + 5,
          true
        )
        .then((res) => {
          if (res)
            dispatch({
              type: 'RECENTLY_PLAYED_SONGS_DATA',
              data: res,
            });
        })
        .catch((err) => console.error(err));
  }, [noOfRecentandLovedSongCards]);

  const fetchRecentArtistsData = React.useCallback(() => {
    if (content.recentlyPlayedSongs.length > 0) {
      const artistIds = [
        ...new Set(
          content.recentlyPlayedSongs
            .map((song) =>
              song.artists ? song.artists.map((artist) => artist.artistId) : []
            )
            .flat()
        ),
      ];

      if (artistIds.length > 0)
        window.api
          .getArtistData(artistIds, undefined, noOfRecentandLovedArtists)
          .then((res) => {
            if (res && Array.isArray(res))
              dispatch({
                type: 'RECENT_SONGS_ARTISTS',
                data: res,
              });
          });
    }
  }, [content.recentlyPlayedSongs, noOfRecentandLovedArtists]);

  // ? Most loved songs are fetched after the user have made at least one favorite song from the library.
  const fetchMostLovedSongs = React.useCallback(() => {
    window.api
      .getPlaylistData(['Favorites'])
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          return window.api.getSongInfo(
            res[0].songs,
            'allTimeMostListened',
            noOfRecentandLovedSongCards + 5,
            true
          );
        }
        return undefined;
      })
      .then((lovedSongs) => {
        if (Array.isArray(lovedSongs) && lovedSongs.length > 0)
          dispatch({ type: 'MOST_LOVED_SONGS', data: lovedSongs });
      })
      .catch((err) => console.error(err));
  }, [noOfRecentandLovedSongCards]);

  const fetchMostLovedArtists = React.useCallback(() => {
    if (content.mostLovedSongs.length > 0) {
      const artistIds = [
        ...new Set(
          content.mostLovedSongs
            .map((song) =>
              song.artists ? song.artists.map((artist) => artist.artistId) : []
            )
            .flat()
        ),
      ];
      window.api
        .getArtistData(artistIds, undefined, noOfRecentandLovedArtists)
        .then((res) => {
          if (res && Array.isArray(res))
            dispatch({
              type: 'MOST_LOVED_ARTISTS',
              data: res,
            });
        });
    }
  }, [content.mostLovedSongs, noOfRecentandLovedArtists]);

  React.useEffect(() => {
    fetchLatestSongs();
    fetchRecentlyPlayedSongs();
    fetchMostLovedSongs();
  }, [fetchLatestSongs, fetchMostLovedSongs, fetchRecentlyPlayedSongs]);

  React.useEffect(() => {
    const manageDataUpdatesInHomePage = (e: Event) => {
      if ('detail' in e) {
        const dataEvents = (e as DetailAvailableEvent<DataUpdateEvent[]>)
          .detail;
        for (let i = 0; i < dataEvents.length; i += 1) {
          const event = dataEvents[i];
          if (event.dataType === 'playlists/history')
            fetchRecentlyPlayedSongs();
          else if (
            event.dataType === 'songs/deletedSong' ||
            event.dataType === 'songs/newSong' ||
            event.dataType === 'songs/palette' ||
            event.dataType === 'blacklist/songBlacklist' ||
            (event.dataType === 'songs/likes' && event.eventData.length > 1)
          ) {
            fetchLatestSongs();
            fetchRecentlyPlayedSongs();
            fetchMostLovedSongs();
          } else if (
            event.dataType === 'artists/artworks' ||
            event.dataType === 'artists/deletedArtist' ||
            event.dataType === 'artists/updatedArtist' ||
            event.dataType === 'artists/newArtist' ||
            (event.dataType === 'artists/likes' && event.eventData.length > 1)
          ) {
            fetchRecentArtistsData();
            fetchMostLovedArtists();
          } else if (
            event.dataType === 'songs/likes' ||
            event.dataType === 'songs/listeningData/listens'
          )
            fetchMostLovedSongs();
        }
      }
    };
    document.addEventListener('app/dataUpdates', manageDataUpdatesInHomePage);
    return () => {
      document.removeEventListener(
        'app/dataUpdates',
        manageDataUpdatesInHomePage
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => fetchRecentArtistsData(), [fetchRecentArtistsData]);
  React.useEffect(() => fetchMostLovedArtists(), [fetchMostLovedArtists]);

  const addNewSongs = () => {
    changePromptMenuData(
      true,
      <AddMusicFoldersPrompt
        onSuccess={(songs) => {
          const relevantSongsData: AudioInfo[] = songs.map((song) => {
            return {
              title: song.title,
              songId: song.songId,
              artists: song.artists,
              duration: song.duration,
              palette: song.palette,
              path: song.path,
              artworkPaths: song.artworkPaths,
              addedDate: song.addedDate,
              isAFavorite: song.isAFavorite,
              isBlacklisted: song.isBlacklisted,
            };
          });
          dispatch({ type: 'SONGS_DATA', data: relevantSongsData });
        }}
        onFailure={() => dispatch({ type: 'SONGS_DATA', data: [null] })}
      />
    );
  };

  const homePageContextMenus: ContextMenuItem[] = React.useMemo(
    () =>
      window.api.isInDevelopment
        ? [
            {
              label: 'Alert Error',
              iconName: 'report',
              handlerFunction: () =>
                changePromptMenuData(
                  true,
                  <ErrorPrompt
                    reason="JUST_FOR_FUN"
                    message={
                      <>
                        This prompt is used to develop the prompt menu. Instead
                        of clicking doing something that will open a prompt and
                        also result in consequences, this approach is much
                        better because nothing will change when opening this
                        prompt.
                      </>
                    }
                    showSendFeedbackBtn
                  />,
                  'error-alert-prompt'
                ),
            },
            {
              label: 'Show Notification',
              iconName: 'notifications_active',
              handlerFunction: () =>
                addNewNotifications([
                  {
                    id: 'testNotification',
                    delay: 5 * 60 * 1000,
                    content: <>This is a notification with a very long text.</>,
                    icon: (
                      <span className="material-icons-round icon">
                        notifications_active
                      </span>
                    ),
                    type: 'WITH_PROGRESS_BAR',
                  },
                ]),
            },
          ]
        : [],
    [changePromptMenuData, addNewNotifications]
  );

  return (
    <MainContainer
      className="home-page relative !h-full overflow-y-auto !pl-0"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (homePageContextMenus.length > 0)
          updateContextMenuData(true, homePageContextMenus, e.pageX, e.pageY);
      }}
      ref={recentlyAddedSongsContainerRef}
    >
      <>
        {recentlyAddedSongsContainerRef.current && (
          <>
            {content.latestSongs[0] !== null && (
              <RecentlyAddedSongs
                latestSongs={content.latestSongs as AudioInfo[]}
                noOfVisibleSongs={noOfRecentlyAddedSongCards}
              />
            )}
            <RecentlyPlayedSongs
              recentlyPlayedSongs={content.recentlyPlayedSongs.slice(
                0,
                noOfRecentandLovedSongCards
              )}
              noOfVisibleSongs={noOfRecentandLovedSongCards}
            />
            <RecentlyPlayedArtists
              recentlyPlayedSongArtists={content.recentSongArtists}
              noOfVisibleArtists={noOfRecentandLovedArtists}
            />
            <MostLovedSongs
              mostLovedSongs={content.mostLovedSongs.slice(
                0,
                noOfRecentandLovedSongCards
              )}
              noOfVisibleSongs={noOfRecentandLovedSongCards}
            />
            <MostLovedArtists
              mostLovedArtists={content.mostLovedArtists}
              noOfVisibleArtists={noOfRecentandLovedArtists}
            />
          </>
        )}

        {content.latestSongs[0] === null && (
          <div className="no-songs-container appear-from-bottom flex h-full w-full flex-col items-center justify-center text-center text-xl text-font-color-black dark:text-font-color-white">
            <Img
              src={NoSongsImage}
              className="mb-8 w-60"
              alt="No songs available."
            />
            <div>There&apos;s nothing here. Do you know where are they?</div>
            <Button
              label="Add Folder"
              className="mt-4 w-40 !bg-background-color-3 px-8 text-lg !text-font-color-black hover:border-background-color-3 dark:!bg-dark-background-color-3 dark:!text-font-color-black dark:hover:border-background-color-3"
              clickHandler={addNewSongs}
            />
          </div>
        )}
        {content.recentlyPlayedSongs.length === 0 &&
          content.latestSongs.length === 0 && (
            <div className="no-songs-container flex h-full w-full flex-col items-center justify-center text-center text-xl text-font-color-dimmed dark:text-dark-font-color-dimmed">
              <Img
                src={DataFetchingImage}
                className="mb-8 w-48"
                alt="Stay calm"
              />
              <span>Just hold on. We are readying everything for you...</span>
            </div>
          )}
        {content.latestSongs.length > 0 &&
          content.latestSongs[0] !== null &&
          content.recentlyPlayedSongs.length === 0 && (
            <div className="no-songs-container flex h-full w-full flex-col items-center justify-center text-center text-lg font-normal text-black/60 dark:text-white/60">
              <span className="material-icons-round-outlined mb-1 text-4xl">
                headphones
              </span>{' '}
              <p className="text-sm">
                Listen to some songs to show additional metrics.
              </p>
            </div>
          )}
      </>
    </MainContainer>
  );
};

export default HomePage;