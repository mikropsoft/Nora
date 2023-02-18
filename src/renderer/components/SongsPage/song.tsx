/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { ForwardedRef } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import { AppContext } from 'renderer/contexts/AppContext';
import Img from '../Img';
import MultipleSelectionCheckbox from '../MultipleSelectionCheckbox';
import AddSongsToPlaylists from './AddSongsToPlaylists';
import DeleteSongFromSystemConfrimPrompt from './DeleteSongFromSystemConfrimPrompt';
import RemoveSongFromLibraryConfirmPrompt from './RemoveSongFromLibraryConfirmPrompt';
import SongArtist from './SongArtist';
import DefaultSongCover from '../../../../assets/images/png/song_cover_default.png';

interface SongProp {
  songId: string;
  artworkPaths: ArtworkPaths;
  title: string;
  artists?: { name: string; artistId: string }[];
  duration: number;
  year?: number;
  path: string;
  additionalContextMenuItems?: ContextMenuItem[];
  index: number;
  isIndexingSongs: boolean;
  isAFavorite: boolean;
  className?: string;
  style?: React.CSSProperties;
  isDraggable?: boolean;
  provided?: DraggableProvided;
}

const Song = React.forwardRef(
  (props: SongProp, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      currentSongData,
      queue,
      isCurrentSongPlaying,
      userData,
      bodyBackgroundImage,
      isMultipleSelectionEnabled,
      multipleSelectionsData,
      currentlyActivePage,
    } = React.useContext(AppContext);
    const {
      playSong,
      updateContextMenuData,
      changeCurrentActivePage,
      updateQueueData,
      changePromptMenuData,
      addNewNotifications,
      toggleIsFavorite,
      toggleMultipleSelections,
      updateMultipleSelections,
    } = React.useContext(AppUpdateContext);
    const {
      index,
      songId,
      duration,
      artworkPaths,
      isIndexingSongs,
      path,
      title,
      additionalContextMenuItems,
      artists,
      style,
      year,
    } = props;
    const { provided = {} as any } = props;

    const [isAFavorite, setIsAFavorite] = React.useState(props.isAFavorite);
    const [isSongPlaying, setIsSongPlaying] = React.useState(
      currentSongData
        ? currentSongData.songId === songId && isCurrentSongPlaying
        : false
    );

    React.useEffect(() => {
      setIsSongPlaying(() => {
        return currentSongData?.songId === songId && isCurrentSongPlaying;
      });
      setIsAFavorite((prevState) => {
        if (currentSongData?.songId === songId)
          return currentSongData.isAFavorite;
        return prevState;
      });
    }, [
      currentSongData.songId,
      currentSongData.isAFavorite,
      isCurrentSongPlaying,
      songId,
    ]);

    const handlePlayBtnClick = React.useCallback(() => {
      playSong(songId);
    }, [playSong, songId]);

    const { minutes, seconds } = React.useMemo(() => {
      const addZero = (num: number) => {
        if (num < 10) return `0${num}`;
        return num.toString();
      };

      const min = Math.floor((duration || 0) / 60);
      const sec = Math.floor((duration || 0) % 60);

      return {
        minutes: Number.isNaN(min) ? undefined : addZero(min),
        seconds: Number.isNaN(sec) ? undefined : addZero(sec),
      };
    }, [duration]);

    const isAMultipleSelection = React.useMemo(() => {
      if (!multipleSelectionsData.isEnabled) return false;
      if (multipleSelectionsData.selectionType !== 'songs') return false;
      if (multipleSelectionsData.multipleSelections.length <= 0) return false;
      if (
        multipleSelectionsData.multipleSelections.some(
          (selectionId) => selectionId === songId
        )
      )
        return true;
      return false;
    }, [multipleSelectionsData, songId]);

    const songArtists = React.useMemo(
      () =>
        Array.isArray(artists) ? (
          artists
            .map((artist, i) =>
              (artists?.length ?? 1) - 1 === i ? (
                <SongArtist
                  key={i}
                  artistId={artist.artistId}
                  name={artist.name}
                  className={`${
                    (currentSongData.songId === songId ||
                      isAMultipleSelection) &&
                    'dark:!text-font-color-black'
                  }`}
                />
              ) : (
                [
                  <SongArtist
                    key={i}
                    artistId={artist.artistId}
                    name={artist.name}
                    className={`${
                      (currentSongData.songId === songId ||
                        isAMultipleSelection) &&
                      'dark:!text-font-color-black'
                    } `}
                  />,
                  <span className="mr-1">,</span>,
                ]
              )
            )
            .flat()
        ) : (
          <span>Unknown Artist</span>
        ),
      [artists, currentSongData.songId, isAMultipleSelection, songId]
    );

    const goToSongInfoPage = React.useCallback(() => {
      if (
        currentlyActivePage.pageTitle !== 'SongInfo' &&
        currentlyActivePage?.data?.songId !== songId
      )
        changeCurrentActivePage('SongInfo', {
          songId,
        });
    }, [
      changeCurrentActivePage,
      currentlyActivePage?.data?.songId,
      currentlyActivePage.pageTitle,
      songId,
    ]);

    const contextMenuItems: ContextMenuItem[] = React.useMemo(() => {
      if (
        multipleSelectionsData.selectionType === 'songs' &&
        multipleSelectionsData.multipleSelections.length !== 1 &&
        isAMultipleSelection
      ) {
        const { multipleSelections: songIds } = multipleSelectionsData;
        return [
          {
            label: 'Add to queue',
            iconName: 'queue',
            handlerFunction: () => {
              updateQueueData(undefined, [...queue.queue, ...songIds], false);
              addNewNotifications([
                {
                  id: `${songIds.length}AddedToQueueFromMultiSelection`,
                  delay: 5000,
                  content: (
                    <span>Added {songIds.length} songs to the queue.</span>
                  ),
                },
              ]);
            },
          },
          {
            label: 'Add All to Play Next',
            iconName: 'shortcut',
            handlerFunction: () => {
              const newQueue = queue.queue.filter((id) =>
                songIds.some((x) => id !== x)
              );
              newQueue.splice(
                queue.queue.indexOf(currentSongData.songId) + 1 || 0,
                0,
                ...songIds
              );
              updateQueueData(undefined, newQueue);
              addNewNotifications([
                {
                  id: `${songIds.join(';')}PlayAllNext`,
                  delay: 5000,
                  content: (
                    <span>{songIds.length} songs will be played next.</span>
                  ),
                  icon: <span className="material-icons-round">shortcut</span>,
                },
              ]);
              toggleMultipleSelections(false);
            },
          },
          // {
          //   label: `Toggle like/dislike songs`,
          //   iconName: `favorite`,
          //   iconClassName: 'material-icons-round-outlined mr-4 text-xl',
          //   handlerFunction: () => {
          //     window.api
          //       .toggleLikeSongs(songIds)
          //       .then((res) => {
          //         if (res && res.likes + res.dislikes > 0) {
          //           for (let i = 0; i < songIds.length; i += 1) {
          //             const songId = songIds[i];
          //             if (currentSongData.songId === songId)
          //               toggleIsFavorite(!currentSongData.isAFavorite);
          //             if (songId === songId)
          //               setIsAFavorite((prevState) => !prevState);
          //           }
          //         }
          //         return undefined;
          //       })
          //       .catch((err) => console.error(err));
          //     toggleMultipleSelections(false);
          //   },
          // },
          {
            label: 'Remove from Library',
            iconName: 'block',
            handlerFunction: () => {
              if (userData?.preferences.doNotShowRemoveSongFromLibraryConfirm)
                return window.api.removeSongsFromLibrary(songIds).then(
                  (res) =>
                    res.success &&
                    addNewNotifications([
                      {
                        id: `${songIds.join(';')}Blacklisted`,
                        delay: 5000,
                        content: (
                          <span>
                            {songIds.length} songs blacklisted and removed from
                            the library.
                          </span>
                        ),
                        icon: (
                          <span className="material-icons-round">
                            delete_outline
                          </span>
                        ),
                      },
                    ])
                );
              changePromptMenuData(
                true,
                <RemoveSongFromLibraryConfirmPrompt songIds={songIds} />
              );
              return toggleMultipleSelections(false);
            },
          },
          {
            label: 'Unselect',
            iconName: 'checklist',
            handlerFunction: () =>
              updateMultipleSelections(
                songId,
                'songs',
                isAMultipleSelection ? 'remove' : 'add'
              ),
          },
        ];
      }
      const items: ContextMenuItem[] = [
        {
          label: 'Play',
          handlerFunction: handlePlayBtnClick,
          iconName: 'play_arrow',
        },
        {
          label: 'Play Next',
          iconName: 'shortcut',
          handlerFunction: () => {
            // const currentSongIndex = queue.currentSongIndex
            //   ? queue.currentSongIndex === queue.queue.length - 1
            //     ? queue.currentSongIndex - 1
            //     : queue.currentSongIndex
            //   : undefined;

            // const newQueue = queue.queue;
            // newQueue.splice(
            //   queue.queue.indexOf(currentSongData.songId) + 1 || 0,
            //   0,
            //   songId
            // );
            // updateQueueData(currentSongIndex, newQueue);

            const newQueue = queue.queue.filter((id) => id !== props.songId);
            newQueue.splice(
              queue.queue.indexOf(currentSongData.songId) + 1 || 0,
              0,
              props.songId
            );
            updateQueueData(undefined, newQueue);
            addNewNotifications([
              {
                id: `${title}PlayNext`,
                delay: 5000,
                content: <span>&apos;{title}&apos; will be played next.</span>,
                icon: <span className="material-icons-round">shortcut</span>,
              },
            ]);
          },
        },
        {
          label: 'Add to queue',
          iconName: 'queue',
          handlerFunction: () => {
            updateQueueData(undefined, [...queue.queue, songId], false);
            addNewNotifications([
              {
                id: `${title}AddedToQueue`,
                delay: 5000,
                content: <span>Added 1 song to the queue.</span>,
                icon: (
                  <Img
                    src={artworkPaths.optimizedArtworkPath}
                    alt="Song Artwork"
                  />
                ),
              },
            ]);
          },
        },
        {
          label: `${isAFavorite ? 'Unlike' : 'Like'} the song`,
          iconName: `favorite`,
          iconClassName: `${
            isAFavorite
              ? 'material-icons-round mr-4 text-xl'
              : 'material-icons-round-outlined mr-4 text-xl'
          }`,
          handlerFunction: () => {
            window.api
              .toggleLikeSongs([songId], !isAFavorite)
              .then((res) => {
                if (res && res.likes + res.dislikes > 0) {
                  if (currentSongData.songId === songId)
                    toggleIsFavorite(!currentSongData.isAFavorite);
                  return setIsAFavorite((prevData) => !prevData);
                }
                return undefined;
              })
              .catch((err) => console.error(err));
          },
        },
        {
          label: 'Add to a Playlist',
          iconName: 'playlist_add',
          handlerFunction: () =>
            changePromptMenuData(
              true,
              <AddSongsToPlaylists songId={songId} title={title} />
            ),
        },
        {
          label: isMultipleSelectionEnabled ? 'Unselect' : 'Select',
          iconName: 'checklist',
          handlerFunction: () => {
            if (isMultipleSelectionEnabled) {
              return updateMultipleSelections(
                songId,
                'songs',
                isAMultipleSelection ? 'remove' : 'add'
              );
            }
            return toggleMultipleSelections(
              !isMultipleSelectionEnabled,
              'songs',
              [songId]
            );
          },
        },
        {
          label: 'Hr',
          isContextMenuItemSeperator: true,
          handlerFunction: () => true,
        },
        {
          label: 'Reveal in File Explorer',
          class: 'reveal-file-explorer',
          iconName: 'folder_open',
          handlerFunction: () => window.api.revealSongInFileExplorer(songId),
        },
        {
          label: 'Info',
          class: 'info',
          iconName: 'info',
          handlerFunction: goToSongInfoPage,
        },
        {
          label: 'Edit song tags',
          class: 'edit',
          iconName: 'edit',
          handlerFunction: () =>
            changeCurrentActivePage('SongTagsEditor', {
              songId,
              songArtworkPath: artworkPaths.artworkPath,
              songPath: path,
            }),
        },
        {
          label: 'Hr',
          isContextMenuItemSeperator: true,
          handlerFunction: () => true,
        },
        {
          label: 'Remove from Library',
          iconName: 'block',
          handlerFunction: () =>
            userData?.preferences.doNotShowRemoveSongFromLibraryConfirm
              ? window.api.removeSongsFromLibrary([songId]).then(
                  (res) =>
                    res.success &&
                    addNewNotifications([
                      {
                        id: `${title}Blacklisted`,
                        delay: 5000,
                        content: (
                          <span>
                            &apos;{title}&apos; blacklisted and removed from the
                            library.
                          </span>
                        ),
                        icon: (
                          <span className="material-icons-round">
                            delete_outline
                          </span>
                        ),
                      },
                    ])
                )
              : changePromptMenuData(
                  true,
                  <RemoveSongFromLibraryConfirmPrompt
                    title={title}
                    songIds={[songId]}
                  />
                ),
        },
        {
          label: 'Delete from System',
          iconName: 'delete',
          handlerFunction: () =>
            changePromptMenuData(
              true,
              <DeleteSongFromSystemConfrimPrompt
                songPath={path}
                title={title}
                songId={songId}
              />
            ),
        },
      ];

      if (additionalContextMenuItems !== undefined)
        items.unshift(...additionalContextMenuItems);

      return items;
    }, [
      multipleSelectionsData,
      isAMultipleSelection,
      handlePlayBtnClick,
      isAFavorite,
      isMultipleSelectionEnabled,
      goToSongInfoPage,
      additionalContextMenuItems,
      updateQueueData,
      queue.queue,
      addNewNotifications,
      currentSongData.songId,
      currentSongData.isAFavorite,
      toggleMultipleSelections,
      userData?.preferences.doNotShowRemoveSongFromLibraryConfirm,
      changePromptMenuData,
      updateMultipleSelections,
      songId,
      props.songId,
      title,
      artworkPaths.optimizedArtworkPath,
      artworkPaths.artworkPath,
      toggleIsFavorite,
      changeCurrentActivePage,
      path,
    ]);

    const contextMenuItemData =
      isMultipleSelectionEnabled &&
      multipleSelectionsData.selectionType === 'songs' &&
      isAMultipleSelection
        ? {
            title: `${multipleSelectionsData.multipleSelections.length} selected songs`,
            artworkPath: DefaultSongCover,
          }
        : undefined;

    return (
      <div
        style={style}
        data-index={index}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...provided.draggableProps}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...provided.dragHandleProps}
        // style={{ animationDelay: `${50 * (index + 1)}ms` }}
        className={`appear-from-bottom ${songId} group relative mr-4 mb-2 flex aspect-[2/1] h-[3.25rem] w-[98%] overflow-hidden rounded-lg p-[0.2rem] transition-[background] ease-in-out ${
          currentSongData.songId === songId || isAMultipleSelection
            ? bodyBackgroundImage
              ? `bg-background-color-3/70 text-font-color-black backdrop-blur-md dark:bg-dark-background-color-3/70`
              : 'bg-background-color-3 text-font-color-black dark:bg-dark-background-color-3'
            : bodyBackgroundImage
            ? `bg-background-color-2/70 backdrop-blur-md hover:!bg-background-color-2 dark:bg-dark-background-color-2/70 dark:hover:!bg-dark-background-color-2`
            : `odd:bg-background-color-2/70 hover:!bg-background-color-2 dark:odd:bg-dark-background-color-2/50 dark:hover:!bg-dark-background-color-2 ${
                (index + 1) % 2 === 1
                  ? '!bg-background-color-2/70 dark:!bg-dark-background-color-2/50'
                  : '!bg-background-color-1 dark:!bg-dark-background-color-1'
              }`
        }`}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          updateContextMenuData(
            true,
            contextMenuItems,
            e.pageX,
            e.pageY,
            contextMenuItemData
          );
        }}
        onClick={(e) => {
          if (
            isMultipleSelectionEnabled &&
            multipleSelectionsData.selectionType === 'songs'
          )
            updateMultipleSelections(
              songId,
              'songs',
              isAMultipleSelection ? 'remove' : 'add'
            );
          else if (e.getModifierState('Shift') === true) {
            toggleMultipleSelections(!isMultipleSelectionEnabled, 'songs');
            updateMultipleSelections(
              songId,
              'songs',
              isAMultipleSelection ? 'remove' : 'add'
            );
          }
        }}
        onDoubleClick={handlePlayBtnClick}
        ref={ref}
      >
        <div className="song-cover-and-play-btn-container relative flex h-full w-[12.5%] items-center justify-center">
          {isMultipleSelectionEnabled &&
          multipleSelectionsData.selectionType === 'songs' ? (
            <div className="relative mx-1 flex h-fit items-center rounded-lg bg-background-color-1 p-1 text-font-color-highlight dark:bg-dark-background-color-1 dark:text-dark-background-color-3">
              <MultipleSelectionCheckbox id={songId} selectionType="songs" />
            </div>
          ) : isIndexingSongs ? (
            <div className="relative mx-1 h-fit rounded-2xl bg-background-color-1 px-3 text-font-color-highlight group-even:bg-background-color-2/75 group-hover:bg-background-color-1 dark:bg-dark-background-color-1 dark:text-dark-background-color-3 dark:group-even:bg-dark-background-color-2/50 dark:group-hover:bg-dark-background-color-1">
              {index + 1}
            </div>
          ) : (
            ''
          )}
          <div className="song-cover-container relative ml-2 mr-4 flex h-[90%] flex-row items-center justify-center overflow-hidden rounded-md">
            <div className="play-btn-container absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <span
                className={`material-icons-round icon cursor-pointer text-3xl text-font-color-white text-opacity-0 ${
                  currentSongData.songId === songId && 'text-opacity-100'
                } group-hover:text-opacity-100`}
                onClick={handlePlayBtnClick}
                style={isSongPlaying ? { color: `hsla(0,0%,100%,0.75)` } : {}}
              >
                {isSongPlaying ? 'pause_circle' : 'play_circle'}
              </span>
            </div>
            <Img
              src={artworkPaths.artworkPath}
              loading="lazy"
              alt="Song cover"
              className={`max-h-full object-cover py-[0.1rem] transition-[filter] duration-300 group-hover:brightness-50 ${
                isSongPlaying ? 'brightness-50' : ''
              }`}
            />
          </div>
        </div>
        <div
          className={`song-info-container flex w-[87.5%] flex-row items-center justify-between text-font-color-black dark:text-font-color-white ${
            (currentSongData.songId === songId || isAMultipleSelection) &&
            'dark:!text-font-color-black'
          }`}
        >
          <div
            className="song-title w-2/5 overflow-hidden text-ellipsis whitespace-nowrap pr-4 text-base font-normal transition-none"
            title={title}
          >
            {title}
          </div>
          <div className="song-artists flex w-1/3 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal transition-none">
            {songArtists}
          </div>
          <div className="song-year mr-2 flex w-12 items-center justify-between text-center text-xs transition-none">
            {year ?? '----'}
          </div>
          <div className="song-duration mr-1 flex w-[12.5%] items-center justify-between pr-4 text-center transition-none">
            <span
              className={`${
                isAFavorite
                  ? 'material-icons-round'
                  : 'material-icons-round-outlined'
              } icon cursor-pointer text-xl font-light md:hidden ${
                isAFavorite
                  ? currentSongData.songId === songId || isAMultipleSelection
                    ? 'text-font-color-black dark:text-font-color-black'
                    : 'text-font-color-highlight dark:text-dark-background-color-3'
                  : currentSongData.songId === songId || isAMultipleSelection
                  ? 'text-font-color-black dark:text-font-color-black'
                  : 'text-font-color-highlight dark:text-dark-background-color-3'
              }`}
              title={`You ${isAFavorite ? 'liked' : "didn't like"} this song.`}
              onClick={() => {
                window.api
                  .toggleLikeSongs([songId], !isAFavorite)
                  .then((res) => {
                    if (res && (res?.likes || 0) + (res?.dislikes || 0) > 0) {
                      if (currentSongData.songId === songId)
                        toggleIsFavorite(!currentSongData.isAFavorite);
                      return setIsAFavorite((prevData) => !prevData);
                    }
                    setIsAFavorite((prevData) => !prevData);
                    return undefined;
                  })
                  .catch((err) => console.error(err));
              }}
            >
              favorite
            </span>
            {minutes ?? '--'}:{seconds ?? '--'}
          </div>
        </div>
      </div>
    );
  }
);

Song.displayName = 'Song';
export default Song;
