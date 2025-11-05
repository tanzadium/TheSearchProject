import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Send } from 'lucide-react';
import MOCK_DATA from '../data/MockData'; 

// Header Component
const Header = ({ username, profilePicture }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-300">
          <img 
            src={profilePicture} 
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-white font-semibold text-base drop-shadow-lg">{username}</span>
      </div>
      <button className="text-white p-1 hover:bg-white/20 rounded-full transition-colors">
        <X size={26} />
      </button>
    </div>
  );
};

// Comment Item Component
const CommentItem = ({ profilePicture, username, comment }) => {
  return (
    <div className="flex items-start gap-2.5 mb-3 animate-slide-up">
      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300 flex-shrink-0 border-2 border-white/50">
        <img 
          src={profilePicture} 
          alt={username}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-black/50 backdrop-blur-md rounded-2xl px-3.5 py-2.5 max-w-[75%] shadow-lg">
        <p className="text-white text-xs font-bold mb-0.5">{username}</p>
        <p className="text-white text-sm leading-relaxed">{comment}</p>
      </div>
    </div>
  );
};

// Comment List Component
const CommentList = ({ comments }) => {
  const listRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // ตรวจสอบว่า user เลื่อนขึ้นไหม
  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20;
    setAutoScroll(isAtBottom);
  };

  // ถ้าอยู่ล่างสุด -> scroll อัตโนมัติ
  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments, autoScroll]);

  return (
    <div 
      ref={listRef}
      onScroll={handleScroll}
      className="absolute bottom-20 left-0 right-0 z-10 px-3 max-h-[55vh] overflow-y-auto pb-2"
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

// Video Section Component
const VideoSection = ({ onTap }) => {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError(true);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div 
      className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 cursor-pointer overflow-hidden"
      onClick={onTap}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6 max-w-md">
                <div className="mb-4">
                  <div className="w-20 h-20 bg-white/10 rounded-full mx-auto flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xl font-bold mb-2">Camera Access Required</p>
                <p className="text-sm opacity-90">Please allow camera permissions to start live streaming</p>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ aspectRatio: '16/9' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Input Bar Component
const InputBar = () => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl">
      <div className="flex items-center gap-2.5 p-3">
        <button className="p-2.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl">
          <ShoppingCart size={20} className="text-white" />
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="แสดงความคิดเห็น..."
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
        />
        
        <button 
          onClick={handleSend}
          className="p-2.5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all disabled:from-gray-300 disabled:to-gray-400 shadow-lg hover:shadow-xl disabled:shadow-none"
          disabled={!message.trim()}
        >
          <Send size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [visibleComments, setVisibleComments] = useState([]);
  const [commentIndex, setCommentIndex] = useState(1); // Start from 1 to skip seller
  const seller = MOCK_DATA[0];

  // เพิ่ม comment ใหม่เมื่อ index เปลี่ยน
  useEffect(() => {
    if (commentIndex > 1 && commentIndex <= MOCK_DATA.length) {
      setVisibleComments(prev => [...prev, MOCK_DATA[commentIndex - 1]]);
    }
  }, [commentIndex]);

  // ฟังก์ชันสำหรับเพิ่ม comment (จากคลิกหรือกด space)
  const addComment = () => {
    if (commentIndex < MOCK_DATA.length) {
      setCommentIndex(prev => prev + 1);
    }
  };

  // ให้ spacebar ทำงานเหมือนคลิก
  useEffect(() => {
    const handleSpace = (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        addComment();
      }
    };
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [commentIndex]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.35s ease-out;
        }
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <VideoSection onTap={addComment} />
      <Header username={seller.username} profilePicture={seller.profilePicture} />
      <CommentList comments={visibleComments} />
      <InputBar />
    </div>
  );
}
