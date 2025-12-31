"use client";

import { useState, useEffect } from "react";
import { days } from "../data/days";

// Streak Intro Component
function StreakIntro({ streak, onContinue }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position:"fixed",
      top:0,
      left:0,
      width:"100%",
      height:"100%",
      backgroundColor:"#FBF7F2",
      display:"flex",
      flexDirection:"column",
      justifyContent:"center",
      alignItems:"center",
      zIndex:9999
    }}>
      <div style={{
        transform: animate ? "scale(1)" : "scale(0.5)",
        opacity: animate ? 1 : 0,
        transition:"all 1s ease",
        textAlign:"center"
      }}>
        <h1 style={{ fontSize:48, color:"#6B3E26", marginBottom:20 }}>🔥 Your Current Streak 🔥</h1>
        <p style={{ fontSize:36, color:"#8A6A52", marginBottom:40 }}>{streak} {streak === 1 ? "day" : "days"}</p>
        <button onClick={onContinue} style={{
          padding:"12px 24px",
          fontSize:20,
          borderRadius:10,
          border:"none",
          backgroundColor:"#6B3E26",
          color:"#FBF7F2",
          cursor:"pointer"
        }}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [currentDay, setCurrentDay] = useState(1);
  const [jumpDay, setJumpDay] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [streak, setStreak] = useState(0);
  const [journal, setJournal] = useState("");
  const [completedDays, setCompletedDays] = useState(0);
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem("introSeen"));

  // Special holidays
  const specialHolidays = [
    { month: 3, day: 29, message: "The Bible reminds us of the true blessings of Good Friday." },
    { month: 3, day: 31, message: "Rejoice! Easter celebrates Christ's resurrection." },
    { month: 11, day: 25, message: "Remember the joy and giving of Christmas." }
  ];

  const day = days.find(d => d.day === currentDay);
  if (!day) return null;

  // Load bookmark
  useEffect(() => {
    const saved = localStorage.getItem("bookmarkedDay");
    if (saved) {
      const parsed = parseInt(saved);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 365) {
        setCurrentDay(parsed);
      }
    }
  }, []);

  // Save bookmark
  useEffect(() => {
    localStorage.setItem("bookmarkedDay", currentDay);
  }, [currentDay]);

  // Load streak
  useEffect(() => {
    const savedStreak = JSON.parse(localStorage.getItem("streak")) || { count: 0, lastDate: null };
    const today = new Date().toISOString().slice(0,10);
    if (savedStreak.lastDate) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
      if (savedStreak.lastDate === yesterday) {
        savedStreak.count += 1;
      } else if (savedStreak.lastDate !== today) {
        savedStreak.count = 1;
      }
    } else {
      savedStreak.count = 1;
    }
    savedStreak.lastDate = today;
    localStorage.setItem("streak", JSON.stringify(savedStreak));
    setStreak(savedStreak.count);
  }, [currentDay]);

  // Load journal and update completed days
  useEffect(() => {
    const saved = localStorage.getItem(`journal-day-${currentDay}`) || "";
    setJournal(saved);
    const completed = days.filter(d => localStorage.getItem(`journal-day-${d.day}`)).length;
    setCompletedDays(completed);
  }, [currentDay]);

  // Notifications
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const today = new Date();
    const month = today.getMonth();
    const date = today.getDate();

    // Holiday notifications
    specialHolidays.forEach(h => {
      if (h.month === month && h.day === date) {
        sendNotification("Bible365 Holiday Reminder", h.message);
      }
    });

    // Daily journal reminder
    const journalKey = `journal-day-${currentDay}`;
    const savedJournal = localStorage.getItem(journalKey) || "";
    if (!savedJournal) {
      sendNotification("Bible365 Daily Reminder", "Complete your journal for today!");
    }
  }, [currentDay]);

  const sendNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  // Navigation
  const nextDay = () => { if (currentDay < 365) setCurrentDay(currentDay + 1); };
  const prevDay = () => { if (currentDay > 1) setCurrentDay(currentDay - 1); };
  const jumpToDay = () => {
    const num = parseInt(jumpDay);
    if (!isNaN(num) && num >= 1 && num <= 365) {
      setCurrentDay(num);
      setJumpDay("");
    }
  };
  const handleDateChange = (value) => {
    setSelectedDate(value);
    if (!value) return;
    const pickedDate = new Date(value);
    const startOfYear = new Date(pickedDate.getFullYear(), 0, 1);
    const diffTime = pickedDate - startOfYear;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays >= 1 && diffDays <= 365) setCurrentDay(diffDays);
  };
  const handleJournalChange = (e) => {
    const value = e.target.value;
    setJournal(value);
    localStorage.setItem(`journal-day-${currentDay}`, value);
    const completed = days.filter(d => localStorage.getItem(`journal-day-${d.day}`)).length;
    setCompletedDays(completed);
  };
  const clearBookmark = () => {
    localStorage.removeItem("bookmarkedDay");
    setCurrentDay(1);
  };

  const handleContinueIntro = () => {
    localStorage.setItem("introSeen", "true");
    setShowIntro(false);
    // Play background music after user interaction
    const audio = document.getElementById("backgroundMusic");
    if (audio) {
      audio.play().catch(err => console.log("Autoplay prevented", err));
    }
  };

  const toggleMusic = () => {
    const audio = document.getElementById("backgroundMusic");
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const progressPercent = Math.round((completedDays / 365) * 100);

  // Show streak intro first
  if (showIntro) {
    return <StreakIntro streak={streak} onContinue={handleContinueIntro} />;
  }

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#FBF7F2", padding:24, fontFamily:"Georgia, serif" }}>
      
      {/* Audio */}
      <audio id="backgroundMusic" loop>
        <source src="/music/peaceful.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      {/* Music Toggle */}
      <button onClick={toggleMusic} style={{position:"fixed", bottom:20, right:20, padding:10, borderRadius:8, background:"#6B3E26", color:"#FBF7F2"}}>
        🎵 Music
      </button>

      {/* Header & Streak */}
      <header style={{ textAlign:"center", marginBottom:20 }}>
        <h1 style={{ color:"#6B3E26", fontSize:36 }}>Bible in 365 Days</h1>
        <p style={{ color:"#8A6A52" }}>Day {day.day}</p>
        <p style={{ color:"#6B3E26", marginBottom:10 }}>🔥 Current Streak: {streak} {streak===1 ? "day" : "days"}</p>
      </header>

      {/* Progress Dashboard */}
      <div style={{ margin:"20px 0", textAlign:"center" }}>
        <p>📊 Progress: {completedDays} / 365 days ({progressPercent}%)</p>
        <div style={{ width:"80%", height:20, background:"#E2D5C8", margin:"0 auto", borderRadius:10 }}>
          <div style={{ width:`${progressPercent}%`, height:"100%", background:"#6B3E26", borderRadius:10 }}></div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <input type="number" placeholder="Go to day" value={jumpDay} onChange={e => setJumpDay(e.target.value)} style={{ width:110, padding:6 }} />
        <button onClick={jumpToDay}>Go</button>
        <input type="date" value={selectedDate} onChange={e => handleDateChange(e.target.value)} style={{ padding:6 }} />
        <button onClick={clearBookmark}>Clear Bookmark</button>
      </div>

      {/* Readings */}
      <section style={{ background:"#FFFFFF", border:"1px solid #E2D5C8", borderRadius:12, padding:20, marginBottom:20 }}>
        <h3 style={{ color:"#6B3E26" }}>📜 Old Testament</h3>
        <p style={{ fontSize:18 }}>{day.oldTestament}</p>

        <h3 style={{ color:"#6B3E26", marginTop:16 }}>✝️ New Testament</h3>
        <p style={{ fontSize:18 }}>{day.newTestament}</p>
      </section>

      {/* Reflection */}
      <section style={{ background:"#FFF8ED", borderLeft:"6px solid #6B3E26", padding:20, marginBottom:20, borderRadius:8 }}>
        <h3 style={{ fontSize:22 }}>Reflection</h3>
        <p style={{ fontSize:20, lineHeight:1.6 }}>{day.reflection}</p>
      </section>

      {/* Journal */}
      <section style={{ background:"#F5EFE6", borderLeft:"6px solid #8A6A52", padding:20, borderRadius:8, marginBottom:20 }}>
        <h3 style={{ fontSize:22 }}>Journaling Prompt</h3>
        <p style={{ fontSize:20, lineHeight:1.6 }}>{day.prompt}</p>

        <textarea
          value={journal}
          onChange={handleJournalChange}
          placeholder="Write your thoughts here..."
          style={{ width:"100%", minHeight:120, padding:10, marginTop:10, borderRadius:6, border:"1px solid #ccc", fontFamily:"Georgia, serif" }}
        />
      </section>

      {/* Navigation */}
      <div style={{ marginTop:30, textAlign:"center" }}>
        <button onClick={prevDay} disabled={currentDay===1}>Previous</button>
        <button onClick={nextDay} disabled={currentDay===365} style={{ marginLeft:10 }}>Next</button>
      </div>
    </div>
  );
}
