/* eslint-disable react/no-array-index-key */
import React from 'react';
import Button from '../Button';
import MainContainer from '../MainContainer';
import Folder from './Folder';

const MusicFoldersPage = () => {
  const [musicFolders, setMusicFolders] = React.useState<MusicFolderData[]>([]);

  const fetchFoldersData = React.useCallback(
    () =>
      window.api
        .getUserData()
        .then((res) => {
          if (res) return setMusicFolders(res.musicFolders);
          return undefined;
        })
        .catch((err) => console.error(err)),
    []
  );

  React.useEffect(() => {
    fetchFoldersData();
    const manageFolderDataUpdatesInMusicFoldersPage = (e: Event) => {
      if ('detail' in e) {
        const dataEvents = (e as DetailAvailableEvent<DataUpdateEvent[]>)
          .detail;
        for (let i = 0; i < dataEvents.length; i += 1) {
          const event = dataEvents[i];
          if (event.dataType === 'userData/musicFolder') fetchFoldersData();
        }
      }
    };
    document.addEventListener(
      'app/dataUpdates',
      manageFolderDataUpdatesInMusicFoldersPage
    );
    return () => {
      document.removeEventListener(
        'app/dataUpdates',
        manageFolderDataUpdatesInMusicFoldersPage
      );
    };
  }, [fetchFoldersData]);

  const musicFolderComponents = React.useMemo(() => {
    if (musicFolders.length > 0) {
      return musicFolders.map((data, index) => {
        const folderName = data.path.split('\\').at(-1);

        return <Folder key={index} folderName={folderName ?? ''} />;
      });
    }
    return [];
  }, [musicFolders]);

  return (
    <MainContainer className="music-folders-page appear-from-bottom pr-4">
      <>
        <div className="title-container mt-2 mb-4 flex items-center justify-between text-3xl font-medium text-font-color-highlight dark:text-dark-font-color-highlight">
          Music Folders
          <div className="buttons-container text-sm">
            <Button
              label="Add new Folder"
              iconName="create_new_folder"
              pendingAnimationOnDisabled
              iconClassName="material-icons-round-outlined"
              clickHandler={(_, isDisabled, isPending) => {
                isDisabled(true);
                isPending(true);
                return window.api
                  .addMusicFolder()
                  .then((res) => console.log(res))
                  .catch((err) => console.error(err))
                  .finally(() => {
                    isDisabled(false);
                    isPending(false);
                  });
              }}
            />
          </div>
        </div>

        <div className="folders-container">{musicFolderComponents}</div>
      </>
    </MainContainer>
  );
};

export default MusicFoldersPage;
