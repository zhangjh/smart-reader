import { useState, useEffect, useRef } from 'react';
import ePub from 'epubjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSwipeable } from 'react-swipeable';

const EpubViewerComponent = ({ url }) => {
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    let book = null;

    const loadBook = async () => {
      if (book) {
        book.destroy();
      }

      book = ePub(url);
      const rendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'always'
      });
      renditionRef.current = rendition;

      await book.ready;
      await rendition.display();
    };

    if (url) {
      loadBook();
    }

    const handleKeyPress = (e) => {
      if (renditionRef.current) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          handlePrevPage();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          handleNextPage();
        }
      }
    };
    const handleWheel = (e) => {
      if (renditionRef.current) {
        e.preventDefault();
        if (e.deltaY > 0) {
          handleNextPage();
        } else {
          handlePrevPage();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    // document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (book) {
        book.destroy();
      }
      document.removeEventListener('keydown', handleKeyPress);
      // document.removeEventListener('wheel', handleWheel);
    };
  }, [url]);

  const handlePrevPage = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  const handleNextPage = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNextPage,
    onSwipedRight: handlePrevPage,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div 
      className="h-full flex flex-col relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      {...handlers}
    >
      <div ref={viewerRef} className="flex-grow"></div>
      {showControls && (
        <>
          <Button 
            onClick={handlePrevPage} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r-full hover:bg-opacity-75 transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft size={24} />
          </Button>
          <Button 
            onClick={handleNextPage} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l-full hover:bg-opacity-75 transition-all"
            aria-label="Next page"
          >
            <ChevronRight size={24} />
          </Button>
        </>
      )}
    </div>
  );
};

export default EpubViewerComponent;