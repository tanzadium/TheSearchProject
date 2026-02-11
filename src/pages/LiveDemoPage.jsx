import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Send } from 'lucide-react';
import MOCK_DATA from '../data/MockData';

// --- Assets ---
const STICKER_ASSETS = {
  HEART: "https://cdn-icons-png.flaticon.com/512/2107/2107945.png",
  THUMBS_UP: "https://cdn-icons-png.flaticon.com/512/456/456115.png",
  LAUGH: "https://cdn-icons-png.flaticon.com/512/1933/1933691.png",
  WOW: "https://cdn-icons-png.flaticon.com/512/1933/1933585.png"
};

// --- Updated Component: FloatingSticker ---
const FloatingSticker = ({ src, size = "w-20 h-20", delay = "0s", visible = true }) => {
  return (
    <div
      className={`${size} animate-float-bob filter drop-shadow-xl transition-all duration-500 ease-in-out`}
      style={{ 
        animationDelay: delay,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0)'
      }} 
    >
      <img
        src={src}
        alt="sticker"
        className="w-full h-full object-contain"
      />
    </div>
  );
};


// Header Component 
// รับ prop: showCross (true/false) มาจาก App
const Header = ({ username, profilePicture, showCross }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 ">
      <div className="flex items-center gap-5">
        <div className="w-25 h-25 rounded-full border-4 border-white overflow-hidden bg-gray-300 shadow-xl">
          <img
            src={profilePicture}
            alt={username}
            className="w-full h-full object-cover transform scale-125"
          />
        </div>
        <span className="text-white font-bold text-4xl drop-shadow-xl tracking-wide">
          {username}
        </span>
      </div>
      
      {/* ใช้ CSS opacity ในการซ่อน/แสดง ตามค่า showCross */}
      <button
        onClick={() => window.location.reload()}
        className={`text-white p-2 hover:bg-white/20 rounded-full transition-all duration-300 cursor-pointer z-50 ${showCross ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}
      >
        <X size={38} />
      </button>
    </div>
  );
};

// Comment Item (เหมือนเดิม)
const CommentItem = ({ profilePicture, username, comment }) => {
  return (
    <div className="flex items-start gap-5 mb-3 animate-slide-up">
      <div className="w-15 h-15 rounded-full overflow-hidden bg-gray-300 shrink-0 ">
        <img
          src={profilePicture}
          alt={username}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-white/80 backdrop-blur-md rounded-2xl px-3.5 py-2.5 max-w-[75%] shadow-lg">
        <p className="text-black text-2xl font-bold mb-1">{username}</p>
        <p className="text-black text-xl leading-relaxed">{comment}</p>
      </div>
    </div>
  );
};

// Comment List (เหมือนเดิม)
const CommentList = ({ comments }) => {
  const listRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20;
    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments, autoScroll]);

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="absolute bottom-20 left-0 right-0 z-10 px-3 max-h-[40vh] overflow-y-auto pb-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {comments.map((comment, index) => (
        <CommentItem
          key={comment.id || index}
          profilePicture={comment.profilePicture}
          username={comment.username}
          comment={comment.comment}
        />
      ))}
    </div>
  );
};

// Input Bar (เหมือนเดิม)
const InputBar = () => {
  const [message, setMessage] = useState('');
  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white backdrop-blur-md border-t border-gray-200 shadow-2xl">
      <div className="flex items-center gap-2.5 p-3">
        <button className="p-2.5 rounded-full bg-orange-400 transition-all shadow-lg hover:shadow-xl">
          <ShoppingCart size={40} className="text-white" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="แสดงความคิดเห็น..."
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
        />
        <button
          onClick={handleSend}
          className="p-2.5 rounded-full bg-orange-400 hover:from-purple-600 hover:to-pink-600 transition-all disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl disabled:shadow-none"
          disabled={!message.trim()}
        >
          <Send size={40} className="text-white" />
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [visibleComments, setVisibleComments] = useState([]);
  const [commentIndex, setCommentIndex] = useState(1);
  const seller = MOCK_DATA[0];

  // Sticker State
  const [stickersState, setStickersState] = useState({
    top: true,
    middle: true,
    bottom: true
  });

  // 1. ย้าย State ของปุ่มกากบาท (Cross) มาไว้ที่ App
  const [crossState, setCrossState] = useState(true);

  useEffect(() => {
    if (commentIndex > 1 && commentIndex <= MOCK_DATA.length) {
      setVisibleComments(prev => [...prev, MOCK_DATA[commentIndex - 1]]);
    }
  }, [commentIndex]);

  useEffect(() => {
    const addComment = () => {
      if (commentIndex < MOCK_DATA.length) {
        setCommentIndex(prev => prev + 1);
      }
    };

    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        addComment();
      }

      if (e.key === 'r' || e.key === 'R' || e.key === 'พ') {
        e.preventDefault();
        window.location.reload();
      }

      if (e.key === 'h' || e.key === 'H' || e.key === '้') {
        e.preventDefault();
        setStickersState(prev => ({ ...prev, top: !prev.top }));
      }

      if (e.key === 'j' || e.key === 'J' || e.key === '่' || e.key === '็') {
        e.preventDefault();
        setStickersState(prev => ({ ...prev, bottom: !prev.bottom }));
      }
      
      if (e.key === 'k' || e.key === 'K' || e.key === 'า') {
        e.preventDefault();
        setStickersState(prev => ({ ...prev, middle: !prev.middle }));
      }

      // 2. ปุ่ม L (หรือ ส) ใช้เปิดปิดปุ่มกากบาท
      if(e.key === 'l' || e.key === 'L' || e.key === 'ส'){
        e.preventDefault();
        setCrossState(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commentIndex]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#00FF00]">
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.35s ease-out;
        }
        @keyframes float-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float-bob {
          animation: float-bob 3s ease-in-out infinite;
        }
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* 3. ส่งค่า crossState ไปให้ Header ผ่าน prop ชื่อ showCross */}
      <Header 
        username={seller.username} 
        profilePicture={seller.profilePicture} 
        showCross={crossState}
      />

      <div className="absolute top-40 right-6 z-10 flex flex-col gap-8 pointer-events-none">
        <FloatingSticker src={STICKER_ASSETS.HEART} delay="0s" visible={stickersState.top} />
        <FloatingSticker src={STICKER_ASSETS.THUMBS_UP} size="w-24 h-24" delay="0.5s" visible={stickersState.middle} />
        <FloatingSticker src={STICKER_ASSETS.LAUGH} delay="1s" visible={stickersState.bottom} />
      </div>

      <CommentList comments={visibleComments} />
      <InputBar />
    </div>
  );
}