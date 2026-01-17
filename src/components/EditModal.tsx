import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
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
        type: 'train', title: '', from: '', to: '', startTime: '', endTime: '', distance: '', urls: [], mapEmbedCode: '', note: '', todos: []
    });

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                setFormState({ ...editingItem });
            } else {
                setFormState({
                    type: 'train', title: '', from: '', to: '', startTime: '', endTime: '', distance: '', urls: [], mapEmbedCode: '', note: '', price: undefined, todos: []
                });
            }
        }
    }, [isOpen, editingItem]);

    // Auto-update map when location changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formState.from) {
                const query = formState.to ? `${formState.from} to ${formState.to}` : formState.from;
                // Remove z=13 to allow auto-fit
                const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&ie=UTF8&iwloc=&output=embed`;
                const newCode = `<iframe src="${embedUrl}" width="100%" height="600" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;

                // Only update if generated code is different from current to avoid loops/redraws
                // Note: This will overwrite manual edits if the user then changes location. This is intended by "auto-update on location change".
                setFormState(prev => {
                    // If manual edit exists (different from what we would generate), we might hesitate?
                    // But user asked for "update whenever input changes".
                    if (prev.mapEmbedCode === newCode) return prev;
                    return { ...prev, mapEmbedCode: newCode };
                });
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [formState.from, formState.to]);

    const handleSave = () => {
        let finalMapEmbedCode = formState.mapEmbedCode;

        // Fallback: Auto-generate if missing and location is available (sync)
        if (!finalMapEmbedCode && formState.from) {
            const query = formState.to ? `${formState.from} to ${formState.to}` : formState.from;
            const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&ie=UTF8&iwloc=&output=embed`;
            finalMapEmbedCode = `<iframe src="${embedUrl}" width="100%" height="600" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
        }

        const newItem: TravelItem = {
            id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
            type: formState.type as ActivityType,
            title: formState.title || 'Untitled',
            from: formState.from || '',
            to: formState.to,
            startTime: formState.startTime || '00:00',
            endTime: formState.endTime || '00:00',
            distance: formState.distance,
            urls: formState.urls,
            mapEmbedCode: finalMapEmbedCode,
            note: formState.note,
            price: formState.price ? Number(formState.price) : undefined,
            todos: formState.todos || [],
            weatherInfo: editingItem?.weatherInfo
        };

        // If crucial fields changed, clear weatherInfo to allow re-fetching
        if (editingItem && (editingItem.from !== newItem.from || editingItem.title !== newItem.title)) {
            newItem.weatherInfo = undefined;
        }

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
                                <label className="input-label">参考URL (複数可・1行に1つ)</label>
                                <textarea
                                    className="form-input"
                                    placeholder="https://example.com&#13;&#10;https://another-site.com"
                                    rows={3}
                                    value={formState.urls?.join('\n') || ''}
                                    onChange={e => setFormState({ ...formState, urls: e.target.value.split('\n') })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="input-label" style={{ marginBottom: '0.5rem' }}>Google Map埋め込み (iframe)</label>
                                <textarea
                                    className="form-input"
                                    placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                                    rows={3}
                                    value={formState.mapEmbedCode || ''}
                                    onChange={e => setFormState({ ...formState, mapEmbedCode: e.target.value })}
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                                    出発地と到着地を入力すると自動で簡易マップが作成されます。Google Mapの「共有」コードを手動で貼り付けることも可能です。
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="input-label">ToDo / 持ち物リスト</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {(formState.todos || []).map((todo, idx) => (
                                        <div key={todo.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                className="form-input"
                                                style={{ flex: 1, padding: '0.6rem 1rem' }}
                                                value={todo.text}
                                                onChange={e => {
                                                    const newTodos = [...(formState.todos || [])];
                                                    newTodos[idx].text = e.target.value;
                                                    setFormState({ ...formState, todos: newTodos });
                                                }}
                                                placeholder="例: 切符を買う"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newTodos = (formState.todos || []).filter((_, i) => i !== idx);
                                                    setFormState({ ...formState, todos: newTodos });
                                                }}
                                                style={{ padding: '0.5rem', background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newTodos = [...(formState.todos || []), { id: Math.random().toString(36).substr(2, 9), text: '', completed: false }];
                                            setFormState({ ...formState, todos: newTodos });
                                        }}
                                        className="btn-ghost"
                                        style={{ width: 'fit-content', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                    >
                                        <Plus size={14} style={{ marginRight: '0.4rem' }} /> タスクを追加
                                    </button>
                                </div>
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
                </div >
            )}
        </AnimatePresence >
    );
};
