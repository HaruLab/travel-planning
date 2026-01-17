import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { TravelItem, ActivityType } from '../types';
import { ACTIVITY_MODES } from '../constants';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingItem: TravelItem | null;
    onSave: (item: TravelItem) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, editingItem, onSave }) => {
    const [formState, setFormState] = React.useState<Partial<TravelItem>>({
        type: 'train', title: '', from: '', to: '', startTime: '', endTime: '', distance: '', note: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setFormState({ ...editingItem });
            } else {
                setFormState({
                    type: 'train', title: '', from: '', to: '', startTime: '', endTime: '', distance: '', note: '', price: undefined
                });
            }
        }
    }, [isOpen, editingItem]);

    const handleSave = () => {
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
        onSave(newItem);
    };

    const currentMode = ACTIVITY_MODES.find(m => m.type === formState.type);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
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
                            <button onClick={onClose} className="close-circle-btn"><X size={24} /></button>
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
                            <button className="btn-ghost" onClick={onClose}>キャンセル</button>
                            <button className="btn-submit" onClick={handleSave}>
                                {editingItem ? '変更を保存' : '予定を追加する'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
