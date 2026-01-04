import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, CheckSquare, Volume2, VolumeX, Palette, Music, Sun, Moon, Zap, Bell, ListChecks } from 'lucide-react';

const PomodoroApp = () => {
  // State utama
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 menit dalam detik
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // State untuk settings
  const [settings, setSettings] = useState({
    pomodoroTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    sound: 'bell',
    theme: 'light',
    background: 'gradient-purple',
    music: 'none',
    autoPlayMusic: false,
    volume: 0.5 // Tambah volume control
  });
  
  // State untuk tasks
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Buat landing page pomodoro', completed: true },
    { id: 2, text: 'Implementasi timer dengan React', completed: true },
    { id: 3, text: 'Tambahkan fitur task manager', completed: false },
    { id: 4, text: 'Integrasi background music', completed: false },
    { id: 5, text: 'Testing semua fitur aplikasi', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');
  
  // State untuk UI
  const [showSettings, setShowSettings] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  
  // Refs untuk audio
  const alarmSound = useRef(null);
  const backgroundMusic = useRef(null);
  
  // Waktu untuk setiap mode
  const modeTimes = {
    pomodoro: settings.pomodoroTime * 60,
    shortBreak: settings.shortBreakTime * 60,
    longBreak: settings.longBreakTime * 60
  };
  
  // Daftar suara alarm
  const alarmSounds = [
    { id: 'bell', name: 'Bell Classic', icon: <Bell size={16} /> },
    { id: 'digital', name: 'Digital Beep' },
    { id: 'chime', name: 'Wind Chime' },
    { id: 'buzzer', name: 'Soft Buzzer' }
  ];
  
  // Daftar musik background
  const backgroundMusicList = [
    { id: 'none', name: 'Tidak ada musik' },
    { id: 'lofi1', name: '🎵 Lofi Chill Vibes' },
    { id: 'lofi2', name: '🎧 Lofi Study Beats' },
    { id: 'jazz1', name: '☕ Jazz Coffee Shop' },
    { id: 'jazz2', name: '🎹 Smooth Jazz Piano' }
  ];
  
  // Daftar tema background
  const backgrounds = [
    { id: 'gradient-purple', name: 'Purple Gradient', class: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { id: 'gradient-blue', name: 'Blue Ocean', class: 'bg-gradient-to-br from-blue-400 to-teal-300' },
    { id: 'gradient-sunset', name: 'Sunset Vibes', class: 'bg-gradient-to-br from-orange-400 to-red-500' },
    { id: 'gradient-midnight', name: 'Midnight', class: 'bg-gradient-to-br from-gray-900 to-blue-900' },
    { id: 'gradient-forest', name: 'Forest Green', class: 'bg-gradient-to-br from-green-500 to-emerald-700' },
    { id: 'gradient-cotton', name: 'Cotton Candy', class: 'bg-gradient-to-br from-pink-300 to-blue-300' },
    { id: 'gradient-space', name: 'Deep Space', class: 'bg-gradient-to-br from-indigo-900 to-purple-900' },
    { id: 'gradient-coral', name: 'Coral Reef', class: 'bg-gradient-to-br from-rose-400 to-orange-300' }
  ];
  
  // Format waktu (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Persentase waktu tersisa untuk progress bar
  const progressPercentage = 100 - (timeLeft / modeTimes[mode] * 100);
  
  // Handle volume changes
  useEffect(() => {
    if (alarmSound.current) {
      alarmSound.current.volume = settings.volume;
    }
    if (backgroundMusic.current) {
      backgroundMusic.current.volume = settings.volume;
    }
  }, [settings.volume]);
  
  // Handle timer logic - FIXED VERSION
  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer selesai
      if (alarmSound.current) {
        // Reset sebelum play untuk menghindari bug
        alarmSound.current.currentTime = 0;
        alarmSound.current.play();
      }
      
      // Tambah completed pomodoros jika mode pomodoro - FIXED ASYNC ISSUE
      if (mode === 'pomodoro') {
        setCompletedPomodoros(prev => {
          const nextCount = prev + 1;
          
          // Auto start sesuai settings
          if (settings.autoStartBreaks) {
            const nextMode = (nextCount % 4 === 0) ? 'longBreak' : 'shortBreak';
            // Gunakan setTimeout untuk menghindari race condition
            setTimeout(() => {
              setMode(nextMode);
              setTimeLeft(modeTimes[nextMode]);
              setIsActive(true);
            }, 100);
          }
          
          return nextCount;
        });
      } else if (mode !== 'pomodoro' && settings.autoStartPomodoros) {
        // Auto start pomodoro setelah break
        setTimeout(() => {
          setMode('pomodoro');
          setTimeLeft(modeTimes.pomodoro);
          setIsActive(true);
        }, 100);
      } else {
        setIsActive(false);
      }
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, settings, modeTimes]);
  
  // Handle perubahan musik background
  useEffect(() => {
    if (settings.music !== 'none' && backgroundMusic.current) {
      backgroundMusic.current.volume = settings.volume;
      
      if (settings.autoPlayMusic && isActive) {
        backgroundMusic.current.play().then(() => {
          setIsMusicPlaying(true);
        }).catch(error => {
          console.log("Autoplay prevented:", error);
          // User perlu interaksi dulu untuk autoplay
        });
      } else {
        backgroundMusic.current.pause();
        setIsMusicPlaying(false);
      }
    }
  }, [settings.music, settings.autoPlayMusic, isActive, settings.volume]);
  
  // Handle perubahan mode
  useEffect(() => {
    setTimeLeft(modeTimes[mode]);
    setIsActive(false);
  }, [mode, settings.pomodoroTime, settings.shortBreakTime, settings.longBreakTime]);
  
  // Control tombol timer - ENHANCED VERSION
  const toggleTimer = () => {
    if (!isActive) {
      // Mulai timer
      setIsActive(true);
      
      // Auto play musik jika setting aktif
      if (settings.autoPlayMusic && settings.music !== 'none' && backgroundMusic.current) {
        backgroundMusic.current.play().then(() => {
          setIsMusicPlaying(true);
        }).catch(error => {
          console.log("Playback prevented, user needs to interact first");
        });
      }
    } else {
      // Pause timer
      setIsActive(false);
      
      // Juga pause musik jika sedang main
      if (backgroundMusic.current && !backgroundMusic.current.paused) {
        backgroundMusic.current.pause();
        setIsMusicPlaying(false);
      }
    }
  };
  
  // Toggle musik manual
  const toggleMusic = () => {
    if (backgroundMusic.current && settings.music !== 'none') {
      if (backgroundMusic.current.paused) {
        backgroundMusic.current.play().then(() => {
          setIsMusicPlaying(true);
        });
      } else {
        backgroundMusic.current.pause();
        setIsMusicPlaying(false);
      }
    }
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modeTimes[mode]);
    
    // Juga reset musik
    if (backgroundMusic.current) {
      backgroundMusic.current.pause();
      backgroundMusic.current.currentTime = 0;
      setIsMusicPlaying(false);
    }
  };
  
  const selectMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
  };
  
  // Handle settings
  const updateSettings = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };
  
  const toggleTheme = () => {
    updateSettings('theme', settings.theme === 'light' ? 'dark' : 'light');
  };
  
  // Handle tasks
  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };
  
  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // Render
  const currentBackground = backgrounds.find(bg => bg.id === settings.background) || backgrounds[0];
  
  return (
    <div className={`min-h-screen transition-colors duration-500 ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'} ${currentBackground.class}`}>
      {/* Background Music */}
      <audio 
        ref={backgroundMusic} 
        src={`https://assets.mixkit.co/music/preview/mixkit-chill-abstract-125-${settings.music === 'lofi1' ? '76' : settings.music === 'lofi2' ? '124' : settings.music === 'jazz1' ? '45' : '32'}.mp3`} 
        loop 
        onEnded={() => setIsMusicPlaying(false)}
        onPause={() => setIsMusicPlaying(false)}
        onPlay={() => setIsMusicPlaying(true)}
      />
      
      {/* Alarm Sound */}
      <audio 
        ref={alarmSound} 
        src={`https://assets.mixkit.co/sfx/preview/mixkit-${settings.sound === 'bell' ? 'bell' : settings.sound === 'digital' ? 'digital' : settings.sound === 'chime' ? 'wind' : 'buzzer'}-notification-${settings.sound === 'bell' ? '579' : settings.sound === 'digital' ? '952' : settings.sound === 'chime' ? '599' : '589'}.mp3`} 
        preload="auto"
      />
      
      {/* Header */}
      <header className="pt-6 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center mr-3 animate-pulse">
            <Zap size={24} className="text-yellow-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">FocusFlow</h1>
            <span className="text-xs md:text-sm opacity-80">Stay focused, slay tasks ✨</span>
          </div>
          <span className="ml-3 px-3 py-1 rounded-full bg-white/20 text-xs font-medium">GenZ Edition</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Volume Control */}
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
            <button 
              onClick={toggleMusic}
              className="hover:scale-110 transition-transform"
              disabled={settings.music === 'none'}
              title={settings.music === 'none' ? 'Pilih musik dulu' : isMusicPlaying ? 'Mute musik' : 'Putar musik'}
            >
              {isMusicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => updateSettings('volume', parseFloat(e.target.value))}
              className="w-20 accent-pink-500"
              title="Volume control"
            />
            <span className="text-xs w-8">{Math.round(settings.volume * 100)}%</span>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition hover:scale-110"
            aria-label="Toggle theme"
            title="Ganti tema"
          >
            {settings.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <button 
            onClick={() => setShowTasks(!showTasks)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition hover:scale-110"
            aria-label="Toggle task list"
            title={showTasks ? 'Sembunyikan tasks' : 'Tampilkan tasks'}
          >
            <ListChecks size={20} />
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition hover:scale-110"
            aria-label="Settings"
            title="Pengaturan"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Bagian Kiri - Timer */}
          <div className="lg:w-2/3">
            {/* Timer Container */}
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl mb-8 border border-white/10">
              {/* Mode Selector */}
              <div className="flex justify-center mb-8">
                <div className="bg-black/20 rounded-2xl p-2 flex flex-wrap justify-center gap-2">
                  <button 
                    onClick={() => selectMode('pomodoro')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${mode === 'pomodoro' ? 'bg-pink-500 shadow-lg' : 'hover:bg-white/10'}`}
                  >
                    Pomodoro ({settings.pomodoroTime} min)
                  </button>
                  <button 
                    onClick={() => selectMode('shortBreak')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${mode === 'shortBreak' ? 'bg-teal-500 shadow-lg' : 'hover:bg-white/10'}`}
                  >
                    Short Break ({settings.shortBreakTime} min)
                  </button>
                  <button 
                    onClick={() => selectMode('longBreak')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center ${mode === 'longBreak' ? 'bg-purple-500 shadow-lg' : 'hover:bg-white/10'}`}
                  >
                    Long Break ({settings.longBreakTime} min)
                  </button>
                </div>
              </div>
              
              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  {/* Progress Circle */}
                  <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
                    <div className="absolute inset-0 rounded-full border-8 border-white/20"></div>
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-white border-t-transparent transition-all duration-1000 ease-linear"
                      style={{ 
                        transform: `rotate(${progressPercentage * 3.6}deg)`,
                        borderColor: mode === 'pomodoro' ? '#ec4899' : mode === 'shortBreak' ? '#14b8a6' : '#a855f7'
                      }}
                    ></div>
                    
                    {/* Timer Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-6xl md:text-8xl font-bold tracking-tight mb-2 font-mono">
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-xl font-medium bg-white/10 px-6 py-2 rounded-full">
                        {mode === 'pomodoro' ? 'Focus Time! 🔥' : mode === 'shortBreak' ? 'Take a short break ☕' : 'Relax & recharge 🌴'}
                      </div>
                      {isActive && (
                        <div className="mt-4 text-sm opacity-80 animate-pulse">
                          ⏳ Timer berjalan...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timer Controls */}
              <div className="flex justify-center space-x-4 md:space-x-6 mb-6 flex-wrap">
                <button 
                  onClick={toggleTimer}
                  className="px-8 md:px-10 py-4 rounded-2xl bg-white text-gray-900 font-bold text-lg flex items-center justify-center hover:scale-105 transition-transform shadow-lg hover:shadow-xl active:scale-95"
                >
                  {isActive ? (
                    <>
                      <Pause size={24} className="mr-2" /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={24} className="mr-2" /> Start
                    </>
                  )}
                </button>
                
                <button 
                  onClick={resetTimer}
                  className="px-6 py-4 rounded-2xl bg-white/20 font-bold text-lg flex items-center justify-center hover:bg-white/30 transition hover:scale-105 active:scale-95"
                >
                  <RotateCcw size={20} className="mr-2" /> Reset
                </button>
                
                {/* Quick Test Alarm Button */}
                <button 
                  onClick={() => {
                    if (alarmSound.current) {
                      alarmSound.current.currentTime = 0;
                      alarmSound.current.play();
                    }
                  }}
                  className="px-4 py-4 rounded-2xl bg-yellow-500/80 font-bold text-lg flex items-center justify-center hover:bg-yellow-500 transition hover:scale-105 active:scale-95"
                  title="Test alarm sound"
                >
                  <Bell size={20} />
                </button>
              </div>
              
              {/* Stats Section */}
              <div className="text-center">
                <div className="inline-flex items-center bg-white/20 rounded-full px-6 py-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center mr-3 animate-bounce">
                    <span className="font-bold text-xl">✓</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm opacity-80">Completed Pomodoros</div>
                    <div className="font-bold text-2xl">{completedPomodoros}</div>
                  </div>
                  <div className="ml-6 text-left">
                    <div className="text-sm opacity-80">Next Long Break</div>
                    <div className="font-bold text-xl">{4 - (completedPomodoros % 4)} 🍅 lagi</div>
                  </div>
                </div>
                <div className="text-sm opacity-80">
                  {completedPomodoros % 4 === 3 ? 
                    "🎉 Satu pomodoro lagi dapat long break!" : 
                    "Setiap 4 pomodoro, dapatkan long break lebih panjang!"}
                </div>
              </div>
            </div>
            
            {/* Background Music Controls */}
            <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Music size={24} className="mr-3" />
                  <h2 className="text-xl font-bold">Background Music</h2>
                </div>
                <div className="text-xs px-3 py-1 bg-white/20 rounded-full">
                  {isMusicPlaying ? '🎵 Now Playing' : '⏸️ Paused'}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {backgroundMusicList.map(music => (
                  <button
                    key={music.id}
                    onClick={() => updateSettings('music', music.id)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center ${settings.music === music.id ? 'bg-white/30 ring-2 ring-white/50' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    {music.name}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateSettings('autoPlayMusic', !settings.autoPlayMusic)}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center ${settings.autoPlayMusic ? 'bg-green-500' : 'bg-white/10'}`}
                  >
                    {settings.autoPlayMusic ? '✅ Auto Play: ON' : '⏸️ Auto Play: OFF'}
                  </button>
                  
                  <button
                    onClick={toggleMusic}
                    disabled={settings.music === 'none'}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center ${settings.music === 'none' ? 'bg-gray-500/50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {isMusicPlaying ? <VolumeX size={18} className="mr-2" /> : <Volume2 size={18} className="mr-2" />}
                    {isMusicPlaying ? 'Pause Music' : 'Play Music'}
                  </button>
                </div>
                
                <span className="text-sm opacity-80 hidden md:block">
                  🎧 Putar musik lo-fi/jazz untuk meningkatkan fokus
                </span>
              </div>
            </div>
          </div>
          
          {/* Bagian Kanan - Tasks & Settings */}
          <div className="lg:w-1/3">
            {/* Tasks Panel */}
            {showTasks && (
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-2xl mb-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <CheckSquare size={24} className="mr-3" />
                    <h2 className="text-xl font-bold">Task List</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-white/30 px-3 py-1 rounded-full text-sm">
                      {tasks.filter(t => t.completed).length}/{tasks.length}
                    </span>
                    <span className="text-xs opacity-70">
                      {tasks.filter(t => !t.completed).length} pending
                    </span>
                  </div>
                </div>
                
                {/* Add New Task */}
                <div className="flex mb-6">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="✏️ Add new task..."
                    className="flex-grow bg-white/20 border border-white/30 rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                  />
                  <button
                    onClick={addTask}
                    className="bg-pink-500 hover:bg-pink-600 px-5 rounded-r-xl font-semibold transition hover:scale-105 active:scale-95"
                  >
                    Add
                  </button>
                </div>
                
                {/* Task List */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 opacity-70">
                      <div className="text-4xl mb-2">📝</div>
                      <p>No tasks yet. Add one!</p>
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-center bg-white/10 rounded-xl p-4 hover:bg-white/15 transition group"
                      >
                        <button
                          onClick={() => toggleTaskCompletion(task.id)}
                          className={`w-7 h-7 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-white/50 hover:border-white'}`}
                          title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {task.completed && <span className="text-white">✓</span>}
                        </button>
                        <span className={`flex-grow ${task.completed ? 'line-through opacity-70' : ''}`}>
                          {task.text}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="ml-2 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete task"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-6 text-sm opacity-80 flex justify-between items-center">
                  <span>✅ Selesaikan task untuk unlock achievements!</span>
                  {tasks.filter(t => t.completed).length === tasks.length && tasks.length > 0 && (
                    <span className="text-green-300 animate-pulse">🎉 All tasks completed!</span>
                  )}
                </div>
              </div>
            )}
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Settings size={24} className="mr-3" />
                    <h2 className="text-xl font-bold">Settings</h2>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-sm opacity-70 hover:opacity-100"
                  >
                    ✕ Close
                  </button>
                </div>
                
                {/* Timer Durations */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3 flex items-center">
                    ⏱️ Timer Durations (minutes)
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Pomodoro</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.pomodoroTime}
                        onChange={(e) => updateSettings('pomodoroTime', parseInt(e.target.value) || 1)}
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Short Break</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.shortBreakTime}
                        onChange={(e) => updateSettings('shortBreakTime', parseInt(e.target.value) || 1)}
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Long Break</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.longBreakTime}
                        onChange={(e) => updateSettings('longBreakTime', parseInt(e.target.value) || 1)}
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Auto Start Settings */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3">⚡ Auto Start</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="autoStartBreaks"
                            checked={settings.autoStartBreaks}
                            onChange={(e) => updateSettings('autoStartBreaks', e.target.checked)}
                            className="sr-only"
                          />
                          <div 
                            onClick={() => updateSettings('autoStartBreaks', !settings.autoStartBreaks)}
                            className={`w-12 h-6 rounded-full transition ${settings.autoStartBreaks ? 'bg-pink-500' : 'bg-white/30'}`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full transform transition-transform mt-0.5 ${settings.autoStartBreaks ? 'translate-x-7' : 'translate-x-1'}`}></div>
                          </div>
                        </div>
                        <label htmlFor="autoStartBreaks" className="ml-3">Auto start breaks</label>
                      </div>
                      <span className="text-xs opacity-70">Setelah pomodoro</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="autoStartPomodoros"
                            checked={settings.autoStartPomodoros}
                            onChange={(e) => updateSettings('autoStartPomodoros', e.target.checked)}
                            className="sr-only"
                          />
                          <div 
                            onClick={() => updateSettings('autoStartPomodoros', !settings.autoStartPomodoros)}
                            className={`w-12 h-6 rounded-full transition ${settings.autoStartPomodoros ? 'bg-teal-500' : 'bg-white/30'}`}
                          >
                            <div className={`bg-white w-5 h-5 rounded-full transform transition-transform mt-0.5 ${settings.autoStartPomodoros ? 'translate-x-7' : 'translate-x-1'}`}></div>
                          </div>
                        </div>
                        <label htmlFor="autoStartPomodoros" className="ml-3">Auto start pomodoro</label>
                      </div>
                      <span className="text-xs opacity-70">Setelah break</span>
                    </div>
                  </div>
                </div>
                
                {/* Alarm Sound */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3">🔔 Alarm Sound</h3>
                  <div className="flex flex-wrap gap-2">
                    {alarmSounds.map(sound => (
                      <button
                        key={sound.id}
                        onClick={() => updateSettings('sound', sound.id)}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center ${settings.sound === sound.id ? 'bg-white/30 ring-2 ring-white/50' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        {sound.icon && <span className="mr-2">{sound.icon}</span>}
                        {sound.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Volume Control in Settings */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Volume2 size={18} className="mr-2" /> Volume
                  </h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm">0%</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={(e) => updateSettings('volume', parseFloat(e.target.value))}
                      className="flex-grow accent-pink-500"
                    />
                    <span className="text-sm">100%</span>
                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm w-16 text-center">
                      {Math.round(settings.volume * 100)}%
                    </span>
                  </div>
                </div>
                
                {/* Background Theme */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Palette size={20} className="mr-2" />
                      <h3 className="font-bold">Background Theme</h3>
                    </div>
                    <span className="text-xs opacity-70">{backgrounds.find(b => b.id === settings.background)?.name}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {backgrounds.map(bg => (
                      <button
                        key={bg.id}
                        onClick={() => updateSettings('background', bg.id)}
                        className={`h-12 rounded-xl transition-transform ${bg.class} ${settings.background === bg.id ? 'ring-3 ring-white/70 scale-105' : 'hover:scale-105'}`}
                        aria-label={bg.name}
                        title={bg.name}
                      >
                        {settings.background === bg.id && (
                          <div className="w-full h-full flex items-center justify-center bg-black/40 rounded-xl">
                            <span className="text-xs font-bold">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Stats Footer */}
            <div className="mt-8 text-center">
              <div className="bg-white/10 rounded-2xl p-4 mb-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs opacity-70">Mode</div>
                    <div className="font-bold">{mode === 'pomodoro' ? '🍅 Focus' : mode === 'shortBreak' ? '☕ Break' : '🌴 Long Break'}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Status</div>
                    <div className="font-bold">{isActive ? '⏳ Running' : '⏸️ Paused'}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Music</div>
                    <div className="font-bold">{isMusicPlaying ? '🎵 On' : '🔇 Off'}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm opacity-80">
                <p>✨ FocusFlow helps you stay productive with Pomodoro technique!</p>
                <p className="mt-1 text-xs">#StudyWithMe #FocusMode #GenZVibes</p>
                <p className="mt-2 text-xs opacity-60">Timer running: {isActive ? 'Yes' : 'No'} • Music: {isMusicPlaying ? 'Playing' : 'Not playing'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        {showSettings && (
          <button
            onClick={() => {
              // Reset semua ke default
              setSettings({
                ...settings,
                pomodoroTime: 25,
                shortBreakTime: 5,
                longBreakTime: 15,
                autoStartBreaks: false,
                autoStartPomodoros: false,
                volume: 0.5
              });
              resetTimer();
            }}
            className="bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition hover:scale-110"
            title="Reset semua ke default"
          >
            <RotateCcw size={20} />
          </button>
        )}
        
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-white/30 hover:bg-white/40 text-white p-3 rounded-full shadow-lg transition hover:scale-110"
          title="Scroll ke atas"
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default PomodoroApp;