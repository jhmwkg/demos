import React, { useState, useEffect, useRef } from 'react';

// helper for parsing JSON from localStorage safely
function loadSessions() {
  try {
    const raw = localStorage.getItem('focusSessions');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      // basic validation of each entry
      return arr.map(s => ({
        id: s.id,
        date: s.date,
        durationMinutes: s.durationMinutes,
      }));
    }
  } catch (err) {
    console.error('could not load sessions from localStorage', err);
  }
  return [];
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function FocusTracker() {
  // state
  const [sessions, setSessions] = useState(() => loadSessions());
  const [duration, setDuration] = useState(25); // minutes
  const [remaining, setRemaining] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [listExpanded, setListExpanded] = useState(
    window.innerWidth >= 768
  );

  const timerRef = useRef(null);
  const initialDurRef = useRef(duration);

  // persist sessions
  useEffect(() => {
    try {
      localStorage.setItem('focusSessions', JSON.stringify(sessions));
    } catch (err) {
      console.error('could not save sessions to localStorage', err);
    }
  }, [sessions]);

  // responsive accordion
  useEffect(() => {
    const onResize = () => setListExpanded(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // timer effect
  useEffect(() => {
    if (isRunning) {
      // ensure only one interval is active
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
    // when paused or stopped clear interval
    if (timerRef.current) clearInterval(timerRef.current);
  }, [isRunning]);

  const handleDurationChange = e => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) val = 1;
    setDuration(val);
  };

  const handleStart = () => {
    // clear any stray timer before starting
    if (timerRef.current) clearInterval(timerRef.current);
    if (!remaining) {
      const secs = Math.round(duration * 60);
      setRemaining(secs);
      initialDurRef.current = duration;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(0);
  };

  const handleComplete = () => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      durationMinutes: initialDurRef.current,
    };
    setSessions(prev => {
      // avoid double‑logging identical entry (same id)
      if (prev.length && prev[prev.length - 1].id === entry.id) {
        return prev;
      }
      return [...prev, entry];
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  // derived data
  const todayStr = new Date().toDateString();
  const todaySessions = sessions.filter(
    s => new Date(s.date).toDateString() === todayStr
  );
  const todayTotal = todaySessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );

  // compute streak
  const uniqueDays = Array.from(
    new Set(sessions.map(s => new Date(s.date).toDateString()))
  );
  uniqueDays.sort((a, b) => new Date(b) - new Date(a)); // descending
  let streak = 0;
  for (let i = 0; i < uniqueDays.length; i++) {
    const check = new Date();
    check.setDate(check.getDate() - streak);
    if (uniqueDays.includes(check.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="text-center mb-4">
        <h1>Focus Session Tracker</h1>
        <div className="display-4">{todayTotal} min</div>
        <div className="mt-2">
          <span className="badge bg-info">7‑day streak: {streak}</span>
        </div>
      </div>

      <div className="card mx-auto" style={{ boxShadow: 'none' }}>
        <div className="card-body text-center">
          <div className="display-1 timer-display">
            {formatTime(remaining)}
          </div>
          <div className="mt-3">
            <div className="d-inline-block me-2">
              <input
                type="number"
                min="1"
                className="form-control"
                style={{ width: 100 }}
                value={duration}
                onChange={handleDurationChange}
                disabled={isRunning}
              />
            </div>
            <span>minutes</span>
          </div>
          {success && (
            <div className="alert alert-success mt-3">
              Session complete!
            </div>
          )}
          <div className="btn-group mt-3 flex-column flex-md-row">
            <button
              className="btn btn-primary btn-lg mb-2 mb-md-0"
              onClick={handleStart}
              disabled={isRunning}
            >
              Start
            </button>
            <button
              className="btn btn-secondary btn-lg mb-2 mb-md-0"
              onClick={handlePause}
              disabled={!isRunning}
            >
              Pause
            </button>
            <button
              className="btn btn-danger btn-lg"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2>Today's Sessions</h2>
        <div className="accordion" id="sessionAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingSessions">
              <button
                className={
                  'accordion-button ' + (listExpanded ? '' : 'collapsed')
                }
                type="button"
                onClick={() => setListExpanded(prev => !prev)}
              >
                Sessions ({todaySessions.length})
              </button>
            </h2>
            <div
              id="collapseSessions"
              className={
                'accordion-collapse collapse' + (listExpanded ? ' show' : '')
              }
            >
              <div className="accordion-body p-0">
                {todaySessions.length === 0 ? (
                  <p className="m-2">No sessions yet.</p>
                ) : (
                  <ul className="list-group">
                    {todaySessions.map(s => (
                      <li className="list-group-item" key={s.id}>
                        {new Date(s.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        – {s.durationMinutes} min
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
