/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import Button from 'renderer/components/Button';
import Hyperlink from 'renderer/components/Hyperlink';
import { AppContext } from 'renderer/contexts/AppContext';

type Props = {
  songId: string;
  songTitle: string;
  songArtists?: {
    artistId?: string | undefined;
    name: string;
    artworkPath?: string | undefined;
    onlineArtworkPaths?: OnlineArtistArtworks | undefined;
  }[];
  songLyrics?: string;
  updateSongInfo: (callback: (prevSongInfo: SongTags) => SongTags) => void;
};

const SongLyricsEditor = (props: Props) => {
  const { userData } = React.useContext(AppContext);

  const { songId, songTitle, songArtists, songLyrics, updateSongInfo } = props;
  const isLyricsSynced = React.useMemo(
    () => /^\[\d+:\d{1,2}\.\d{1,2}]/gm.test(songLyrics || ''),
    [songLyrics]
  );
  return (
    <div className="song-lyrics-editor-container flex w-[95%] items-center justify-between">
      <div className="tag-input mb-6 flex h-full w-[65%] min-w-[10rem] flex-col">
        <label htmlFor="song-lyrics-id3-tag">Lyrics</label>
        <textarea
          id="song-lyrics-id3-tag"
          className="mt-4 max-h-80 min-h-[12rem] rounded-2xl border-[0.15rem] border-background-color-2 bg-background-color-1 p-4 dark:border-dark-background-color-2 dark:bg-dark-background-color-1"
          name="lyrics"
          placeholder="Lyrics"
          value={songLyrics ?? ''}
          onKeyDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            const lyrics = e.currentTarget.value;
            updateSongInfo((prevData) => ({
              ...prevData,
              lyrics,
            }));
          }}
        />
        <div className="ml-2 mt-1 flex items-center">
          <span
            className={`material-icons-round-outlined mr-2 cursor-pointer !text-lg ${
              isLyricsSynced &&
              'text-font-color-highlight-2 dark:text-dark-font-color-highlight-2'
            }`}
            title={
              songLyrics
                ? isLyricsSynced
                  ? 'Lyrics are synced.'
                  : 'Lyrics are not synced.'
                : undefined
            }
          >
            verified
          </span>
          <span className="text-sm font-extralight">
            Synced lyrics supported.{' '}
            <Hyperlink
              link="https://wikipedia.org/wiki/LRC_(file_format)"
              linkTitle="Read more about LRC format"
              label="Read more about LRC format."
            />
          </span>
        </div>
      </div>
      <div className="song-lyrics-buttons flex h-full w-1/3 flex-col items-end justify-start py-8">
        <Button
          key={0}
          label="Download Lyrics"
          iconName="download"
          iconClassName="mr-2"
          className="download-lyrics-btn"
          clickHandler={() => {
            window.api
              .getSongLyrics(
                songTitle,
                songArtists?.map((artist) => artist.name),
                songId,
                'UN_SYNCED',
                true
              )
              .then((res) => {
                if (res)
                  updateSongInfo((prevData) => ({
                    ...prevData,
                    lyrics: res.lyrics.unparsedLyrics,
                  }));
                return undefined;
              })
              .catch((err) => console.error(err));
          }}
        />
        <Button
          key={1}
          label="Download Synced Lyrics"
          iconName="download"
          className="download-synced-lyrics-btn mt-4"
          iconClassName="mr-2"
          clickHandler={() => {
            window.api
              .getSongLyrics(
                songTitle,
                songArtists?.map((artist) => artist.name),
                songId,
                'SYNCED',
                true
              )
              .then((res) => {
                if (res)
                  updateSongInfo((prevData) => ({
                    ...prevData,
                    lyrics: res.lyrics.unparsedLyrics,
                  }));
                return undefined;
              })
              .catch((err) => console.error(err));
          }}
          isDisabled={!userData?.preferences.isMusixmatchLyricsEnabled}
          tooltipLabel={
            !userData?.preferences.isMusixmatchLyricsEnabled
              ? 'You have to enable Musixmatch Lyrics from Settings to use this feature.'
              : undefined
          }
        />
      </div>
    </div>
  );
};

export default SongLyricsEditor;