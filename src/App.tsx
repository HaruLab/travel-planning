import React, { useState } from 'react';
import {
  Plus,
  CalendarDays,
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import type { TravelItem } from './types';
import { SortableItem } from './components/SortableItem';
import { EditModal } from './components/EditModal';
import { useItinerary } from './hooks/useItinerary';

const App: React.FC = () => {
  const {
    tripTitle,
    setTripTitle,
    tripDate,
    setTripDate,
    items,
    setItems,
    syncStatus
  } = useItinerary();

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

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default App;
