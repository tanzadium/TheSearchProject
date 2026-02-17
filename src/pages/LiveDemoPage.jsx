import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Send, Eye, Plus, Check, Settings, Camera, Palette, Video, X, Play, Pause } from 'lucide-react';
import MOCK_DATA from '../data/MockData';

// --- Assets & Data ---
const STICKER_ASSETS = {
  PRE499: "/sticker/box199.png",
  THUMBS_UP: "/sticker/boxpre499.png", // รูปที่จะเปลี่ยนเมื่อกดเลข 4
  LAUGH: "/sticker/199discount.png",
  WOW: "/sticker/199discount.png",
  LIKE_HEART: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
};

// ==========================================
// ส่วนแก้ไขข้อมูลสินค้า (EDIT HERE)
// ==========================================
const PRODUCT_DATA = {
  id: 1,
  name: "กล่องสุ่มลุ้นโชค",
  price: "199",
  image: "/sticker/box.png"
};

// --- Helper: Format Number ---
const formatNumber = (num) => (num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString());

// ==========================================
// SECTION: BACKGROUND & SETTINGS & HEADER
// ==========================================

const VideoBackground = ({ mode, color, selectedDeviceId }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (mode !== 'video') {
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      return;
    }
    const startStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error(err); }
    };
    startStream();
  }, [mode, selectedDeviceId]);

  if (mode === 'color') return <div className="absolute inset-0 z-0 transition-colors duration-500" style={{ backgroundColor: color }} />;
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
};

const Header = ({ username, profilePicture, viewerCount, onSettingsClick, isAutoActive }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 pt-[max(1.5rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/80 to-transparent transition-all">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 overflow-hidden bg-gray-300 shadow-xl shrink-0">
          <img src={profilePicture} alt={username} className="w-full h-full object-cover transform scale-110" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-white font-bold text-xl drop-shadow-md tracking-wide">{username}</span>
          <button onClick={() => setIsFollowing(!isFollowing)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 shadow-lg ${isFollowing ? 'bg-gray-500/80 text-white border border-gray-400' : 'bg-red-500 text-white hover:bg-red-600'}`}>
            {isFollowing ? <Check size={12} /> : <Plus size={12} />} {isFollowing ? 'ติดตามแล้ว' : 'ติดตาม'}
          </button>
        </div>
      </div>
      <button onClick={onSettingsClick} className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-lg cursor-pointer active:scale-95 transition-transform hover:bg-black/50">
        <Eye size={20} className={isAutoActive ? "text-green-400 animate-pulse" : "text-white"} />
        <span className="text-white font-bold text-xl min-w-[3ch] text-center">{formatNumber(viewerCount)}</span>
      </button>
    </div>
  );
};

const SettingsMenu = ({ isOpen, mode, setMode, color, setColor, currentDeviceId, setDeviceId, onClose }) => {
  const [devices, setDevices] = useState([]);
  useEffect(() => {
    if (isOpen && mode === 'video') {
      navigator.mediaDevices.getUserMedia({ video: true }).then(() => {
        navigator.mediaDevices.enumerateDevices().then(d => setDevices(d.filter(dev => dev.kind === 'videoinput')));
      });
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;
  return (
    <div className="absolute top-28 left-6 z-50 bg-black/90 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white shadow-2xl w-80 animate-slide-up max-w-[90vw]">
      <div className="flex justify-between items-center mb-4"><h3 className="font-bold flex items-center gap-2 text-lg"><Settings size={20} /> ตั้งค่าพื้นหลัง</h3><button onClick={onClose}><X size={20} /></button></div>
      <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
        <button onClick={() => setMode('video')} className={`flex-1 py-2 rounded-md text-sm ${mode === 'video' ? 'bg-gray-600' : ''}`}>กล้อง</button>
        <button onClick={() => setMode('color')} className={`flex-1 py-2 rounded-md text-sm ${mode === 'color' ? 'bg-gray-600' : ''}`}>สี</button>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {mode === 'video' ? devices.map(d => <button key={d.deviceId} onClick={() => setDeviceId(d.deviceId)} className="block w-full text-left text-sm p-3 border-b border-gray-700 truncate">{d.label || `Cam ${d.deviceId.slice(0, 5)}`}</button>)
          : <div className="grid grid-cols-2 gap-3">{['#00FF00', '#FF00FF', '#0000FF', '#000000', '#FFFFFF', '#808080'].map(c => <button key={c} onClick={() => setColor(c)} className="flex items-center gap-2 p-2 border border-white/10 rounded"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />{c}</button>)}</div>}
      </div>
    </div>
  );
};

// ==========================================
// SECTION: SHOPPING CARD
// ==========================================

const ShoppingCartCard = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <div className="absolute bottom-24 left-4 z-20 w-80 bg-white rounded-xl shadow-2xl p-3 flex items-center gap-4 animate-slide-up font-sans border border-gray-100">
      <div className="relative w-20 h-20 shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg border border-gray-100" />
        <div className="absolute top-0 left-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg rounded-br-lg">1</div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-0.5">
        <h3 className="text-gray-900 text-sm font-medium leading-tight line-clamp-2">{item.name}</h3>
        <div className="flex items-end justify-between mt-1">
          <div className="flex flex-col leading-none">
            {/* ซ่อนราคาเดิมไว้ตามโค้ดของคุณ */}
            {/* <span className="text-xs text-gray-400 line-through">฿{item.originalPrice}</span> */}
            <span className="text-red-600 text-xl font-bold">฿{item.price}</span>
          </div>
          <button className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-red-700 shadow-sm transition-transform active:scale-95">ซื้อเลย</button>
        </div>
      </div>
      <button onClick={onClose} className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-1 shadow-md border border-gray-100"><X size={14} /></button>
    </div>
  );
};

// ==========================================
// SECTION: COMMENT
// ==========================================

const CommentItem = ({ profilePicture, username, comment }) => (
  <div className="flex items-start gap-3 mb-3 animate-slide-up">
    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-300 shrink-0 border border-white/20">
      <img src={profilePicture} alt={username} className="w-full h-full object-cover" />
    </div>
    <div className="bg-white/90 backdrop-blur-md rounded-2xl rounded-tl-none px-3.5 py-2 max-w-[80%] shadow-lg">
      <p className="text-gray-900 text-lg font-bold mb-0.5">{username}</p>
      <p className="text-gray-800 text-base leading-snug">{comment}</p>
    </div>
  </div>
);

const CommentList = ({ comments, hasProductCard }) => {
  const listRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    setAutoScroll(scrollHeight - scrollTop <= clientHeight + 20);
  };

  useEffect(() => {
    if (autoScroll && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [comments, autoScroll]);

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className={`absolute left-0 right-0 z-10 px-4 flex flex-col justify-end overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))] transition-all duration-300 ease-in-out
        ${hasProductCard ? 'bottom-56 h-[35vh]' : 'bottom-24 h-[45vh]'}
      `}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 80px)', maskImage: 'linear-gradient(to bottom, transparent 0px, black 80px)' }}
    >
      {comments.map((comment, index) => <CommentItem key={comment.id || index} {...comment} />)}
    </div>
  );
};

// ==========================================
// SECTION: INPUT SECTION
// ==========================================

const InputBar = ({ isAutoActive, onToggleAuto, onToggleProduct }) => {
  const [message, setMessage] = useState('');
  const handleSendAction = () => {
    if (message.trim()) { console.log('Sending:', message); setMessage(''); }
    else { onToggleAuto(); }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-white backdrop-blur-md border-t border-gray-200 shadow-2xl pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-2.5 p-3">
        <button onClick={onToggleProduct} className="p-2.5 rounded-full bg-orange-500 hover:bg-orange-600 transition-all shadow-lg text-white">
          <ShoppingCart size={24} />
        </button>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendAction()} placeholder="แสดงความคิดเห็น..." className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" />
        <button onClick={handleSendAction} className="p-2.5 rounded-full bg-orange-500 hover:bg-orange-600 transition-all shadow-lg text-white">
          <Send size={24} />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MAIN APP & UTILS
// ==========================================

const FloatingSticker = ({ src, size = "w-20 h-20", delay = "0s", visible = true }) => {
  // ไม่ render อะไรเลยถ้าไม่มี src หรือไม่ได้ให้ visible
  if (!src) return null;
  return (
    <div className={`${size} animate-float-bob filter drop-shadow-xl transition-all duration-500 ease-in-out`} style={{ animationDelay: delay, opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0)' }}>
      <img src={src} alt="sticker" className="w-full h-full object-contain" />
    </div>
  );
};

// --- Like Stream ฝั่งขวา ---
const LikeStream = ({ isVisible }) => {
  const [hearts, setHearts] = useState([]);
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      const newHeart = { id: Date.now(), left: Math.random() * 90, animationDuration: Math.random() * 2 + 3 + 's', scale: Math.random() * 0.7 + 0.8 };
      setHearts(prev => [...prev, newHeart]);
      setTimeout(() => { setHearts(prev => prev.filter(h => h.id !== newHeart.id)); }, 4000);
    }, 300);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;
  return (
    <div className="hidden md:block absolute bottom-24 right-0 w-48 h-96 pointer-events-none z-0 overflow-hidden">
      {hearts.map(heart => (
        <div key={heart.id} className="absolute bottom-0 w-14 h-14 animate-float-up-fade" style={{ left: `${heart.left}%`, animationDuration: heart.animationDuration, transform: `scale(${heart.scale})` }}>
          <img src={STICKER_ASSETS.LIKE_HEART} alt="like" className="w-full h-full object-contain opacity-90" />
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [visibleComments, setVisibleComments] = useState([]);
  const [commentIndex, setCommentIndex] = useState(1);
  const [viewerCount, setViewerCount] = useState(1250);
  const [showAutoLikes, setShowAutoLikes] = useState(true);

  // --- เปลี่ยนระบบสติ๊กเกอร์ฝั่งขวา ---
  // ให้ activeSticker เก็บ ID ของสติ๊กเกอร์ที่ใช้อยู่ เช่น 'PRE499' หรือ 'THUMBS_UP' (ถ้าเป็น null คือซ่อน)
  const [activeSticker, setActiveSticker] = useState('PRE499');
  // เก็บสถานะว่าโดยรวมเปิดหรือปิดการโชว์สติ๊กเกอร์อยู่ (ใช้ร่วมกับปุ่ม H)
  const [isStickerVisible, setIsStickerVisible] = useState(true);

  const [showSettings, setShowSettings] = useState(false);
  const [bgMode, setBgMode] = useState('video');
  const [bgColor, setBgColor] = useState('#FF00FF');
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isAutoFlowing, setIsAutoFlowing] = useState(false);
  const [showProductCard, setShowProductCard] = useState(true);

  // Effects (Comment Flow)

  // --- ตัวที่ 1: ต้องเก็บไว้! (ทำหน้าที่เอาคอมเมนต์ใหม่ไปต่อท้ายเพื่อโชว์บนจอ) ---
  useEffect(() => {
    if (commentIndex > 1 && commentIndex <= MOCK_DATA.length) {
      setVisibleComments(prev => [...prev, MOCK_DATA[commentIndex - 1]]);
    }
  }, [commentIndex]);

  // --- ตัวที่ 2: โค้ดใหม่ Dynamic Delay (หน่วงเวลาตามบท) ---
  useEffect(() => {
    let timeoutId;

    const showNextComment = () => {
      setCommentIndex(prev => {
        // ถ้าถึงข้อความสุดท้ายแล้ว ให้หยุด Auto
        if (prev >= MOCK_DATA.length) {
          setIsAutoFlowing(false);
          return prev;
        }

        // ดึงค่า delay ของข้อความ 'ปัจจุบัน' (เพื่อหน่วงเวลาก่อนจะโชว์ข้อความถัดไป)
        // ถ้าในข้อมูลไม่ได้ใส่ delay ไว้ ให้ใช้ค่าเริ่มต้น 6000 ms (6 วินาที)
        const currentDelay = MOCK_DATA[prev - 1]?.delay || 6000;

        timeoutId = setTimeout(showNextComment, currentDelay);
        return prev + 1;
      });
    };

    if (isAutoFlowing) {
      // เริ่มทำงานทันทีที่กด Auto แล้วค่อยหน่วงเวลา
      showNextComment();
    }

    return () => clearTimeout(timeoutId);
  }, [isAutoFlowing]);

  // Effects (Viewer Count)
  useEffect(() => {
    let timeoutId;
    const updateViewerCount = () => {
      setViewerCount(prev => {
        const MIN = 1250, MAX = 3500;
        let change = Math.floor(Math.random() * 36) - 15;
        if (prev < MIN) change = Math.abs(change) + 5;
        else if (prev > MAX) change = -Math.abs(change) - 5;
        return prev + change;
      });
      timeoutId = setTimeout(updateViewerCount, Math.random() * 1900 + 100);
    };
    updateViewerCount();
    return () => clearTimeout(timeoutId);
  }, []);

  // Effects (Keyboard Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); setCommentIndex(prev => prev < MOCK_DATA.length ? prev + 1 : prev); }
      if (e.key === 'r' || e.key === 'R') window.location.reload();

      // --- อัปเดต Hotkeys สำหรับ Sticker ---
      // กด 4: สลับไปมา ระหว่าง PRE499 กับ THUMBS_UP
      if (e.key === '4' || e.key === '๔') {
        setActiveSticker(prev => prev === 'PRE499' ? 'THUMBS_UP' : 'PRE499');
      }
      // กด H (หรือ ้): เปิด/ปิดการแสดงผลสติ๊กเกอร์ทั้งหมด
      if (e.key === 'h' || e.key === 'H' || e.key === '้') {
        setIsStickerVisible(prev => !prev);
      }

      if (e.key === 'c' || e.key === 'C') setShowSettings(prev => !prev);
      if (e.key === 'a' || e.key === 'A') setIsAutoFlowing(prev => !prev);
      if (e.key === 's' || e.key === 'S') setShowProductCard(prev => !prev);
      // กด Y (หรือ ั) เพื่อเปิด/ปิด Like Stream ฝั่งขวา
      if (e.key === 'y' || e.key === 'Y' || e.key === 'ั') setShowAutoLikes(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black touch-none font-sans">
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

      {/* --- LAYER 1: BACKGROUND --- */}
      <VideoBackground mode={bgMode} color={bgColor} selectedDeviceId={selectedDeviceId} />

      {/* --- LAYER 2: OVERLAYS --- */}
      <SettingsMenu isOpen={showSettings} onClose={() => setShowSettings(false)} mode={bgMode} setMode={setBgMode} color={bgColor} setColor={setBgColor} currentDeviceId={selectedDeviceId} setDeviceId={setSelectedDeviceId} />
      <Header username={MOCK_DATA[0].username} profilePicture={MOCK_DATA[0].profilePicture} viewerCount={viewerCount} onSettingsClick={() => setShowSettings(p => !p)} isAutoActive={isAutoFlowing} />

      {/* สติ๊กเกอร์ (สลับรูปภาพตาม state activeSticker) */}
      <div className="hidden md:flex absolute top-40 right-6 z-10 flex-col gap-8 pointer-events-none">
        <FloatingSticker
          // เลือก asset ตามค่า activeSticker
          src={STICKER_ASSETS[activeSticker]}
          // ปรับขนาดถ้าเป็น THUMBS_UP ให้ใหญ่หน่อย (คุณปรับแต่งขนาดตรงนี้ได้)
          size={activeSticker === 'THUMBS_UP' ? "w-24 h-24" : "w-20 h-20"}
          delay="0s"
          visible={isStickerVisible} // โชว์หรือซ่อนขึ้นอยู่กับ state isStickerVisible (ปุ่ม H)
        />
      </div>

      {/* --- LIKE STREAM --- */}
      <LikeStream isVisible={showAutoLikes} />

      {/* --- LAYER 3: SECTIONS --- */}
      {showProductCard && <ShoppingCartCard item={PRODUCT_DATA} onClose={() => setShowProductCard(false)} />}

      <CommentList comments={visibleComments} hasProductCard={showProductCard} />

      <InputBar isAutoActive={isAutoFlowing} onToggleAuto={() => setIsAutoFlowing(p => !p)} onToggleProduct={() => setShowProductCard(p => !p)} />

    </div>
  );
}