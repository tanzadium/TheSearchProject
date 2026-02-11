import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Send, Eye, Plus, Check, Settings, Camera, Palette, Video, X, Play, Pause } from 'lucide-react';
import MOCK_DATA from '../data/MockData';

// --- Assets ---
const STICKER_ASSETS = {
  HEART: "https://cdn-icons-png.flaticon.com/512/2107/2107945.png",
  THUMBS_UP: "https://cdn-icons-png.flaticon.com/512/456/456115.png",
  LAUGH: "https://cdn-icons-png.flaticon.com/512/1933/1933691.png",
  WOW: "https://cdn-icons-png.flaticon.com/512/1933/1933585.png",
  LIKE_HEART: "https://cdn-icons-png.flaticon.com/512/833/833472.png"
};

// --- Component: VideoBackground ---
const VideoBackground = ({ mode, color, selectedDeviceId }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (mode !== 'video') {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      return;
    }

    const startStream = async () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }

      try {
        const constraints = {
          audio: false,
          video: selectedDeviceId 
            ? { deviceId: { exact: selectedDeviceId } } 
            : { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startStream();
  }, [mode, selectedDeviceId]);

  if (mode === 'color') {
    return (
      <div 
        className="absolute inset-0 z-0 transition-colors duration-500"
        style={{ backgroundColor: color }}
      />
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
};

// --- Component: SettingsMenu ---
const SettingsMenu = ({ 
  isOpen, 
  mode, setMode, 
  color, setColor, 
  currentDeviceId, setDeviceId, 
  onClose 
}) => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (isOpen && mode === 'video') {
      const getDevices = async () => {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          const allDevices = await navigator.mediaDevices.enumerateDevices();
          setDevices(allDevices.filter(device => device.kind === 'videoinput'));
        } catch (err) {
          console.error("Error listing devices:", err);
        }
      };
      getDevices();
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-28 left-6 z-50 bg-black/90 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white shadow-2xl w-80 animate-slide-up max-w-[90vw]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2 text-lg">
          <Settings size={20} /> ตั้งค่าพื้นหลัง
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
      </div>

      <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
        <button 
          onClick={() => setMode('video')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'video' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          <Video size={16} /> กล้อง
        </button>
        <button 
          onClick={() => setMode('color')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'color' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
        >
          <Palette size={16} /> สี
        </button>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {mode === 'video' ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 mb-1">เลือกอุปกรณ์กล้อง:</p>
            {devices.map((device) => (
              <button
                key={device.deviceId}
                onClick={() => setDeviceId(device.deviceId)}
                className={`text-left text-sm p-3 rounded-lg transition-colors border ${
                  currentDeviceId === device.deviceId 
                    ? 'bg-orange-500/20 border-orange-500 text-orange-200' 
                    : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-300'
                }`}
              >
                {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
              </button>
            ))}
            {devices.length === 0 && <p className="text-center text-gray-500 py-4">ไม่พบกล้อง</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <p className="col-span-2 text-xs text-gray-400 mb-1">เลือกสีสำหรับ Chroma Key:</p>
            <ColorOption color="#00FF00" label="Green" active={color} onClick={setColor} />
            <ColorOption color="#FF00FF" label="Magenta" active={color} onClick={setColor} />
            <ColorOption color="#0000FF" label="Blue" active={color} onClick={setColor} />
            <ColorOption color="#000000" label="Black" active={color} onClick={setColor} />
            <ColorOption color="#FFFFFF" label="White" active={color} onClick={setColor} />
            <ColorOption color="#808080" label="Grey" active={color} onClick={setColor} />
          </div>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-500 text-center">
        กดที่ 'ยอดคนดู' เพื่อปิดเมนู
      </div>
    </div>
  );
};

const ColorOption = ({ color, label, active, onClick }) => (
  <button
    onClick={() => onClick(color)}
    className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
      active === color ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/5'
    }`}
  >
    <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: color }} />
    <span className="text-sm text-gray-200">{label}</span>
  </button>
);

// --- Component: FloatingSticker ---
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
      <img src={src} alt="sticker" className="w-full h-full object-contain" />
    </div>
  );
};

// --- Component: LikeStream ---
const LikeStream = ({ isVisible }) => {
  const [hearts, setHearts] = useState([]);
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      const newHeart = {
        id: Date.now(),
        left: Math.random() * 90, 
        animationDuration: Math.random() * 2 + 3 + 's', 
        scale: Math.random() * 0.7 + 0.8, 
      };
      setHearts(prev => [...prev, newHeart]);
      setTimeout(() => { setHearts(prev => prev.filter(h => h.id !== newHeart.id)); }, 4000);
    }, 300);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="hidden md:block absolute bottom-24 right-32 w-48 h-96 pointer-events-none z-0 overflow-hidden">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute bottom-0 w-24 h-24 animate-float-up-fade"
          style={{
            left: `${heart.left}%`,
            animationDuration: heart.animationDuration,
            transform: `scale(${heart.scale})`
          }}
        >
          <img src={STICKER_ASSETS.LIKE_HEART} alt="like" className="w-full h-full object-contain opacity-90" />
        </div>
      ))}
    </div>
  );
};

// --- Header Component ---
const Header = ({ username, profilePicture, viewerCount, onSettingsClick, isAutoActive }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 pt-[max(1.5rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/80 to-transparent transition-all">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full border-2 overflow-hidden bg-gray-300 shadow-xl shrink-0">
          <img src={profilePicture} alt={username} className="w-full h-full object-cover transform scale-110"/>
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-white font-bold text-2xl drop-shadow-md tracking-wide">{username}</span>
          <button 
            onClick={() => setIsFollowing(!isFollowing)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 shadow-lg ${
              isFollowing ? 'bg-gray-500/80 text-white border border-gray-400' : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isFollowing ? <Check size={12} /> : <Plus size={12} />}
            {isFollowing ? 'ติดตามแล้ว' : 'ติดตาม'}
          </button>
        </div>
      </div>
      
      <button 
        onClick={onSettingsClick}
        className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-lg cursor-pointer active:scale-95 transition-transform hover:bg-black/50"
      >
        {/* ตรงนี้ครับ: เช็ค isAutoActive ถ้าจริงให้เป็นสีเขียว (text-green-400) */}
        <Eye size={20} className={isAutoActive ? "text-green-400" : "text-white"} />
        <span className="text-white font-bold text-xl min-w-[3ch] text-center">{viewerCount.toLocaleString()}</span>
      </button>
    </div>
  );
};

// --- Comment Item ---
const CommentItem = ({ profilePicture, username, comment }) => {
  return (
    <div className="flex items-start gap-3 mb-3 animate-slide-up">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 shrink-0 border border-white/20">
        <img src={profilePicture} alt={username} className="w-full h-full object-cover" />
      </div>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl rounded-tl-none px-3.5 py-2 max-w-[80%] shadow-lg">
        <p className="text-gray-900 text-xl font-bold mb-0.5">{username}</p>
        <p className="text-gray-800 text-lg leading-snug">{comment}</p>
      </div>
    </div>
  );
};

// --- Comment List ---
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
      className="absolute bottom-20 left-0 right-0 z-10 px-4 h-[45vh] flex flex-col justify-end overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))]"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 80px)',
        maskImage: 'linear-gradient(to bottom, transparent 0px, black 80px)'
      }}
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

// --- Input Bar (Stealth Auto Mode) ---
const InputBar = ({ isAutoActive, onToggleAuto }) => {
  const [message, setMessage] = useState('');

  const handleSendAction = () => {
    if (message.trim()) {
      // 1. ถ้ามีข้อความ -> ส่งข้อความ
      console.log('Sending message:', message);
      setMessage('');
    } else {
      // 2. ถ้าช่องว่าง -> สลับโหมด Auto (แต่หน้าตาปุ่มเหมือนเดิม)
      onToggleAuto();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white backdrop-blur-md border-t border-gray-200 shadow-2xl pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-2.5 p-3">
        <button className="p-2.5 rounded-full bg-orange-500 hover:bg-orange-600 transition-all shadow-lg text-white">
          <ShoppingCart size={24} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendAction()}
          // แก้ className กลับเป็นปกติ ไม่มีสีเขียวแจ้งเตือน
          placeholder="แสดงความคิดเห็น..."
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
        />
        <button
          onClick={handleSendAction}
          // แก้ปุ่มกลับเป็นสีส้ม + ไอคอน Send เสมอ (เนียน)
          className="p-2.5 rounded-full bg-orange-500 hover:bg-orange-600 transition-all shadow-lg text-white"
        >
          <Send size={24} />
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

  const [viewerCount, setViewerCount] = useState(1250);
  const [showAutoLikes, setShowAutoLikes] = useState(false);
  const [stickersState, setStickersState] = useState({ top: false, middle: false, bottom: false });
  
  const [showSettings, setShowSettings] = useState(false);
  const [bgMode, setBgMode] = useState('video');
  const [bgColor, setBgColor] = useState('#00FF00');
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const [isAutoFlowing, setIsAutoFlowing] = useState(false);

  useEffect(() => {
    if (commentIndex > 1 && commentIndex <= MOCK_DATA.length) {
      setVisibleComments(prev => [...prev, MOCK_DATA[commentIndex - 1]]);
    } else if (commentIndex > MOCK_DATA.length) {
       setCommentIndex(1);
    }
  }, [commentIndex]);

  useEffect(() => {
    let interval;
    if (isAutoFlowing) {
      interval = setInterval(() => {
        setCommentIndex(prev => prev + 1);
      }, 3000); // 3 วินาทีตามที่ขอ
    }
    return () => clearInterval(interval);
  }, [isAutoFlowing]);

  useEffect(() => {
    const addComment = () => {
      setCommentIndex(prev => prev + 1);
    };

    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      if (e.code === 'Space') { e.preventDefault(); addComment(); }
      if (e.key === 'r' || e.key === 'R' || e.key === 'พ') { e.preventDefault(); window.location.reload(); }
      if (e.key === 'h' || e.key === 'H' || e.key === '้') { e.preventDefault(); setStickersState(prev => ({ ...prev, top: !prev.top })); }
      if (e.key === 'j' || e.key === 'J' || e.key === '่' || e.key === '็') { e.preventDefault(); setStickersState(prev => ({ ...prev, bottom: !prev.bottom })); }
      if (e.key === 'k' || e.key === 'K' || e.key === 'า') { e.preventDefault(); setStickersState(prev => ({ ...prev, middle: !prev.middle })); }
      if (e.key === 'y' || e.key === 'Y' || e.key === 'ั') { e.preventDefault(); setShowAutoLikes(prev => !prev); }
      if (e.key === '[' || e.key === 'บ') { setViewerCount(prev => Math.max(0, prev - 10)); }
      if (e.key === ']' || e.key === 'ล') { setViewerCount(prev => prev + 10); }
      if (e.key === 'c' || e.key === 'C' || e.key === 'แ') { e.preventDefault(); setShowSettings(prev => !prev); }
      
      if (e.key === 'a' || e.key === 'A' || e.key === 'ฟ') { 
        e.preventDefault(); 
        setIsAutoFlowing(prev => !prev); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commentIndex]);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black touch-none">
      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.35s ease-out; }
        @keyframes float-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .animate-float-bob { animation: float-bob 3s ease-in-out infinite; }
        @keyframes float-up-fade {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          20% { opacity: 0.8; transform: translateY(-20px) scale(1); }
          80% { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-100px) scale(1.2); }
        }
        .animate-float-up-fade { animation: float-up-fade linear forwards; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <VideoBackground 
        mode={bgMode} 
        color={bgColor} 
        selectedDeviceId={selectedDeviceId} 
      />

      <SettingsMenu 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        mode={bgMode}
        setMode={setBgMode}
        color={bgColor}
        setColor={setBgColor}
        currentDeviceId={selectedDeviceId}
        setDeviceId={setSelectedDeviceId}
      />

      <Header 
        username={seller.username} 
        profilePicture={seller.profilePicture} 
        viewerCount={viewerCount} 
        onSettingsClick={() => setShowSettings(prev => !prev)}
        isAutoActive={isAutoFlowing} // ส่งค่าสถานะ Auto ไปให้ Header
      />

      <div className="hidden md:flex absolute top-40 right-6 z-10 flex-col gap-8 pointer-events-none">
        <FloatingSticker src={STICKER_ASSETS.HEART} delay="0s" visible={stickersState.top} />
        <FloatingSticker src={STICKER_ASSETS.THUMBS_UP} size="w-24 h-24" delay="0.5s" visible={stickersState.middle} />
        <FloatingSticker src={STICKER_ASSETS.LAUGH} delay="1s" visible={stickersState.bottom} />
      </div>

      <LikeStream isVisible={showAutoLikes} />
      <CommentList comments={visibleComments} />
      
      <InputBar 
        isAutoActive={isAutoFlowing} 
        onToggleAuto={() => setIsAutoFlowing(prev => !prev)} 
      />
    </div>
  );
}