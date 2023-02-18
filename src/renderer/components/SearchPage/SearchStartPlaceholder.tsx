/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import Button from '../Button';
import Img from '../Img';
import RecentSearchResult from './RecentSearchResult';

import SearchSomethingImage from '../../../../assets/images/svg/Flying kite_Monochromatic.svg';

type Props = {
  searchInput: string;
  searchResults: SearchResult;
  // eslint-disable-next-line no-unused-vars
  updateSearchInput: (input: string) => void;
};

const SearchStartPlaceholder = (props: Props) => {
  const { searchResults, searchInput, updateSearchInput } = props;

  const [recentSearchResults, setRecentSearchResults] = React.useState(
    [] as string[]
  );

  const fetchRecentSearchResults = React.useCallback(() => {
    window.api
      .getUserData()
      .then((data) => {
        if (data && Array.isArray(data.recentSearches))
          return setRecentSearchResults(data.recentSearches);
        return undefined;
      })
      .catch((err) => console.error(err));
  }, []);

  React.useEffect(() => {
    fetchRecentSearchResults();
    const manageSearchResultsUpdatesInSearchPage = (e: Event) => {
      if ('detail' in e) {
        const dataEvents = (e as DetailAvailableEvent<DataUpdateEvent[]>)
          .detail;
        for (let i = 0; i < dataEvents.length; i += 1) {
          const event = dataEvents[i];
          if (event.dataType === 'userData/recentSearches')
            fetchRecentSearchResults();
        }
      }
    };
    document.addEventListener(
      'app/dataUpdates',
      manageSearchResultsUpdatesInSearchPage
    );
    return () => {
      document.removeEventListener(
        'app/dataUpdates',
        manageSearchResultsUpdatesInSearchPage
      );
    };
  }, [fetchRecentSearchResults]);

  React.useEffect(() => fetchRecentSearchResults(), [fetchRecentSearchResults]);

  const recentSearchResultComponents = React.useMemo(
    () =>
      recentSearchResults.length > 0
        ? recentSearchResults.map((result, index) => (
            <RecentSearchResult
              key={index}
              result={result}
              clickHandler={() => {
                updateSearchInput(result);
              }}
            />
          ))
        : [],
    [recentSearchResults, updateSearchInput]
  );

  return (
    <>
      {searchInput.trim() === '' && (
        <div className="search-start-placeholder active appear-from-bottom relative mt-16 flex w-full flex-col items-center justify-center text-center">
          <Img
            src={SearchSomethingImage}
            className={
              searchResults.songs.length === 0 &&
              searchResults.artists.length === 0 &&
              searchResults.albums.length === 0 &&
              searchResults.playlists.length === 0 &&
              searchResults.genres.length === 0 &&
              searchInput.trim() === ''
                ? 'mb-4 w-60 max-w-full'
                : ''
            }
            alt="Flying kite"
          />
          <div className="description text-xl text-font-color-black dark:text-font-color-white">
            Search for anything in your library...
          </div>
          <div className="recent-search-results-container mt-4 flex flex-wrap items-center justify-center px-[15%]">
            {recentSearchResultComponents}
          </div>
          {recentSearchResultComponents.length > 0 && (
            <Button
              label="clear search history"
              className="!m-0 !mt-4 !border-0 !p-0 font-light text-font-color-highlight hover:underline dark:text-dark-font-color-highlight"
              clickHandler={(_, setIsDisabled) => {
                setIsDisabled(true);
                window.api.clearSearchHistory().catch((err) => {
                  setIsDisabled(false);
                  console.warn(err);
                });
              }}
              pendingAnimationOnDisabled
              pendingClassName="mr-2"
            />
          )}
        </div>
      )}
    </>
  );
};

export default SearchStartPlaceholder;
