import React from 'react';
import Button from 'renderer/components/Button';
import calculateElapsedTime from 'renderer/utils/calculateElapsedTime';
import parseByteSizes from 'renderer/utils/parseByteSizes';

const StorageSettings = () => {
  const [storageMetrics, setStorageMetrics] = React.useState<
    StorageMetrics | null | undefined
  >();

  const fetchStorageUsageData = React.useCallback((forceRefresh = false) => {
    return window.api.storageData
      .getStorageUsage(forceRefresh)
      .then((res) => {
        if (!res || res.totalSize === 0) return setStorageMetrics(undefined);
        return setStorageMetrics(res);
      })
      .catch((err) => {
        console.error(err);
        return setStorageMetrics(null);
      });
  }, []);

  React.useEffect(() => {
    fetchStorageUsageData();
  }, [fetchStorageUsageData]);

  const appStorageBarWidths = React.useMemo(() => {
    if (storageMetrics) {
      const { appDataSizes, totalSize, appFolderSize, rootSizes } =
        storageMetrics;
      const {
        // appDataSize,
        artworkCacheSize,
        tempArtworkCacheSize,
        // totalArtworkCacheSize,
        logSize,
        songDataSize,
        artistDataSize,
        albumDataSize,
        genreDataSize,
        playlistDataSize,
        userDataSize,
        // totalKnownItemsSize,
        // otherSize,
      } = appDataSizes;
      return {
        artworkCacheSizeWidth: (artworkCacheSize / rootSizes.size) * 100,
        tempArtworkCacheSizeWidth:
          (tempArtworkCacheSize / rootSizes.size) * 100,
        logSizeWidth: (logSize / rootSizes.size) * 100,
        songDataSizeWidth: (songDataSize / rootSizes.size) * 100,
        artistDataSizeWidth: (artistDataSize / rootSizes.size) * 100,
        albumDataSizeWidth: (albumDataSize / rootSizes.size) * 100,
        genreDataSizeWidth: (genreDataSize / rootSizes.size) * 100,
        playlistDataSizeWidth: (playlistDataSize / rootSizes.size) * 100,
        userDataSizeWidth: (userDataSize / rootSizes.size) * 100,
        appFolderSizeWidth: (appFolderSize / rootSizes.size) * 100,
        otherApplicationSizesWidth:
          ((rootSizes.size - rootSizes.freeSpace - totalSize) /
            rootSizes.size) *
          100,
      };
    }
    return undefined;
  }, [storageMetrics]);

  const appDataStorageBarWidths = React.useMemo(() => {
    if (storageMetrics) {
      const { appDataSizes } = storageMetrics;
      const {
        songDataSize,
        artistDataSize,
        albumDataSize,
        genreDataSize,
        playlistDataSize,
        librarySize,
      } = appDataSizes;

      return {
        songDataSizeWidth: (songDataSize / librarySize) * 100,
        artistDataSizeWidth: (artistDataSize / librarySize) * 100,
        albumDataSizeWidth: (albumDataSize / librarySize) * 100,
        genreDataSizeWidth: (genreDataSize / librarySize) * 100,
        playlistDataSizeWidth: (playlistDataSize / librarySize) * 100,
      };
    }
    return undefined;
  }, [storageMetrics]);

  const appStorageBarCssProperties: any = {};
  const appDataStorageBarCssProperties: any = {};

  appStorageBarCssProperties['--other-applications-size-storage-bar-width'] =
    `${appStorageBarWidths?.otherApplicationSizesWidth || 0}%`;
  appStorageBarCssProperties['--app-folder-size-storage-bar-width'] = `${
    appStorageBarWidths?.appFolderSizeWidth || 0
  }%`;
  appStorageBarCssProperties['--artwork-cache-size-storage-bar-width'] = `${
    appStorageBarWidths?.artworkCacheSizeWidth || 0
  }%`;
  appStorageBarCssProperties['--temp-artwork-cache-size-storage-bar-width'] =
    `${appStorageBarWidths?.tempArtworkCacheSizeWidth || 0}%`;
  appStorageBarCssProperties['--song-data-size-storage-bar-width'] = `${
    appStorageBarWidths?.songDataSizeWidth || 0
  }%`;
  appStorageBarCssProperties['--artist-data-size-storage-bar-width'] = `${
    appStorageBarWidths?.artistDataSizeWidth || 0
  }%`;
  appStorageBarCssProperties['--album-data-size-storage-bar-width'] = `${
    appStorageBarWidths?.albumDataSizeWidth || 0
  }%`;
  appStorageBarCssProperties['--playlist-data-size-storage-bar-width'] = `${
    appStorageBarWidths?.playlistDataSizeWidth || 0
  }%`;
  appStorageBarCssProperties['--genre-data-size-storage-bar-width'] = `${
    appStorageBarWidths?.genreDataSizeWidth || 0
  }%`;
  appStorageBarCssProperties['--user-data-size-storage-bar-width'] = `${
    appStorageBarWidths?.userDataSizeWidth || 0
  }%`;
  appStorageBarCssProperties['--log-size-storage-bar-width'] = `${
    appStorageBarWidths?.logSizeWidth || 0
  }%`;

  appDataStorageBarCssProperties['--song-data-size-storage-bar-width'] = `${
    appDataStorageBarWidths?.songDataSizeWidth || 0
  }%`;
  appDataStorageBarCssProperties['--artist-data-size-storage-bar-width'] = `${
    appDataStorageBarWidths?.artistDataSizeWidth || 0
  }%`;
  appDataStorageBarCssProperties['--album-data-size-storage-bar-width'] = `${
    appDataStorageBarWidths?.albumDataSizeWidth || 0
  }%`;
  appDataStorageBarCssProperties['--playlist-data-size-storage-bar-width'] = `${
    appDataStorageBarWidths?.playlistDataSizeWidth || 0
  }%`;
  appDataStorageBarCssProperties['--genre-data-size-storage-bar-width'] = `${
    appDataStorageBarWidths?.genreDataSizeWidth || 0
  }%`;

  return (
    <li className="main-container storage-settings-container mb-16">
      <div className="title-container mb-4 mt-1 flex items-center text-2xl font-medium text-font-color-highlight dark:text-dark-font-color-highlight">
        <span className="material-icons-round-outlined mr-2">hard_drive</span>
        Storage
      </div>
      <p>See how Nora manages your library and utilizes your storage.</p>

      {storageMetrics && (
        <div>
          <div className="mx-auto mt-6 w-4/5">
            <div className="flex items-center justify-between text-sm uppercase opacity-50">
              <span>Full storage Usage</span>{' '}
              <span>
                {parseByteSizes(storageMetrics?.totalSize)?.size} out of{' '}
                {parseByteSizes(storageMetrics?.rootSizes.size)?.size}
              </span>
            </div>

            <div
              className="mt-2 flex h-4 overflow-hidden rounded-md bg-background-color-2 dark:bg-dark-background-color-2/75"
              style={appStorageBarCssProperties}
              title="Free space"
            >
              <div
                className="!h-full w-[var(--other-applications-size-storage-bar-width)] cursor-pointer bg-[#ffbe76] opacity-75 transition-opacity hover:opacity-100"
                title="Other Applications"
              />
              <div
                className="!h-full w-[var(--artwork-cache-size-storage-bar-width)] cursor-pointer bg-[#55efc4] opacity-75 transition-opacity hover:opacity-100"
                title="Artwork Cache"
              />
              <div
                className="!h-full w-[var(--temp-artwork-cache-size-storage-bar-width)] cursor-pointer bg-[#00b894] opacity-75 transition-opacity hover:opacity-100"
                title="Temp Artwork Cache"
              />
              <div
                className="!h-full w-[var(--song-data-size-storage-bar-width)] cursor-pointer bg-[#00cec9] opacity-75 transition-opacity hover:opacity-100"
                title="Song Data"
              />
              <div
                className="!h-full w-[var(--artist-data-size-storage-bar-width)] cursor-pointer bg-[#0984e3] opacity-75 transition-opacity hover:opacity-100"
                title="Artist Data"
              />
              <div
                className="!h-full w-[var(--album-data-size-storage-bar-width)] cursor-pointer bg-[#6c5ce7] opacity-75 transition-opacity hover:opacity-100"
                title="Album Data"
              />
              <div
                className="!h-full w-[var(--playlist-data-size-storage-bar-width)] cursor-pointer bg-[#fdcb6e] opacity-75 transition-opacity hover:opacity-100"
                title="Playlist Data"
              />
              <div
                className="!h-full w-[var(--genre-data-size-storage-bar-width)] cursor-pointer bg-[#e17055] opacity-75 transition-opacity hover:opacity-100"
                title="Genre Data"
              />
              <div
                className="!h-full w-[var(--log-size-storage-bar-width)] cursor-pointer bg-[#e84393] opacity-75 transition-opacity hover:opacity-100"
                title="App Logs"
              />
              <div
                className="!h-full w-[var(--user-data-size-storage-bar-width)] cursor-pointer bg-[#d63031] opacity-75 transition-opacity hover:opacity-100"
                title="User Data"
              />
              <div
                className="!h-full w-[var(--app-folder-size-storage-bar-width)] cursor-pointer bg-[#4834d4] opacity-75 transition-opacity hover:opacity-100"
                title="Internal App Files"
              />
            </div>

            <div className="mt-10 flex items-center justify-between text-sm uppercase opacity-50">
              <span>Storage Use for Library Data</span>{' '}
              <span>
                {parseByteSizes(storageMetrics?.appDataSizes.librarySize)?.size}
              </span>
            </div>

            <div
              className="mt-2 flex h-4 overflow-hidden rounded-md bg-background-color-2 dark:bg-dark-background-color-2/75"
              style={appDataStorageBarCssProperties}
            >
              <div
                className="!h-full w-[var(--song-data-size-storage-bar-width)] cursor-pointer bg-[#00cec9] opacity-75 transition-opacity hover:opacity-100"
                title="Song Data"
              />
              <div
                className="!h-full w-[var(--artist-data-size-storage-bar-width)] cursor-pointer bg-[#0984e3] opacity-75 transition-opacity hover:opacity-100"
                title="Artist Data"
              />
              <div
                className="!h-full w-[var(--album-data-size-storage-bar-width)] cursor-pointer bg-[#6c5ce7] opacity-75 transition-opacity hover:opacity-100"
                title="Album Data"
              />
              <div
                className="!h-full w-[var(--playlist-data-size-storage-bar-width)] cursor-pointer bg-[#fdcb6e] opacity-75 transition-opacity hover:opacity-100"
                title="Playlist Data"
              />
              <div
                className="!h-full w-[var(--genre-data-size-storage-bar-width)] cursor-pointer bg-[#e17055] opacity-75 transition-opacity hover:opacity-100"
                title="Genre Data"
              />
              {/* <div className="!h-full w-[var(--log-size-storage-bar-width)] bg-[#e84393]" /> */}
              {/* <div className="!h-full w-[var(--user_data-size-storage-bar-width)] bg-[#d63031]" /> */}
            </div>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center px-8">
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#ffbe76]" /> Other
              Applications Files :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {
                  parseByteSizes(
                    storageMetrics.rootSizes.size -
                      storageMetrics.rootSizes.freeSpace -
                      storageMetrics.totalSize,
                  )?.size
                }
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#4834d4]" />{' '}
              Internal App Files :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {parseByteSizes(storageMetrics?.appFolderSize)?.size}
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#55efc4]" /> Artwork
              Cache :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {
                  parseByteSizes(storageMetrics?.appDataSizes.artworkCacheSize)
                    ?.size
                }
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#00b894]" /> Temp
              Artwork Cache :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {
                  parseByteSizes(
                    storageMetrics?.appDataSizes.tempArtworkCacheSize,
                  )?.size
                }
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#00cec9]" /> Songs
              Data :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {
                  parseByteSizes(storageMetrics?.appDataSizes.songDataSize)
                    ?.size
                }
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#0984e3]" /> Artists
              Data :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {
                  parseByteSizes(storageMetrics?.appDataSizes.artistDataSize)
                    ?.size
                }
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#6c5ce7]" /> Albums
              Data :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {
                  parseByteSizes(storageMetrics?.appDataSizes.albumDataSize)
                    ?.size
                }
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#fdcb6e]" />{' '}
              Playlists Data :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {
                  parseByteSizes(storageMetrics?.appDataSizes.playlistDataSize)
                    ?.size
                }
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#e17055]" /> Genres
              Data :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {
                  parseByteSizes(storageMetrics?.appDataSizes.genreDataSize)
                    ?.size
                }
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#d63031]" /> User
              Data :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {
                  parseByteSizes(storageMetrics?.appDataSizes.userDataSize)
                    ?.size
                }
              </span>
            </li>
            <li className="mb-4 mr-8 flex items-center">
              <div className="mr-4 h-4 w-4 rounded-full bg-[#e84393]" /> App
              Logs :{' '}
              <span className="ml-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                {parseByteSizes(storageMetrics?.appDataSizes.logSize)?.size}
              </span>
            </li>
          </ul>

          <div className="group flex items-center justify-center py-4 text-xs uppercase opacity-50">
            <span title={`Generated on ${storageMetrics.generatedDate}.`}>
              Generated{' '}
              <span>
                {
                  calculateElapsedTime(storageMetrics.generatedDate)
                    ?.elapsedString
                }
              </span>
            </span>
            <span className="mx-2">&bull;</span>
            <Button
              className="!m-0 !rounded-none !border-0 !p-0 !text-xs uppercase outline-1 outline-offset-2 hover:underline focus-visible:!outline"
              label="Generate storage metrics again"
              clickHandler={(_, setIsDisabled, setIsPending) => {
                setIsDisabled(true);
                setIsPending(true);
                fetchStorageUsageData(true)
                  .finally(() => {
                    setIsDisabled(false);
                    setIsPending(false);
                  })
                  .catch((err) => console.error(err));
              }}
            />
          </div>
        </div>
      )}

      {storageMetrics === undefined && (
        <div className="flex flex-col items-center justify-center pt-12">
          <span className="material-icons-round-outlined mr-2 text-4xl opacity-50">
            hard_drive
          </span>
          <p className="mt-4 opacity-50">
            Seems like you haven't generated storage metrics before.
          </p>
          <p className="mt-1 px-8 text-center text-sm font-light opacity-50">
            Generating storage metrics is a relatively high computational task.
            Continuing this action could make the app unresponsive temporarily.
            Please be patient...
          </p>
          <Button
            className="!mr-0 mt-4"
            label="Generate storage metrics"
            iconName="hourglass_empty"
            clickHandler={(_, setIsDisabled, setIsPending) => {
              setIsDisabled(true);
              setIsPending(true);
              fetchStorageUsageData(true)
                .finally(() => {
                  setIsDisabled(false);
                  setIsPending(false);
                })
                .catch((err) => console.error(err));
            }}
          />
        </div>
      )}

      {storageMetrics === null && (
        <div className="flex flex-col items-center justify-center pt-12 opacity-50">
          <span className="material-icons-round text-4xl">
            running_with_errors
          </span>
          <p className="mt-4">Seems like something went wrong in our end.</p>
          <Button
            className="!mr-0 mt-4 !rounded-none !border-0 !p-0 !text-xs uppercase outline-1 outline-offset-2 hover:underline focus-visible:!outline"
            label="Generate storage metrics again"
            clickHandler={(_, setIsDisabled, setIsPending) => {
              setIsDisabled(true);
              setIsPending(true);
              fetchStorageUsageData(true)
                .finally(() => {
                  setIsDisabled(false);
                  setIsPending(false);
                })
                .catch((err) => console.error(err));
            }}
          />
        </div>
      )}
    </li>
  );
};

export default StorageSettings;
