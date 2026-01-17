import React, { useState } from 'react';
import {
  Plus,
  ChevronsDown,
  ChevronsUp,
  Wallet,
  Hourglass,
  Flag,
  Eye,
  EyeOff,
  X,
  Download,
  Upload,
  Database,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import type { TravelItem } from './types';
import { SortableItem } from './components/SortableItem';
import { EditModal } from './components/EditModal';
import { useItinerary } from './hooks/useItinerary';
import { JAPAN_LOCATIONS } from './constants';

const App: React.FC = () => {
  const {
    tripTitle,
    setTripTitle,
    items,
    setItems,
    exportData,
    importData
  } = useItinerary();

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<string | null>(null);
  const [showFinished, setShowFinished] = useState(true);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [activeDetail, setActiveDetail] = useState<'price' | 'countdown' | 'total' | 'data' | null>(null);
  const [isWarning, setIsWarning] = useState(false);

  React.useEffect(() => {
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = now.getSeconds();
      const currentHHmm = `${h}:${m}`;
      setCurrentTime(currentHHmm);

      // Find current item
      const nowTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + s;
      const currentItem = items.find(item => {
        const start = toMin(item.startTime) * 60;
        let endStr = item.endTime || item.startTime;
        let end = toMin(endStr) * 60;

        // If no end time or it's same as start, treat it as 30 min event for "Now" status
        if (end <= start) {
          end = start + 30 * 60;
        }

        return nowTotalSeconds >= start && nowTotalSeconds < end;
      });

      if (currentItem) {
        const start = toMin(currentItem.startTime) * 60;
        let endStr = currentItem.endTime || currentItem.startTime;
        let end = toMin(endStr) * 60;
        if (end <= start) end = start + 30 * 60;

        const diff = end - nowTotalSeconds;
        const min = Math.floor(diff / 60);
        const sec = diff % 60;
        setTimeRemaining(`${min}:${String(sec).padStart(2, '0')}`);
      } else {
        setTimeRemaining(null);
      }

      // Final Warning state calculation
      let warning = false;
      if (currentItem) {
        const start = toMin(currentItem.startTime) * 60;
        let endStr = currentItem.endTime || currentItem.startTime;
        let end = toMin(endStr) * 60;
        if (end <= start) end = start + 30 * 60;
        const diff = end - nowTotalSeconds;
        if (diff < 600) warning = true; // 10 minutes
      } else {
        const nextItem = items.find(it => toMin(it.startTime) * 60 > nowTotalSeconds);
        if (nextItem) {
          const start = toMin(nextItem.startTime) * 60;
          if (start - nowTotalSeconds < 600) warning = true;
        }
      }
      setIsWarning(warning);

      // Calculate total time until the last item ends
      if (items.length > 0) {
        const lastItem = items[items.length - 1];
        const lastEndStr = lastItem.endTime || lastItem.startTime;
        const tripEndSeconds = toMin(lastEndStr) * 60;

        if (nowTotalSeconds < tripEndSeconds) {
          const totalDiffSeconds = tripEndSeconds - nowTotalSeconds;
          const h = Math.floor(totalDiffSeconds / 3600);
          const m = Math.floor((totalDiffSeconds % 3600) / 60);
          const s = totalDiffSeconds % 60;

          if (h > 0) {
            setTotalTimeRemaining(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
          } else {
            setTotalTimeRemaining(`${m}:${String(s).padStart(2, '0')}`);
          }
        } else {
          setTotalTimeRemaining(null);
        }
      } else {
        setTotalTimeRemaining(null);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000); // Update every second
    return () => clearInterval(timer);
  }, [items]);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TravelItem | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor)
  );

  const totalPrice = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: TravelItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = (newItem: TravelItem) => {
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? newItem : i));
    } else {
      setItems([...items, newItem]);
    }
    setIsModalOpen(false);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (updatedItem: TravelItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  // Feature 5: Automatic Weather Fetching (High Accuracy)
  React.useEffect(() => {
    const fetchWeatherForItem = async (item: TravelItem) => {
      if (item.weatherInfo || (!item.from && !item.title)) return;

      const trySearch = async (q: string) => {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=ja&format=json`);
        const data = await res.json();
        return data.results && data.results[0] ? data.results[0] : null;
      };

      try {
        let lat: number | undefined, lon: number | undefined;

        // Step 1: Check local prioritized list against Title and Location
        const searchText = `${item.title} ${item.from}`;
        for (const [key, coords] of Object.entries(JAPAN_LOCATIONS)) {
          if (searchText.includes(key)) {
            lat = coords.lat;
            lon = coords.lon;
            break;
          }
        }

        // Step 2: Fallback to Geocoding API if not in local list
        if (lat === undefined && item.from) {
          let result = await trySearch(item.from);
          if (!result) result = await trySearch(`${item.from} 日本`);
          if (!result && item.from.includes(' ')) {
            const segments = item.from.split(/\s+/);
            result = await trySearch(segments.slice(0, 2).join(' '));
          }
          if (result) {
            lat = result.latitude;
            lon = result.longitude;
          }
        }

        if (lat !== undefined && lon !== undefined) {
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          const weatherData = await weatherRes.json();
          const { temperature, weathercode } = weatherData.current_weather;

          setItems(prev => prev.map(it => it.id === item.id ? { ...it, weatherInfo: { temp: Math.round(temperature), code: weathercode } } : it));
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };

    items.forEach(item => {
      if (!item.weatherInfo && (item.from || item.title)) {
        fetchWeatherForItem(item);
      }
    });
  }, [items.map(i => `${i.title}|${i.from}`).join(',')]);

  return (
    <div className="app-container">
      <header className="app-header">
        <input
          className="input-trip-title"
          value={tripTitle}
          onChange={(e) => setTripTitle(e.target.value)}
          placeholder="旅のタイトルを入力"
        />

        <div className="header-controls">
          <div className="header-left-group">


            <button
              className="info-pill"
              onClick={() => setIsCompactMode(!isCompactMode)}
              style={{ cursor: 'pointer', border: 'none', background: 'var(--surface-dim)', padding: '0.85rem 1.25rem' }}
              title={isCompactMode ? "全て展開" : "全て折りたたむ"}
            >
              {isCompactMode ? <ChevronsDown size={22} /> : <ChevronsUp size={22} />}
            </button>

            {/* Show/Hide Finished Toggle */}
            {items.some(it => (it.endTime || it.startTime) < currentTime) && (
              <button
                className="info-pill"
                onClick={() => setShowFinished(!showFinished)}
                style={{ cursor: 'pointer', border: 'none', background: 'var(--surface-dim)', padding: '0.85rem 1.25rem' }}
                title={showFinished ? '完了分を隠す' : '全て表示'}
              >
                {showFinished ? <EyeOff size={20} /> : <Eye size={20} />}
                <span className="price-display" style={{ fontSize: '0.9rem' }}>{showFinished ? '済' : '全'}</span>
              </button>
            )}

            <button
              className={`info-pill ${activeDetail === 'price' ? 'active' : ''}`}
              title="合計金額の内訳"
              onClick={() => setActiveDetail(activeDetail === 'price' ? null : 'price')}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              <Wallet size={16} />
              <span className="price-display" style={{ fontSize: '1.05rem', fontWeight: 500 }}>{totalPrice.toLocaleString()}円</span>
            </button>

            {timeRemaining && (
              <button
                className={`info-pill countdown-pill ${activeDetail === 'countdown' ? 'active' : ''} ${isWarning ? 'warning' : ''}`}
                title="現在の状況詳細"
                onClick={() => setActiveDetail(activeDetail === 'countdown' ? null : 'countdown')}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <Hourglass size={16} />
                <span className="price-display" style={{ fontSize: '1.05rem', fontWeight: 500 }}>{timeRemaining}</span>
              </button>
            )}

            {totalTimeRemaining && (
              <button
                className={`info-pill ${activeDetail === 'total' ? 'active' : ''}`}
                title="全体行程の詳細"
                onClick={() => setActiveDetail(activeDetail === 'total' ? null : 'total')}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <Flag size={16} />
                <span className="price-display" style={{ fontSize: '1.05rem', fontWeight: 500 }}>約{totalTimeRemaining}</span>
              </button>
            )}

            <button
              className={`info-pill ${activeDetail === 'data' ? 'active' : ''}`}
              title="データの保存・読み込み"
              onClick={() => setActiveDetail(activeDetail === 'data' ? null : 'data')}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              <Database size={16} />
              <span className="price-display" style={{ fontSize: '0.9rem', fontWeight: 500 }}>データ</span>
            </button>

          </div>
        </div>

        <AnimatePresence>
          {activeDetail && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="header-detail-panel"
            >
              <div className="detail-panel-content">
                <div className="detail-header">
                  <span className="detail-title">
                    {activeDetail === 'price' && '支出内訳'}
                    {activeDetail === 'countdown' && '現在の状況'}
                    {activeDetail === 'total' && '全体スケジュール'}
                    {activeDetail === 'data' && 'データのバックアップ'}
                  </span>
                  <button className="detail-close-btn" onClick={() => setActiveDetail(null)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="detail-body">
                  {activeDetail === 'data' && (
                    <div className="data-management">
                      <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem' }}>
                        旅行データをJSONファイルとして保存したり、以前のファイルから読み込んだりできます。
                      </p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="footer-action-btn" onClick={exportData} style={{ flex: 1, padding: '1rem' }}>
                          <Download size={18} />
                          <span>データを保存</span>
                        </button>
                        <label className="footer-action-btn" style={{ flex: 1, padding: '1rem', cursor: 'pointer' }}>
                          <Upload size={18} />
                          <span>データを読み込む</span>
                          <input
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) importData(file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {activeDetail === 'price' && (
                    <div className="price-breakdown">
                      {items.filter(it => (it.price || 0) > 0).map(it => (
                        <div key={it.id} className="price-row">
                          <span className="price-label">{it.title}</span>
                          <span className="price-value">{Number(it.price).toLocaleString()}円</span>
                        </div>
                      ))}
                      <div className="price-total-row">
                        <span>合計</span>
                        <span>{totalPrice.toLocaleString()}円</span>
                      </div>
                    </div>
                  )}

                  {activeDetail === 'countdown' && (
                    <div className="countdown-info-enhanced">
                      {(() => {
                        const now = new Date();
                        const toMinutes = (t: string) => {
                          const [h, m] = t.split(':').map(Number);
                          return h * 60 + m;
                        };
                        const nowTotalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

                        const current = items.find(it => {
                          const s = toMinutes(it.startTime) * 60;
                          let eStr = it.endTime || it.startTime;
                          let e = toMinutes(eStr) * 60;
                          if (e <= s) e = s + 30 * 60;
                          return nowTotalSeconds >= s && nowTotalSeconds < e;
                        });



                        return (
                          <div className="status-single-container">
                            {current ? (
                              <div className={`status-hero-card ${isWarning ? 'warning-pulse' : ''}`}>
                                <div className="hero-status-label">{isWarning ? 'ENDING SOON' : 'CURRENT ACTIVITY'}</div>
                                <h4 className="hero-title">{current.title}</h4>
                                <div className="hero-time-row">
                                  <Clock size={14} />
                                  <span>{current.startTime} — {current.endTime || `${current.startTime}(+30m)`}</span>
                                </div>
                                <div className="hero-progress-track">
                                  {(() => {
                                    const s = toMinutes(current.startTime) * 60;
                                    let e = toMinutes(current.endTime || current.startTime) * 60;
                                    if (e <= s) e = s + 30 * 60;
                                    const progress = Math.min(100, Math.max(0, ((nowTotalSeconds - s) / (e - s)) * 100));
                                    return <div className="hero-progress-fill" style={{ width: `${progress}%` }} />;
                                  })()}
                                </div>
                                <div className={`hero-remaining-badge ${isWarning ? 'warning' : ''}`}>
                                  あと {timeRemaining}
                                </div>
                              </div>
                            ) : (
                              <div className={`status-hero-card ${isWarning ? 'warning-pulse' : 'empty'}`}>
                                {isWarning ? (
                                  <>
                                    <div className="hero-status-label">UPCOMING SOON</div>
                                    {(() => {
                                      const next = items.find(it => toMinutes(it.startTime) * 60 > nowTotalSeconds);
                                      return next ? (
                                        <>
                                          <h4 className="hero-title">{next.title}</h4>
                                          <p className="hero-time-row" style={{ marginTop: '0.25rem' }}>
                                            まもなく {next.startTime} から開始
                                          </p>
                                        </>
                                      ) : null;
                                    })()}
                                  </>
                                ) : (
                                  <p>現在は予定がありません</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {activeDetail === 'total' && (
                    <div className="total-schedule-enhanced">
                      <div className="trip-summary-box">
                        <div className="trip-time-line">
                          <div className="time-labels">
                            <div className="time-point start">
                              <span className="time">{items[0]?.startTime}</span>
                            </div>
                            <div className="time-point end">
                              <span className="time">{items[items.length - 1]?.endTime || items[items.length - 1]?.startTime}</span>
                            </div>
                          </div>
                          <div className="time-progress-track">
                            {(() => {
                              const now = new Date();
                              const nowMin = now.getHours() * 60 + now.getMinutes();
                              const toMin = (t: string) => {
                                const [h, m] = t.split(':').map(Number);
                                return h * 60 + m;
                              };
                              const start = toMin(items[0]?.startTime || '00:00');
                              const lastItem = items[items.length - 1];
                              const end = toMin(lastItem?.endTime || lastItem?.startTime || '23:59');
                              const total = end - start;
                              if (total <= 0) return null;
                              const progress = Math.min(100, Math.max(0, ((nowMin - start) / total) * 100));
                              return <div className="time-progress-fill" style={{ width: `${progress}%` }} />;
                            })()}
                          </div>
                        </div>

                        <div className="trip-stats-grid">
                          <div className="stat-item highlight">
                            <span className="stat-label">旅行終了まで</span>
                            <span className="stat-value">あと {totalTimeRemaining || '0:00'}</span>
                          </div>
                          {(() => {
                            const toMin = (t: string) => {
                              const [h, m] = t.split(':').map(Number);
                              return h * 60 + m;
                            };
                            const start = toMin(items[0]?.startTime || '00:00');
                            const end = toMin(items[items.length - 1]?.endTime || items[items.length - 1]?.startTime || '00:00');
                            const diff = end - start;
                            const h = Math.floor(diff / 60);
                            const m = diff % 60;
                            return (
                              <div className="stat-item">
                                <span className="stat-label">総所要時間</span>
                                <span className="stat-value">{h > 0 ? `${h}時間 ${m}分` : `${m}分`}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="timeline-view">
        <div className="timeline-items-list">
          {(() => {
            const toMin = (t: string) => {
              const [h, m] = t.split(':').map(Number);
              return h * 60 + m;
            };

            const calculateProgress = () => {
              if (items.length === 0) return 0;
              const now = toMin(currentTime);
              const firstStart = toMin(items[0].startTime);
              const lastEnd = toMin(items[items.length - 1].endTime || items[items.length - 1].startTime);

              if (now <= firstStart) return 0;
              if (now >= lastEnd) return 100;

              // Robust linear interpolation across item indices
              for (let i = 0; i < items.length; i++) {
                const itemStart = toMin(items[i].startTime);
                const itemEnd = toMin(items[i].endTime || items[i].startTime);

                if (now >= itemStart && now <= itemEnd) {
                  const itemProgress = (now - itemStart) / (itemEnd - itemStart || 1);
                  return ((i + 0.5 + itemProgress * 0.5) / items.length) * 100;
                }

                if (i < items.length - 1) {
                  const nextStart = toMin(items[i + 1].startTime);
                  if (now > itemEnd && now < nextStart) {
                    const gapProgress = (now - itemEnd) / (nextStart - itemEnd || 1);
                    return ((i + 1 + gapProgress * 0.2) / items.length) * 100;
                  }
                }
              }
              return (items.findIndex(item => toMin(item.startTime) > now) / items.length) * 100;
            };

            return <div className="timeline-progress-line" style={{ height: `${calculateProgress()}%` }} />;
          })()}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {items
                  .filter(item => {
                    if (showFinished) return true;
                    // Keep item if it's currently happening or in the future
                    return (item.endTime || item.startTime) >= currentTime;
                  })
                  .map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                    >
                      <SortableItem
                        item={item}
                        onDelete={deleteItem}
                        onEdit={openEditModal}
                        onUpdate={updateItem}
                        currentTime={currentTime}
                        isCompactMode={isCompactMode}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        </div>

        <div className="add-btn-container">
          <button className="btn-add-minimal" onClick={openAddModal} title="予定を追加">
            <Plus size={32} />
          </button>
        </div>
      </main>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        onSave={handleSaveItem}
      />
    </div >
  );
};

export default App;
