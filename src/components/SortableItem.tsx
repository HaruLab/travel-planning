import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MapPin, ExternalLink, Pen, Trash, Link, ChevronDown, ChevronUp, Sun, Cloud, CloudRain, Snowflake, CloudLightning, CloudFog, CloudDrizzle, Thermometer } from 'lucide-react';
import type { TravelItem } from '../types';
import { ACTIVITY_MODES, getActivityIcon } from '../constants';
import { CheckSquare, Square } from 'lucide-react';

const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun size={16} color="#f59e0b" />;
    if (code <= 3) return <Cloud size={16} color="#94a3b8" />;
    if (code <= 48) return <CloudFog size={16} color="#94a3b8" />;
    if (code <= 67) return <CloudRain size={16} color="#3b82f6" />;
    if (code <= 77) return <Snowflake size={16} color="#60a5fa" />;
    if (code <= 82) return <CloudDrizzle size={16} color="#3b82f6" />;
    if (code <= 99) return <CloudLightning size={16} color="#6366f1" />;
    return <Thermometer size={16} color="#94a3b8" />;
};

interface SortableItemProps {
    item: TravelItem;
    onDelete: (id: string) => void;
    onEdit: (item: TravelItem) => void;
    onUpdate: (item: TravelItem) => void;
    currentTime: string;
    isCompactMode: boolean;
}

export const SortableItem: React.FC<SortableItemProps> = ({ item, onDelete, onEdit, onUpdate, currentTime, isCompactMode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const [isCollapsed, setIsCollapsed] = useState(isCompactMode);

    useEffect(() => {
        setIsCollapsed(isCompactMode);
    }, [isCompactMode]);

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
                    <div className="item-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div className="title-time-stack" style={{ flex: 1, paddingRight: '1rem' }}>
                            <h3 className="item-title" style={{ lineHeight: 1.2, marginBottom: '0.25rem' }}>{item.title}</h3>
                            <div className="item-time-row">
                                <span className="time-val">{item.startTime}—{item.endTime}</span>
                                {item.distance && <span className="dist-val">{item.distance}</span>}
                                {item.price && <span className="price-val">{item.price.toLocaleString()}円</span>}
                                {item.weatherInfo && (
                                    <span className="weather-badge" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {getWeatherIcon(item.weatherInfo.code)} {item.weatherInfo.temp}°C
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
                                    color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '4px'
                                }}
                                title={isCollapsed ? "展開" : "折りたたむ"}
                            >
                                {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                            </button>
                            <div className="drag-handle" {...attributes} {...listeners} style={{ padding: '8px', cursor: 'grab', color: 'var(--text-dim)', display: 'flex' }}>
                                <GripVertical size={20} />
                            </div>
                        </div>
                    </div>

                    {mode?.isTransport && item.to ? (
                        <div className="item-route-box clickable-route" onClick={openInGoogleMaps} title="Googleマップで開く" style={{ marginTop: '1rem' }}>
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
                        <div className="item-route-box clickable-route" onClick={openInGoogleMaps} title="Googleマップで開く" style={{ marginTop: '1rem' }}>
                            <div className="loc-with-icon">
                                <MapPin size={16} />
                                <span className="route-text">{item.from}</span>
                            </div>
                            <ExternalLink size={14} className="maps-link-icon" />
                        </div>
                    )}

                    {!isCollapsed && (
                        <div style={{ marginTop: '1.5rem' }}>
                            {item.note && <p className="item-note">{item.note}</p>}

                            {item.todos && item.todos.length > 0 && (
                                <div className="todo-section" style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.75rem' }}>ToDo / 持ち物</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {item.todos.map(todo => (
                                            <div
                                                key={todo.id}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: todo.completed ? 0.6 : 1 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newTodos = item.todos!.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t);
                                                    onUpdate({ ...item, todos: newTodos });
                                                }}
                                            >
                                                {todo.completed ? <CheckSquare size={18} color="var(--accent-light)" /> : <Square size={18} color="var(--text-dim)" />}
                                                <span style={{ fontSize: '0.95rem', textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="item-footer-actions">
                                {item.urls && item.urls.length > 0 && item.urls.map((url, index) => (
                                    url.trim() !== '' && (
                                        <button key={index} onClick={() => window.open(url, '_blank')} className="footer-action-btn link" title="リンクを開く">
                                            <Link size={14} /> リンク {item.urls!.length > 1 ? index + 1 : ''}
                                        </button>
                                    )
                                ))}
                                <button onClick={() => onEdit(item)} className="footer-action-btn" title="Edit">
                                    <Pen size={14} /> 編集
                                </button>
                                <button onClick={() => onDelete(item.id)} className="footer-action-btn del" title="Delete">
                                    <Trash size={14} /> 削除
                                </button>
                            </div>

                            {item.mapEmbedCode && (
                                <div className="map-embed-container" style={{ marginTop: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee' }}>
                                    <iframe
                                        src={item.mapEmbedCode.match(/src="([^"]+)"/)?.[1] || ''}
                                        width="100%"
                                        height="600"
                                        style={{ border: 0, display: 'block' }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
