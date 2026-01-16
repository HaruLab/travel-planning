import React, { useState } from 'react';
import {
  Plus,
  Compass,
  X,
  CalendarDays,
  Pen,
  Trash,
  TrainFront,
  BusFront,
  Plane,
  PersonStanding,
  Camera,
  Utensils,
  BedDouble,
  GripVertical,
  MapPin,
  ExternalLink,
  CloudCheck,
  RotateCw,
  CloudOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ActivityType = 'train' | 'bus' | 'walk' | 'plane' | 'sightseeing' | 'food' | 'stay' | 'other';

interface TravelItem {
  id: string;
  type: ActivityType;
  title: string;
  from: string;
  to?: string;
  startTime: string;
  endTime: string;
  distance?: string;
  note?: string;
  price?: number;
}

const ACTIVITY_MODES: { type: ActivityType; icon: React.ReactNode; label: string; isTransport: boolean }[] = [
  { type: 'train', icon: <TrainFront size={20} strokeWidth={2} />, label: '電車', isTransport: true },
  { type: 'bus', icon: <BusFront size={20} strokeWidth={2} />, label: 'バス', isTransport: true },
  { type: 'plane', icon: <Plane size={20} strokeWidth={2} />, label: '飛行機', isTransport: true },
  { type: 'walk', icon: <PersonStanding size={20} strokeWidth={2} />, label: '徒歩', isTransport: true },
  { type: 'sightseeing', icon: <Camera size={20} strokeWidth={2} />, label: '観光', isTransport: false },
  { type: 'food', icon: <Utensils size={20} strokeWidth={2} />, label: '食事', isTransport: false },
  { type: 'stay', icon: <BedDouble size={20} strokeWidth={2} />, label: '宿泊', isTransport: false },
  { type: 'other', icon: <Compass size={20} strokeWidth={2} />, label: 'その他', isTransport: false },
];

const INITIAL_DATA: TravelItem[] = [
  {
    id: '1',
    type: 'train',
    title: '新幹線 はやぶさ',
    from: '新青森',
    to: '大宮',
    startTime: '08:14',
    endTime: '10:34',
    note: '新幹線で大宮へ（指定席）',
    price: 16930
  },
  {
    id: '2',
    type: 'train',
    title: '東武アーバンパークライン',
    from: '大宮駅',
    to: '北大宮駅',
    startTime: '10:45',
    endTime: '10:50',
    price: 150
  },
  {
    id: '3',
    type: 'sightseeing',
    title: '大宮公園・氷川神社散策',
    from: '大宮公園',
    startTime: '11:00',
    endTime: '12:30',
    note: '武蔵一宮 氷川神社参拝（初詣・散策）',
    price: 0
  },
  {
    id: '4',
    type: 'food',
    title: '昼食',
    from: '大宮・北大宮エリア',
    startTime: '12:30',
    endTime: '13:30',
    note: '地元のランチを楽しむ',
    price: 1500
  },
  {
    id: '5',
    type: 'sightseeing',
    title: '鉄道博物館',
    from: '鉄道博物館',
    startTime: '14:00',
    endTime: '16:00',
    note: '実物車両36両の展示を見学',
    price: 1500
  },
  {
    id: '6',
    type: 'train',
    title: 'ニューシャトル',
    from: '鉄道博物館駅',
    to: '大宮駅',
    startTime: '16:10',
    endTime: '16:15',
    note: '大宮駅へ戻る',
    price: 191
  },
  {
    id: '7',
    type: 'train',
    title: 'JR川越線',
    from: '大宮駅',
    to: '川越駅',
    startTime: '16:30',
    endTime: '16:55',
    note: '小江戸川越へ移動',
    price: 330
  },
  {
    id: '8',
    type: 'sightseeing',
    title: '小江戸川越散策',
    from: '時の鐘・蔵造りの町並み',
    startTime: '17:00',
    endTime: '19:00',
    note: '時の鐘や菓子屋横丁、ライトアップされた街並みを散策',
    price: 500
  },
  {
    id: '9',
    type: 'sightseeing',
    title: '川越氷川神社',
    from: '川越氷川神社',
    startTime: '19:15',
    endTime: '19:45',
    note: '縁結びの神様へ参拝',
    price: 0
  },
  {
    id: '10',
    type: 'train',
    title: 'JR川越線',
    from: '川越駅',
    to: '大宮駅',
    startTime: '20:10',
    endTime: '20:35',
    note: '大宮へ戻る',
    price: 330
  },
  {
    id: '11',
    type: 'food',
    title: '夕食',
    from: '大宮駅周辺',
    startTime: '20:45',
    endTime: '21:45',
    note: '駅ビルや周辺のレストランでディナー',
    price: 2500
  },
  {
    id: '16',
    type: 'train',
    title: '新幹線 はやぶさ',
    from: '大宮駅',
    to: '新青森',
    startTime: '22:40',
    endTime: '00:50',
    note: '帰路へ',
    price: 16930
  }
];

const getActivityIcon = (type: string) => {
  const mode = ACTIVITY_MODES.find(m => m.type === type);
  return mode ? mode.icon : <Compass size={20} strokeWidth={2} />;
};

const SortableItem = ({ item, onDelete, onEdit, currentTime }: {
  item: TravelItem,
  onDelete: (id: string) => void,
  onEdit: (item: TravelItem) => void,
  currentTime: string
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const mode = ACTIVITY_MODES.find(m => m.type === item.type);

  // Check if this item is currently happening
  const isCurrent = currentTime >= item.startTime && currentTime <= item.endTime;

  const openInGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = item.to ? `${item.from} to ${item.to}` : item.from;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div ref={setNodeRef} style={style} className={`timeline-item ${isDragging ? 'dragging' : ''} ${isCurrent ? 'current-active' : ''}`}>
      <div className="item-line-col">
        <div className={`timeline-icon-marker ${isCurrent ? 'pulse-now' : ''}`}>
          {getActivityIcon(item.type)}
        </div>
      </div>

      <div className="item-content-col">
        <div className="item-content-side">
          <div className="item-header-row">
            <div className="title-time-stack">
              <h3 className="item-title">{item.title}</h3>
              <div className="item-time-row">
                <span className="time-val">{item.startTime} — {item.endTime}</span>
                {item.distance && <span className="dist-val">{item.distance}</span>}
                {item.price && <span className="price-val">¥{item.price.toLocaleString()}</span>}
              </div>
            </div>
            <div className="drag-handle" {...attributes} {...listeners}>
              <GripVertical size={24} />
            </div>
          </div>

          {mode?.isTransport && item.to ? (
            <div className="item-route-box clickable-route" onClick={openInGoogleMaps} title="Googleマップで開く">
              <div className="loc-with-icon">
                <MapPin size={16} />
                <span className="route-text">{item.from}</span>
              </div>
              <div className="route-arrow-sep" />
              <div className="loc-with-icon">
                <MapPin size={16} />
                <span className="route-text">{item.to}</span>
              </div>
              <ExternalLink size={14} className="maps-link-icon" />
            </div>
          ) : (
            <div className="item-route-box clickable-route" onClick={openInGoogleMaps} title="Googleマップで開く">
              <div className="loc-with-icon">
                <MapPin size={16} />
                <span className="route-text">{item.from}</span>
              </div>
              <ExternalLink size={14} className="maps-link-icon" />
            </div>
          )}

          {item.note && <p className="item-note">{item.note}</p>}

          <div className="item-footer-actions">
            <button onClick={() => onEdit(item)} className="footer-action-btn" title="Edit">
              <Pen size={14} /> 編集
            </button>
            <button onClick={() => onDelete(item.id)} className="footer-action-btn del" title="Delete">
              <Trash size={14} /> 削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [tripTitle, setTripTitle] = useState(() => {
    return localStorage.getItem('voyage_title') || '青森・埼玉 鉄道と歴史の旅';
  });
  const [tripDate, setTripDate] = useState(() => {
    return localStorage.getItem('voyage_date') || '2026年1月';
  });
  const [items, setItems] = useState<TravelItem[]>([]); // Start with empty to avoid InitialData overwrite
  const [hasLoaded, setHasLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'syncing' | 'error'>('saved');

  // Fetch from local server on mount
  React.useEffect(() => {
    fetch(`http://${window.location.hostname}:3001/api/itinerary`)
      .then(res => res.json())
      .then(data => {
        if (data.items) setItems(data.items);
        if (data.title) setTripTitle(data.title);
        if (data.date) setTripDate(data.date);
        setHasLoaded(true);
      })
      .catch(() => {
        console.log('Local server not found, falling back to localStorage/InitialData');
        const savedItems = localStorage.getItem('voyage_items');
        setItems(savedItems ? JSON.parse(savedItems) : INITIAL_DATA);
        setHasLoaded(true); // Allow saving to local as fallback
      });
  }, []);

  // Sync to local server and localStorage only after initial load
  React.useEffect(() => {
    if (!hasLoaded) return;

    localStorage.setItem('voyage_items', JSON.stringify(items));
    localStorage.setItem('voyage_title', tripTitle);
    localStorage.setItem('voyage_date', tripDate);

    // Also try to save to local file
    setSyncStatus('syncing');
    fetch(`http://${window.location.hostname}:3001/api/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: tripTitle, date: tripDate, items })
    })
      .then(() => setSyncStatus('saved'))
      .catch(() => setSyncStatus('error'));
  }, [items, tripTitle, tripDate, hasLoaded]);

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TravelItem | null>(null);
  const [formState, setFormState] = useState<Partial<TravelItem>>({
    type: 'train', title: '', from: '', to: '', startTime: '', endTime: '', distance: '', note: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
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
    setFormState({
      type: 'train', title: '', from: '', to: '', startTime: '', endTime: '', distance: '', note: '', price: undefined
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: TravelItem) => {
    setEditingItem(item);
    setFormState({ ...item });
    setIsModalOpen(true);
  };

  const saveItem = () => {
    const newItem: TravelItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      type: formState.type as ActivityType,
      title: formState.title || 'Untitled',
      from: formState.from || '',
      to: formState.to,
      startTime: formState.startTime || '00:00',
      endTime: formState.endTime || '00:00',
      distance: formState.distance,
      note: formState.note,
      price: formState.price ? Number(formState.price) : undefined
    };

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

  const currentMode = ACTIVITY_MODES.find(m => m.type === formState.type);

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ flex: 1 }}>
          <input
            className="input-trip-title"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
            placeholder="旅のタイトルを入力"
          />
          <div className="date-section">
            <CalendarDays size={18} />
            <input
              className="input-trip-date"
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
              placeholder="日程を入力（例: 2026年1月20日 - 24日）"
            />
            <div className={`sync-indicator ${syncStatus}`}>
              {syncStatus === 'syncing' && <RotateCw size={14} className="spin" />}
              {syncStatus === 'saved' && <CloudCheck size={14} />}
              {syncStatus === 'error' && <CloudOff size={14} />}
              <span>
                {syncStatus === 'syncing' && '保存中...'}
                {syncStatus === 'saved' && '同期済み'}
                {syncStatus === 'error' && '同期エラー'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="timeline-view">
        <div className="timeline-axis-line" />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="timeline-items-list">
              <AnimatePresence>
                {items.map((item) => (
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
                      currentTime={currentTime}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>

        <div className="add-btn-container">
          <button className="btn-add-minimal" onClick={openAddModal} title="予定を追加">
            <Plus size={32} />
          </button>
        </div>

        <div className="total-price-section">
          <div className="total-price-card">
            <span className="total-label">合計金額</span>
            <span className="total-val">¥{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
            <motion.div
              className="modal-card"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="modal-header">
                <div>
                  <h2 className="modal-title">{editingItem ? '予定を編集' : '新しい予定を作成'}</h2>
                  <p className="modal-subtitle">旅のプランを詳細に入力してください。</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="close-circle-btn"><X size={24} /></button>
              </div>

              <div className="modal-body">
                <div className="form-section">
                  <label className="section-label">カテゴリー</label>
                  <div className="category-grid">
                    {ACTIVITY_MODES.map(mode => (
                      <div
                        key={mode.type}
                        className={`category-card ${formState.type === mode.type ? 'active' : ''}`}
                        onClick={() => setFormState({ ...formState, type: mode.type })}
                      >
                        <div className="cat-icon">{mode.icon}</div>
                        <span className="cat-label">{mode.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section">
                  <label className="input-label">タイトル</label>
                  <input
                    className="form-input primary"
                    placeholder="例: 京都タワーでディナー"
                    value={formState.title}
                    onChange={e => setFormState({ ...formState, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">開始時間</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formState.startTime}
                      onChange={e => setFormState({ ...formState, startTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">終了時間</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formState.endTime}
                      onChange={e => setFormState({ ...formState, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">出発地 / 場所</label>
                    <input
                      className="form-input"
                      placeholder="地点名を入力"
                      value={formState.from}
                      onChange={e => setFormState({ ...formState, from: e.target.value })}
                    />
                  </div>
                  {currentMode?.isTransport && (
                    <div className="form-group">
                      <label className="input-label">到着地</label>
                      <input
                        className="form-input"
                        placeholder="目的地を入力"
                        value={formState.to}
                        onChange={e => setFormState({ ...formState, to: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">金額 (円)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="例: 1500"
                      value={formState.price || ''}
                      onChange={e => setFormState({ ...formState, price: Number(e.target.value) })}
                    />
                  </div>
                  {currentMode?.isTransport && (
                    <div className="form-group">
                      <label className="input-label">距離 (任意)</label>
                      <input
                        className="form-input"
                        placeholder="例: 5.2km"
                        value={formState.distance || ''}
                        onChange={e => setFormState({ ...formState, distance: e.target.value })}
                      />
                    </div>
                  )}
                </div>


                <div className="form-group">
                  <label className="input-label">メモ (任意)</label>
                  <textarea
                    className="form-input"
                    placeholder="予約番号や持ち物など..."
                    rows={2}
                    value={formState.note}
                    onChange={e => setFormState({ ...formState, note: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-ghost" onClick={() => setIsModalOpen(false)}>キャンセル</button>
                <button className="btn-submit" onClick={saveItem}>
                  {editingItem ? '変更を保存' : '予定を追加する'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
