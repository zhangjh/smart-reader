import { useState, useEffect, useRef } from 'react';
import ePub from 'epubjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSwipeable } from 'react-swipeable';

const EpubViewerComponent = ({ url }) => {
  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // 添加当前页码状态

  useEffect(() => {
    let book = null;
    const updatePageNumber = async () => {
      if (renditionRef.current) {
        const location = await renditionRef.current.currentLocation();
        setCurrentPage(location.start.displayed.page); // 更新当前页码
      }
    };

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

      book.ready.then(() => {
        rendition.display();
      });
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
    // const handleWheel = (e) => {
    //   if (renditionRef.current) {
    //     e.preventDefault();
    //     if (e.deltaY > 0) {
    //       handleNextPage();
    //     } else {
    //       handlePrevPage();
    //     }
    //   }
    // };

    document.addEventListener('keydown', handleKeyPress);
    // document.addEventListener('wheel', handleWheel, { passive: false });
    renditionRef.current.on('rendered', updatePageNumber); // 监听渲染事件以更新页码

    return () => {
      if (book) {
        book.destroy();
      }
      document.removeEventListener('keydown', handleKeyPress);
      // document.removeEventListener('wheel', handleWheel);
      renditionRef.current.off('rendered', updatePageNumber);
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
      <div ref={viewerRef} className="flex-grow pb-5">
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-black">
          {`Page ${currentPage}`} {/* 显示当前页码 */}
        </div>
      </div>
      
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