import { useState, useEffect, useRef } from 'react';
import ePub from 'epubjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useSwipeable } from 'react-swipeable';
import './reader.css';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

const EpubViewerComponent = ({ url, fileId, recoredProgress, ignoreProgress = false }) => {
  const bookKey = fileId;

  const viewerRef = useRef(null);
  const renditionRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(recoredProgress ? recoredProgress : 0.0);
  const [loading, setLoading] = useState(true);

  const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => {
    let book = null;
  
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

    const updateRecord = (progress) => {
      const userId = localStorage.getItem('userId');
      if(!userId) {
        return;
      }
      fetch(`${serviceDomain}/parse/updateRecord`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'fileId': fileId,
          'userId': userId,
          'progress': progress
        }),
      });
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

      const savedProgress = window.localStorage.getItem(bookKey);
      console.log("savedLocation: " + savedProgress);
      if(savedProgress) {
        const savedProgressJO = JSON.parse(savedProgress);
        setProgress(savedProgressJO.progressPercentage);
        await rendition.display(savedProgressJO.cfi);
      } else {
        await rendition.display();
      }
      await book.ready;
      setLoading(false);

      // 检查是否已经生成了位置信息
      if (!book.locations.__locations) {
        try {
          await book.locations.generate(1000);
          console.log("位置信息生成成功");
        } catch (err) {
          console.warn("生成位置信息时出错:", err);
        }
      }

       // 监听页面变化事件
      // rendition.on("locationChanged", (location) => {
      //   window.localStorage.setItem(bookKey, JSON.stringify(location));
      // });

      // 监听阅读进度变化
      rendition.on("relocated", (location) => {
        console.log("location: ", location);
        // let storageJO = { location };
        getReadingProgress().then(progress => {
            console.log("当前阅读进度:", progress);
            // 这里可以保存进度到localStorage或发送到服务器
            // storageJO.progress = progress;
            localStorage.setItem(bookKey, JSON.stringify(progress));
            updateRecord(progress.progressPercentage);
        });
      });
    };

    // 获取阅读进度的方法
    const getReadingProgress = () => {
      return new Promise((resolve) => {
          // 获取当前位置信息
          const currentLocation = renditionRef.current.currentLocation();
          // 计算百分比进度
          const progress = (currentLocation.start.percentage * 100).toFixed(2);
          setProgress(progress);
          // 获取CFI位置标识符
          const cfi = currentLocation.start.cfi;
          // 返回进度信息
          resolve({
              progressPercentage: progress,
              cfi,
          });
      });
    }

    if (url) {
      loadBook();
      if(renditionRef.current) {
        renditionRef.current.on('keydown', handleKeyPress);
      }
      // document.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (book) {
        book.destroy();
        if(renditionRef.current) {
          renditionRef.current.off('keydown', handleKeyPress);
        }
        // document.removeEventListener('wheel', handleWheel);
      } 
    };
  }, [bookKey, fileId, url]);

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
    onSwipedLeft: () => {
      console.log("swipe left");
      handleNextPage();
    },
    onSwipedRight: () => {
      console.log("swipe right");
      handlePrevPage();
    },
    onSwipedDown: () => {
      console.log("swipe down");
      // 往下滑动一定距离
      window.scrollTo(0, -500);
    },
    onSwipedUp: () => {
      console.log("swipe up");
      // 往上滑动一定距离
      window.scrollTo(0, 500);
    },
    delta: 10, // 滑动距离阈值
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div 
      className="h-full flex flex-col relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div ref={viewerRef} className="flex-grow pb-5">  
        {loading && (
          <div className='flex justify-center items-center h-full'>
            <div>文件内容加载中，请稍等...</div>
          </div>
        )}
      </div>

      {/* 仅在移动设备上添加绝对遮罩层用来滑动 */}
      {isMobileDevice && (
        <div 
          {...handlers}
          className="absolute inset-0 z-10"
          style={{
            touchAction: 'none',
            userSelect: 'none',
            pointerEvents: 'auto',
            background: 'transparent'
          }}
        />
      )}

      {!loading && !ignoreProgress && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-black">
        {`- ${progress}% -`}
        </div>
      )}

      {showControls && !isMobileDevice && (
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