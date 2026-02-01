import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, Settings, CheckSquare, 
  Volume2, VolumeX, Palette, Music, Sun, Moon, 
  Zap, Bell, ListChecks, Trash2, Plus, CheckCircle2,
  Headphones
} from 'lucide-react';
import lofiSound from './assets/music/lo-fi-chill.mp3';
import digitalAlarm from './assets/alarm/digital.mp3';

const App = () => {
  // --- State Utama ---
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // --- Settings State ---
  const [settings, setSettings] = useState({
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    alarmSound: 'digital',
    theme: 'dark',
    background: 'gradient-purple',
    musicTrack: 'lofi',
    alarmVolume: 0.6,
    musicVolume: 0.4
  });

  // State untuk feedback visual "Tersimpan"
  const [isSaved, setIsSaved] = useState(false);

  // Hitung waktu berdasarkan mode (dalam detik)
  const modeTimes = useMemo(() => ({
    pomodoro: settings.pomodoroTime * 60,
    shortBreak: settings.shortBreakTime * 60,
    longBreak: settings.longBreakTime * 60
  }), [settings.pomodoroTime, settings.shortBreakTime, settings.longBreakTime]);

  const [timeLeft, setTimeLeft] = useState(modeTimes.pomodoro);

  // --- Task State ---
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Selesaikan sesi fokus pertama', completed: true },
    { id: 2, text: 'Minum air putih', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');

  // --- UI State ---
  const [showSettings, setShowSettings] = useState(false);
  const [showTasks, setShowTasks] = useState(true);

  // --- Audio Refs ---
  const alarmAudio = useRef(null);
  const bgMusicAudio = useRef(null);

  // --- Data Aset ---
  const musicList = [
    { id: 'none', name: 'No Music', url: null },
    { id: 'lofi', name: '🎧 Lo-fi Chill', url: lofiSound },
    { id: 'jazz', name: '☕ Jazz Coffee', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { id: 'study', name: '📖 Study Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 'rain', name: '🌧️ Deep Rain', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' }
  ];

  const backgrounds = [
    { id: 'gradient-purple', name: 'Purple Dream', class: 'from-purple-600 via-pink-500 to-orange-400' },
    { id: 'gradient-blue', name: 'Ocean Vibes', class: 'from-blue-600 via-teal-500 to-emerald-400' },
    { id: 'gradient-midnight', name: 'Midnight', class: 'from-gray-900 via-blue-900 to-purple-900' },
    { id: 'gradient-sunset', name: 'Sunset Bloom', class: 'from-orange-500 via-red-500 to-purple-600' },
    { id: 'gradient-noir', name: 'Crimson Noir', class: 'from-black via-red-950 to-red-800' }, // Tema Hitam Merah
    { id: 'gradient-slate', name: 'Quiet Stone', class: 'from-zinc-900 via-slate-900 to-stone-900' } // Tema Netral
  ];

  const alarmSounds = {
    bell: 'https://assets.mixkit.co/sfx/preview/mixkit-classic-alarm-995.mp3',
    digital: digitalAlarm,
    chime: 'https://assets.mixkit.co/sfx/preview/mixkit-wind-chime-599.mp3',
    minimal: 'https://assets.mixkit.co/sfx/preview/mixkit-simple-notification-alert-2630.mp3'
  };

  // --- Logika Timer ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    if (alarmAudio.current && alarmSounds[settings.alarmSound]) {
      alarmAudio.current.volume = settings.alarmVolume;
      alarmAudio.current.currentTime = 0;
      alarmAudio.current.play().catch((e) => console.warn("Audio play blocked", e));
    }

    if (mode === 'pomodoro') {
      const nextCount = completedPomodoros + 1;
      setCompletedPomodoros(nextCount);
      const isLongBreak = nextCount % 4 === 0;
      const nextMode = isLongBreak ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(modeTimes[nextMode]);
      if (settings.autoStartBreaks) setIsActive(true);
    } else {
      setMode('pomodoro');
      setTimeLeft(modeTimes.pomodoro);
      if (settings.autoStartPomodoros) setIsActive(true);
    }
  };

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(modeTimes[mode]);
    }
  }, [modeTimes, mode]);

  useEffect(() => {
    const currentTrack = musicList.find(m => m.id === settings.musicTrack);
    if (bgMusicAudio.current) {
      bgMusicAudio.current.volume = settings.musicVolume;

      bgMusicAudio.current.load();

      if (isMusicPlaying && currentTrack && currentTrack.url) {
        bgMusicAudio.current.play().catch(() => setIsMusicPlaying(false));
      } else {
        bgMusicAudio.current.pause();
      }
    }
  }, [settings.musicVolume, isMusicPlaying, settings.musicTrack]);

  useEffect(() => {
    if (alarmAudio.current) {
      alarmAudio.current.load();
    }
  }, [settings.alarmSound]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(modeTimes[mode]); };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const playTestAlarm = () => {
    if (alarmAudio.current && alarmSounds[settings.alarmSound]) {
      alarmAudio.current.volume = settings.alarmVolume;
      alarmAudio.current.currentTime = 0;
      alarmAudio.current.play().catch(e => console.error("Test play failed", e));
    }
  };

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => { setIsSaved(false); setShowSettings(false); }, 800);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((modeTimes[mode] - timeLeft) / modeTimes[mode]) * 100;
  const currentBg = backgrounds.find(b => b.id === settings.background) || backgrounds[0];
  const sessionsToLongBreak = 4 - (completedPomodoros % 4);
  const currentMusicUrl = musicList.find(m => m.id === settings.musicTrack)?.url;

  return (
    <div className={`min-h-screen transition-all duration-700 flex flex-col font-sans bg-gradient-to-br ${currentBg.class} ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      
      <audio ref={bgMusicAudio} src={currentMusicUrl || undefined} loop preload="auto" />
      <audio ref={alarmAudio} src={alarmSounds[settings.alarmSound] || undefined} preload="auto" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-2xl group-hover:scale-110 transition">
            <Zap className="text-yellow-300" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">FocusFlow</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Gen-Z Productivity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMusicPlaying(!isMusicPlaying)}
            disabled={settings.musicTrack === 'none'}
            className={`p-3 rounded-2xl backdrop-blur-md transition-all ${isMusicPlaying ? 'bg-pink-500 shadow-lg shadow-pink-500/30' : 'bg-white/10 hover:bg-white/20'} ${settings.musicTrack === 'none' ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row items-center justify-center p-6 gap-8 max-w-7xl mx-auto w-full">
        
        {/* Timer Section */}
        <section className="flex-grow flex flex-col items-center justify-center w-full max-w-xl">
          <div className="w-full bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 border border-white/20 shadow-2xl">
            
            <div className="flex bg-black/20 p-1.5 rounded-2xl mb-12 w-fit mx-auto">
              {['pomodoro', 'shortBreak', 'longBreak'].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setIsActive(false); }}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === m ? 'bg-white text-black shadow-xl scale-105' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                >
                  {m === 'pomodoro' ? 'Focus' : m === 'shortBreak' ? 'Short' : 'Long'}
                </button>
              ))}
            </div>

            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto group">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="48%" stroke="currentColor" strokeWidth="6" fill="transparent" className="opacity-10" />
                <circle 
                  cx="50%" cy="50%" r="48%" stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray="100 100"
                  style={{ strokeDasharray: '301.5', strokeDashoffset: 301.5 - (301.5 * progress) / 100 }}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-7xl md:text-8xl font-black font-mono tracking-tighter">{formatTime(timeLeft)}</span>
                <div className={`mt-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}>
                  {isActive ? 'Live Now' : 'Paused'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-12">
              <button onClick={resetTimer} className="p-4 bg-white/10 rounded-3xl hover:bg-white/20 transition-all hover:rotate-[-45deg]">
                <RotateCcw size={24} />
              </button>
              <button onClick={toggleTimer} className="w-24 h-24 bg-white text-black rounded-[2.5rem] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
              </button>
              <button onClick={() => setShowTasks(!showTasks)} className={`p-4 rounded-3xl transition-all ${showTasks ? 'bg-pink-500/20 text-pink-300' : 'bg-white/10 hover:bg-white/20'}`}>
                <ListChecks size={24} />
              </button>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-3xl p-4 border border-white/5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Sessions</p>
                <p className="text-2xl font-black">{completedPomodoros} 🍅</p>
              </div>
              <div className="bg-white/5 rounded-3xl p-4 border border-white/5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Till Long Break</p>
                <p className="text-2xl font-black">{sessionsToLongBreak} <span className="text-sm opacity-50">left</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Task Section */}
        {showTasks && (
          <aside className="w-full lg:w-96 h-fit bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/20 shadow-2xl animate-in slide-in-from-right-10 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black flex items-center gap-2"><CheckSquare className="text-pink-400" /> Focus List</h2>
              <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-bold uppercase">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
            </div>
            <div className="relative mb-6">
              <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="What's the vibe today?" className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-white/30 transition placeholder:opacity-30" />
              <button onClick={addTask} className="absolute right-2 top-2 p-2.5 bg-white text-black rounded-xl hover:scale-105 transition"><Plus size={20} /></button>
            </div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.map(task => (
                <div key={task.id} className="group flex items-center gap-3 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition border border-transparent hover:border-white/10">
                  <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 text-white' : 'bg-white/10 border border-white/20'}`}>{task.completed && <CheckCircle2 size={14} />}</button>
                  <span className={`flex-grow text-sm font-medium ${task.completed ? 'line-through opacity-40' : ''}`}>{task.text}</span>
                  <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </aside>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-white/10 w-full max-w-lg rounded-[3rem] p-8 shadow-3xl text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3"><Settings className="text-pink-500" /> App Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-3 hover:bg-white/10 rounded-2xl transition">✕</button>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[65vh] pr-4 pl-4 custom-scrollbar">
              <div className="grid grid-cols-3 gap-4">
                {['pomodoro', 'shortBreak', 'longBreak'].map((field) => (
                  <div key={field}>
                    <label className="block text-[10px] font-black uppercase opacity-40 mb-2">{field.replace('Time', '')}</label>
                    <input type="number" value={settings[`${field}Time`]} onChange={(e) => setSettings({...settings, [`${field}Time`]: parseInt(e.target.value) || 1})} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500" />
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black uppercase opacity-40 flex items-center gap-2"><Bell size={12}/> Alarm Volume</label>
                    <span className="text-xs font-bold">{Math.round(settings.alarmVolume * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={settings.alarmVolume} onChange={(e) => setSettings({...settings, alarmVolume: parseFloat(e.target.value)})} className="w-full accent-pink-500" />
                </div>
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black uppercase opacity-40 flex items-center gap-2"><Music size={12}/> Backsound Volume</label>
                    <span className="text-xs font-bold">{Math.round(settings.musicVolume * 100)}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.01" value={settings.musicVolume} onChange={(e) => setSettings({...settings, musicVolume: parseFloat(e.target.value)})} className="w-full accent-teal-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-black uppercase opacity-40">Alarm Ringtone</label>
                  <button onClick={playTestAlarm} className="text-[10px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1"><Bell size={12} /> Test Sound</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(alarmSounds).map(s => (
                    <button key={s} onClick={() => setSettings({...settings, alarmSound: s})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${settings.alarmSound === s ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 border-white/10 opacity-60'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase opacity-40 mb-4 flex items-center gap-2"><Headphones size={12}/> Vibe Track</label>
                <div className="grid grid-cols-2 gap-2">
                  {musicList.map(track => (
                    <button key={track.id} onClick={() => setSettings({...settings, musicTrack: track.id})} className={`px-3 py-3 rounded-xl text-[11px] font-bold transition-all border ${settings.musicTrack === track.id ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-white/5 border-white/10 opacity-60'}`}>{track.name}</button>
                  ))}
                </div>
              </div>

              {/* Atmosphere Section with New Themes */}
              <div>
                <label className="block text-[10px] font-black uppercase opacity-40 mb-4">Atmosphere</label>
                <div className="grid grid-cols-2 gap-3">
                  {backgrounds.map(bg => {
                    const isSelected = settings.background === bg.id;
                    return (
                      <button
                        key={bg.id}
                        onClick={() => setSettings({...settings, background: bg.id})}
                        className={`h-16 rounded-2xl bg-gradient-to-br ${bg.class} relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] border-2 ${isSelected ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black uppercase tracking-wider drop-shadow-md">{bg.name}</span>
                            {isSelected && <CheckCircle2 size={14} className="text-white drop-shadow-md" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Auto-start Breaks</span>
                  <button onClick={() => setSettings({...settings, autoStartBreaks: !settings.autoStartBreaks})} className={`w-12 h-6 rounded-full transition-all relative ${settings.autoStartBreaks ? 'bg-green-500' : 'bg-white/10'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoStartBreaks ? 'left-7' : 'left-1'}`} /></button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Auto-start Pomodoros</span>
                  <button onClick={() => setSettings({...settings, autoStartPomodoros: !settings.autoStartPomodoros})} className={`w-12 h-6 rounded-full transition-all relative ${settings.autoStartPomodoros ? 'bg-green-500' : 'bg-white/10'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoStartPomodoros ? 'left-7' : 'left-1'}`} /></button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <button onClick={handleSaveSettings} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-green-500' : 'bg-white text-black hover:scale-[1.02]'}`}>{isSaved ? <><CheckCircle2 size={20} /> Changes Saved!</> : 'Save & Close'}</button>
              <p className="text-[10px] text-center opacity-30 font-bold uppercase">All changes are synced in real-time</p>
            </div>
          </div>
        </div>
      )}

      <footer className="p-6 text-center opacity-40 text-[10px] font-bold uppercase tracking-widest">Designed for Deep Focus & Chill Vibes • {mode.replace('Break', ' Break')} Mode Active</footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } @keyframes slide-in-from-right-10 { from { transform: translateX(10%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } .animate-in { animation: fade-in 0.3s ease-out; }`}</style>
    </div>
  );
};

export default App;