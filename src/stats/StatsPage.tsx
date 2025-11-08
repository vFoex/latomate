import { useState, useEffect } from 'react';
import { getSessions, deleteSession } from '../utils/storage';
import { getStoredLanguage, getTranslation, type Language } from '../utils/i18n';
import { getStoredTheme, applyTheme, watchSystemTheme } from '../utils/theme';
import type { SessionRecord, SessionType, TimerMode } from '../types';
import PageLayout from '../components/PageLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './stats.css';

type Tab = 'overview' | 'details' | 'charts';

type FilterType = 'all' | SessionType;
type FilterMode = 'all' | TimerMode;
type FilterDate = 'all' | 'today' | 'week' | 'month';

function StatsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load language
    getStoredLanguage().then(setLanguage);
    
    // Load theme
    getStoredTheme().then((theme) => {
      applyTheme(theme);
    });
    
    // Watch for system theme changes
    const unwatch = watchSystemTheme(async () => {
      const theme = await getStoredTheme();
      applyTheme(theme);
    });
    
    // Load sessions
    loadSessions();
    
    // Listen for language/theme changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.theme) {
        applyTheme(changes.theme.newValue);
      }
      if (changes.language) {
        setLanguage(changes.language.newValue);
      }
      if (changes.sessions) {
        loadSessions();
      }
    };
    
    chrome.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      unwatch();
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const allSessions = await getSessions();
    setSessions(allSessions);
    setLoading(false);
  };

  return (
    <PageLayout 
      title={getTranslation('stats.title', language)}
      icon={<img src="/icons/icon48.png" alt="LaTomate" />}
      language={language}
    >
      <nav className="stats-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {getTranslation('stats.tabs.overview', language)}
        </button>
        <button
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          {getTranslation('stats.tabs.details', language)}
        </button>
        <button
          className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          {getTranslation('stats.tabs.charts', language)}
        </button>
      </nav>

      <main className="stats-content">
        {loading ? (
          <div className="loading">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍅</div>
            Loading statistics...
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined icon-xl">insights</span>
            </div>
            <h2 className="empty-state-title">No sessions yet</h2>
            <p className="empty-state-text">
              Start a Pomodoro session to see your statistics here!
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab sessions={sessions} language={language} />}
            {activeTab === 'details' && <DetailsTab _sessions={sessions} _language={language} />}
            {activeTab === 'charts' && <ChartsTab _sessions={sessions} _language={language} />}
          </>
        )}
      </main>
    </PageLayout>
  );
}

// Placeholder components
function OverviewTab({ sessions, language }: { sessions: SessionRecord[]; language: Language }) {
  // Calculate today's stats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaySessions = sessions.filter(s => new Date(s.startTime) >= today);
  const todayCompleted = todaySessions.filter(s => s.completed);
  const todayFocusTime = todayCompleted.reduce((total, s) => total + (s.duration || 0), 0);

  // Calculate this week's stats
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekSessions = sessions.filter(s => new Date(s.startTime) >= weekStart);
  const weekCompleted = weekSessions.filter(s => s.completed);
  const weekFocusTime = weekCompleted.reduce((total, s) => total + (s.duration || 0), 0);

  // Calculate this month's stats
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthSessions = sessions.filter(s => new Date(s.startTime) >= monthStart);
  const monthCompleted = monthSessions.filter(s => s.completed);
  const monthFocusTime = monthCompleted.reduce((total, s) => total + (s.duration || 0), 0);

  // Calculate streak (consecutive days with at least one completed session)
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;
    
    const completedByDate = new Map<string, boolean>();
    sessions.filter(s => s.completed).forEach(s => {
      const date = new Date(s.startTime).toDateString();
      completedByDate.set(date, true);
    });

    let streak = 0;
    const checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);

    while (completedByDate.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Format time helper
  const formatTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const t = (key: string) => getTranslation(key, language);

  return (
    <div className="overview-tab">
      {/* First Row: Current Streak + Activity Heatmap */}
      <div className="overview-row-1">
        {/* Current Streak Card */}
        <div className="stat-card stat-card-highlight">
          <div className="stat-card-header">
            <span className="stat-card-icon material-symbols-outlined">local_fire_department</span>
            <h3>{t('stats.currentStreak')}</h3>
          </div>
          <div className="stat-card-content stat-card-center">
            <div className="streak-value">{currentStreak}</div>
            <div className="streak-label">{t('stats.days')}</div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <ActivityHeatmap sessions={sessions} language={language} />
      </div>

      {/* Second Row: Other Stats */}
      <div className="stats-grid">
        {/* Today Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon material-symbols-outlined">calendar_today</span>
            <h3>{t('stats.today')}</h3>
          </div>
          <div className="stat-card-content">
            <div className="stat-item">
              <span className="stat-label">{t('stats.sessions')}</span>
              <span className="stat-value">{todaySessions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('stats.completed')}</span>
              <span className="stat-value stat-value-success">{todayCompleted.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('stats.focusTime')}</span>
              <span className="stat-value stat-value-primary">{formatTime(todayFocusTime)}</span>
            </div>
          </div>
        </div>

        {/* This Week Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon material-symbols-outlined">bar_chart</span>
            <h3>{t('stats.thisWeek')}</h3>
          </div>
          <div className="stat-card-content">
            <div className="stat-item">
              <span className="stat-label">{t('stats.sessions')}</span>
              <span className="stat-value">{weekSessions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('stats.completed')}</span>
              <span className="stat-value stat-value-success">{weekCompleted.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('stats.focusTime')}</span>
              <span className="stat-value stat-value-primary">{formatTime(weekFocusTime)}</span>
            </div>
          </div>
        </div>

        {/* This Month Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-icon material-symbols-outlined">trending_up</span>
            <h3>{t('stats.thisMonth')}</h3>
          </div>
          <div className="stat-card-content">
            <div className="stat-item">
              <span className="stat-label">{t('stats.sessions')}</span>
              <span className="stat-value">{monthSessions.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('stats.completed')}</span>
              <span className="stat-value stat-value-success">{monthCompleted.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('stats.focusTime')}</span>
              <span className="stat-value stat-value-primary">{formatTime(monthFocusTime)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Heatmap Component (GitHub-style)
function ActivityHeatmap({ sessions, language }: { sessions: SessionRecord[]; language: Language }) {
  const t = (key: string) => getTranslation(key, language);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null);

  // Generate last 12 months of data (365 days)
  const generateHeatmapData = () => {
    const data: { date: Date; count: number; dateString: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate sessions per day
    const sessionsByDate = new Map<string, number>();
    sessions.filter(s => s.completed && s.type === 'work').forEach(session => {
      const date = new Date(session.startTime);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split('T')[0];
      sessionsByDate.set(dateKey, (sessionsByDate.get(dateKey) || 0) + 1);
    });

    // Generate 365 days (52 weeks / 12 months)
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      data.push({
        date: new Date(date),
        count: sessionsByDate.get(dateKey) || 0,
        dateString: dateKey,
      });
    }

    return data;
  };

  const heatmapData = generateHeatmapData();

  // Group by weeks (chronological order: oldest to newest, left to right)
  const weeks: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  // Get color intensity based on count
  const getColor = (count: number): string => {
    if (count === 0) return 'var(--heatmap-empty)';
    if (count === 1) return 'var(--heatmap-level-1)';
    if (count <= 3) return 'var(--heatmap-level-2)';
    if (count <= 5) return 'var(--heatmap-level-3)';
    return 'var(--heatmap-level-4)';
  };

  // Get total sessions
  const totalSessions = heatmapData.reduce((sum, day) => sum + day.count, 0);

  // Day labels
  const dayLabels = ['Mon', 'Wed', 'Fri'];
  const dayIndices = [0, 2, 4];

  // Month labels - show month name only once when month changes
  const monthLabels: string[] = [];
  let lastDisplayedMonth = -1;
  let lastDisplayedYear = -1;
  
  weeks.forEach((week) => {
    if (!week || week.length === 0) {
      monthLabels.push('');
      return;
    }
    
    const firstDay = week[0];
    if (!firstDay) {
      monthLabels.push('');
      return;
    }
    
    const currentMonth = firstDay.date.getMonth();
    const currentYear = firstDay.date.getFullYear();
    
    // Show month if it's different from the last displayed month
    if (currentMonth !== lastDisplayedMonth || currentYear !== lastDisplayedYear) {
      monthLabels.push(firstDay.date.toLocaleDateString(language, { month: 'short' }));
      lastDisplayedMonth = currentMonth;
      lastDisplayedYear = currentYear;
    } else {
      monthLabels.push('');
    }
  });

  return (
    <div className="activity-heatmap">
      <div className="heatmap-header">
        <h3 className="heatmap-title">
          <span className="material-symbols-outlined icon-md">calendar_month</span>
          {t('stats.activityHeatmap') || 'Activity Heatmap'}
        </h3>
        <div className="heatmap-summary">
          {totalSessions} {t('stats.sessions').toLowerCase()} {t('stats.last12Months') || 'in the last 12 months'}
        </div>
      </div>
      
      <div className="heatmap-container">
        {/* Month labels */}
        <div className="heatmap-months">
          {monthLabels.map((label, index) => (
            <div key={index} className="month-label">
              {label}
            </div>
          ))}
        </div>
        
        <div className="heatmap-grid-wrapper">
          {/* Day labels */}
          <div className="heatmap-days">
            {dayLabels.map((label, index) => (
              <div key={label} className="day-label" style={{ gridRow: dayIndices[index] + 1 }}>
                {label}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="heatmap-grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="heatmap-week">
                {week.map((day) => {
                  const dateStr = day.date.toLocaleDateString(language, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  });
                  return (
                    <div
                      key={day.dateString}
                      className="heatmap-cell"
                      style={{ backgroundColor: getColor(day.count) }}
                      data-count={day.count}
                      data-date={day.dateString}
                      onMouseEnter={(e) => {
                        if (day.count > 0) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                            date: dateStr,
                            count: day.count
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="legend-label">{t('stats.less') || 'Less'}</span>
        <div className="legend-colors">
          <div className="legend-cell" style={{ backgroundColor: 'var(--heatmap-empty)' }} />
          <div className="legend-cell" style={{ backgroundColor: 'var(--heatmap-level-1)' }} />
          <div className="legend-cell" style={{ backgroundColor: 'var(--heatmap-level-2)' }} />
          <div className="legend-cell" style={{ backgroundColor: 'var(--heatmap-level-3)' }} />
          <div className="legend-cell" style={{ backgroundColor: 'var(--heatmap-level-4)' }} />
        </div>
        <span className="legend-label">{t('stats.more') || 'More'}</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        >
          <div className="heatmap-tooltip-content">
            <div className="heatmap-tooltip-count">
              {tooltip.count} {tooltip.count === 1 ? t('stats.session') || 'session' : t('stats.sessions') || 'sessions'}
            </div>
            <div className="heatmap-tooltip-date">{tooltip.date}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DetailsTab({ _sessions, _language }: { _sessions: SessionRecord[]; _language: Language }) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterDate, setFilterDate] = useState<FilterDate>('all');
  const [filteredSessions, setFilteredSessions] = useState<SessionRecord[]>(_sessions);

  useEffect(() => {
    let filtered = [..._sessions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.type === filterType);
    }

    // Filter by mode
    if (filterMode !== 'all') {
      filtered = filtered.filter(s => s.timerMode === filterMode);
    }

    // Filter by date
    if (filterDate !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (filterDate === 'today') {
        filtered = filtered.filter(s => new Date(s.startTime) >= today);
      } else if (filterDate === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(s => new Date(s.startTime) >= weekAgo);
      } else if (filterDate === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(s => new Date(s.startTime) >= monthAgo);
      }
    }

    setFilteredSessions(filtered);
  }, [_sessions, filterType, filterMode, filterDate]);

  const handleDelete = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      await deleteSession(sessionId);
      // Sessions will reload automatically via storage listener
    }
  };

  const getTypeEmoji = (type: SessionType) => {
    switch (type) {
      case 'work': return '💼';
      case 'shortBreak': return '☕';
      case 'longBreak': return '🌴';
    }
  };

  const getTypeLabel = (type: SessionType) => {
    switch (type) {
      case 'work': return 'Work';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(_language, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="details-tab">
      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Date:</label>
          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value as FilterDate)}>
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType)}>
            <option value="all">All types</option>
            <option value="work">💼 Work</option>
            <option value="shortBreak">☕ Short Break</option>
            <option value="longBreak">🌴 Long Break</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Mode:</label>
          <select value={filterMode} onChange={(e) => setFilterMode(e.target.value as FilterMode)}>
            <option value="all">All modes</option>
            <option value="pomodoro">Pomodoro</option>
            <option value="intensive">Intensive</option>
            <option value="52-17">52-17</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="filter-results">
          Showing {filteredSessions.length} of {_sessions.length} sessions
        </div>
      </div>

      {/* Sessions Table */}
      {filteredSessions.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '40px' }}>
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">No sessions found</h3>
          <p className="empty-state-text">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="sessions-table-container">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Mode</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <span className="type-badge" data-type={session.type}>
                      {getTypeEmoji(session.type)} {getTypeLabel(session.type)}
                    </span>
                  </td>
                  <td>
                    <span className="mode-badge">{session.timerMode}</span>
                  </td>
                  <td>{formatDate(session.startTime)}</td>
                  <td>{formatDuration(session.duration)}</td>
                  <td>
                    {session.completed ? (
                      <span className="status-badge status-completed">
                        <span className="material-symbols-outlined icon-sm">check_circle</span> Completed
                      </span>
                    ) : session.interrupted ? (
                      <span className="status-badge status-interrupted">
                        <span className="material-symbols-outlined icon-sm">pause_circle</span> Interrupted
                      </span>
                    ) : (
                      <span className="status-badge status-pending">
                        <span className="material-symbols-outlined icon-sm">pending</span> Pending
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(session.id)}
                      title="Delete session"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ChartsTab({ _sessions, _language }: { _sessions: SessionRecord[]; _language: Language }) {
  const t = (key: string) => getTranslation(key, _language);

  // Prepare data for Sessions Over Time (Last 7 days)
  const getLast7DaysData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const daySessions = _sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= date && sessionDate < nextDay;
      });
      
      data.push({
        date: date.toLocaleDateString(_language, { month: 'short', day: 'numeric' }),
        completed: daySessions.filter(s => s.completed).length,
        interrupted: daySessions.filter(s => s.interrupted).length,
        total: daySessions.length,
      });
    }
    
    return data;
  };

  // Prepare data for Focus Time by Day (Last 7 days)
  const getFocusTimeData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const daySessions = _sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= date && sessionDate < nextDay && s.completed;
      });
      
      const totalMinutes = daySessions.reduce((sum, s) => {
        return sum + Math.floor((s.duration || 0) / 60000);
      }, 0);
      
      data.push({
        date: date.toLocaleDateString(_language, { weekday: 'short' }),
        minutes: totalMinutes,
        hours: (totalMinutes / 60).toFixed(1),
      });
    }
    
    return data;
  };

  // Prepare data for Sessions by Type (Pie Chart)
  const getSessionsByType = () => {
    const workSessions = _sessions.filter(s => s.type === 'work').length;
    const shortBreakSessions = _sessions.filter(s => s.type === 'shortBreak').length;
    const longBreakSessions = _sessions.filter(s => s.type === 'longBreak').length;
    
    return [
      { name: t('stats.charts.work'), value: workSessions, color: '#e74c3c' },
      { name: t('stats.charts.shortBreak'), value: shortBreakSessions, color: '#3498db' },
      { name: t('stats.charts.longBreak'), value: longBreakSessions, color: '#2ecc71' },
    ].filter(item => item.value > 0);
  };

  const last7DaysData = getLast7DaysData();
  const focusTimeData = getFocusTimeData();
  const sessionsByType = getSessionsByType();

  // Calculate completion rate for last 30 days
  const last30DaysCompletion = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = _sessions.filter(s => new Date(s.startTime) >= thirtyDaysAgo);
    const completed = recentSessions.filter(s => s.completed).length;
    const total = recentSessions.length;
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const completionRate = last30DaysCompletion();

  if (_sessions.length === 0) {
    return (
      <div className="charts-tab">
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="material-symbols-outlined icon-xl">insights</span>
          </div>
          <h2 className="empty-state-title">No data to display</h2>
          <p className="empty-state-text">
            Complete some sessions to see your charts and analytics!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-tab">
      <div className="charts-grid">
        {/* Sessions Over Time */}
        <div className="chart-card chart-card-wide">
          <h3 className="chart-title">
            <span className="material-symbols-outlined icon-md">bar_chart</span> {t('stats.charts.sessionsOverTime')} - {t('stats.charts.last7days')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#2ecc71" name={t('stats.completed')} />
              <Bar dataKey="interrupted" fill="#e74c3c" name={t('stats.interrupted')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Focus Time by Day */}
        <div className="chart-card chart-card-wide">
          <h3 className="chart-title">
            <span className="material-symbols-outlined icon-md">schedule</span> {t('stats.charts.focusTimeByDay')} - {t('stats.charts.last7days')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={focusTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" label={{ value: t('stats.minutes'), angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="minutes" 
                stroke="#e74c3c" 
                strokeWidth={3}
                name={t('stats.focusTime')}
                dot={{ fill: '#e74c3c', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions by Type */}
        <div className="chart-card">
          <h3 className="chart-title">
            <span className="material-symbols-outlined icon-md">pie_chart</span> {t('stats.charts.sessionsByType')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sessionsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {sessionsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Rate */}
        <div className="chart-card">
          <h3 className="chart-title">
            <span className="material-symbols-outlined icon-md">check_circle</span> {t('stats.charts.completionRate')} - {t('stats.charts.last30days')}
          </h3>
          <div className="completion-rate-display">
            <div className="completion-circle">
              <svg viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#2ecc71"
                  strokeWidth="20"
                  strokeDasharray={`${(completionRate / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="completion-value">{completionRate}%</div>
            </div>
            <p className="completion-description">
              {completionRate >= 80 ? (
                <><span className="material-symbols-outlined icon-sm">celebration</span> Excellent!</>
              ) : completionRate >= 60 ? (
                <><span className="material-symbols-outlined icon-sm">thumb_up</span> Good job!</>
              ) : (
                <><span className="material-symbols-outlined icon-sm">fitness_center</span> Keep going!</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
