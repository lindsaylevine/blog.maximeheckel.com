import styled from '@emotion/styled';
import { useReducedMotion, motion, useViewportScroll } from 'framer-motion';
import React from 'react';
// @ts-ignore
import AnchorLink from 'react-anchor-link-smooth-scroll';
import Scrollspy from 'react-scrollspy';

interface ReadingProgressProps {
  target: React.RefObject<HTMLDivElement>;
  slim?: boolean;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({ target, slim }) => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useViewportScroll();
  const [readingProgress, setReadingProgress] = React.useState(0);
  const [ids, setIds] = React.useState<Array<{ id: string; title: string }>>(
    []
  );

  const shouldShowTableOfContent = readingProgress > 7 && readingProgress < 100;
  const shouldHideProgressBar = readingProgress >= 99;

  const scrollListener = () => {
    if (!target || !target.current) {
      return;
    }

    const element = target.current;
    const totalHeight = element.clientHeight;
    const windowScrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    if (windowScrollTop === 0) {
      return setReadingProgress(0);
    }

    if (windowScrollTop > totalHeight) {
      return setReadingProgress(100);
    }

    setReadingProgress((windowScrollTop / totalHeight) * 100);
  };

  React.useEffect(() => {
    const titles = document.querySelectorAll('h2');
    const idArrays = Array.prototype.slice
      .call(titles)
      .map(title => ({ id: title.id, title: title.innerText })) as Array<{
      id: string;
      title: string;
    }>;
    setIds(idArrays);
  }, []);

  React.useEffect(() => {
    window.addEventListener('scroll', scrollListener);
    return () => window.removeEventListener('scroll', scrollListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const progressBarWrapperVariants = {
    hide: {
      opacity: shouldReduceMotion ? 1 : 0,
    },
    show: { opacity: shouldReduceMotion ? 1 : shouldHideProgressBar ? 0 : 0.7 },
  };

  const variants = {
    hide: {
      opacity: shouldReduceMotion ? 1 : 0,
    },
    show: (shouldShowTableOfContent: boolean) => ({
      opacity: shouldReduceMotion || shouldShowTableOfContent ? 1 : 0,
    }),
  };

  return (
    <Wrapper slim={slim} showTableOfContents={shouldShowTableOfContent}>
      <ProgressBarWrapper
        initial="hide"
        variants={progressBarWrapperVariants}
        animate="show"
        transition={{ type: 'spring' }}
        custom={shouldHideProgressBar}
      >
        <ProgressBar
          style={{ transformOrigin: 'top', scaleY: scrollYProgress }}
          data-testid="progress-bar"
          data-testprogress={readingProgress}
        />
      </ProgressBarWrapper>
      {ids.length > 0 ? (
        <Scrollspy
          items={ids.map(item => `${item.id}-section`)}
          currentClassName="isCurrent"
          offset={-175}
        >
          {ids.map(item => {
            return (
              <motion.li
                initial="hide"
                variants={variants}
                animate="show"
                transition={{ type: 'spring' }}
                key={item.id}
                custom={shouldShowTableOfContent}
              >
                <AnchorLink offset="150" href={`#${item.id}`}>
                  {item.title}
                </AnchorLink>
              </motion.li>
            );
          })}
        </Scrollspy>
      ) : null}
    </Wrapper>
  );
};

export default ReadingProgress;

const ProgressBar = styled(motion.div)`
  width: 1px;
  background-color: var(--maximeheckel-colors-typeface-1);
  height: 100%;
`;

const ProgressBarWrapper = styled(motion.div)`
  height: calc(88vh - 40px);
  max-height: 425px;
  width: 1px;
  background-color: rgba(8, 8, 11, 0.3);
`;

type WrapperProps = {
  showTableOfContents: boolean;
  slim?: boolean;
};

const Wrapper = styled('div')<WrapperProps>`
  @media (max-width: 1100px) {
    left: 10px;
  }
  position: fixed;
  top: 266px;
  display: flex;
  left: 30px;

  ${p =>
    !p.showTableOfContents
      ? `
   ul {
     display: none;
   }
  `
      : ''}

  ul {
    @media (max-width: 1250px) {
      display: none;
    }

    max-width: ${p => (p.slim ? '150px' : '200px')};
    display: flex;
    flex-direction: column;

    li {
      list-style: none;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
      margin-bottom: 22px;
      a {
        ${p =>
          !p.showTableOfContents ? `cursor: none;  pointer-events: none;` : ''}
        color: var(--maximeheckel-colors-typeface-2);
        text-decoration: none;
      }

      &:focus:not(:focus-visible) {
        outline: 0;
      }

      &:focus-visible {
        outline: 2px solid var(--maximeheckel-colors-brand);
        opacity: 1 !important;
      }
    }
  }
`;
