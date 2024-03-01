import { Trans, useTranslation } from 'react-i18next';
import toCapitalCase from 'renderer/utils/toCapitalCase';
import Hyperlink from '../Hyperlink';

interface LyricsSourceProp {
  source: string;
  link?: string;
  copyright?: string;
  className?: string;
}

const LyricsSource = (props: LyricsSourceProp) => {
  const { t } = useTranslation();

  const { source, copyright, link, className } = props;
  return (
    <div
      className={`source-name mt-12 flex flex-col items-center justify-center gap-2 text-center text-[#ccc] ${className}`}
    >
      {source !== 'IN_SONG_LYRICS' && (
        <div>
          <Trans
            i18nKey="lyricsPage.lyricsProvidedBy"
            components={{
              Hyperlink: (
                <Hyperlink
                  link={link || '#'}
                  linkTitle={decodeURI(
                    link || t('common.unknownLyricsProvider'),
                  )}
                  label={toCapitalCase(decodeURI(source))}
                />
              ),
            }}
          />
        </div>
      )}
      {copyright && (
        <div className="text-balance text-sm text-font-color-dimmed">
          &copy; {copyright}
        </div>
      )}
    </div>
  );
};

export default LyricsSource;
