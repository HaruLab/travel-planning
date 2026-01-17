import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MapPin, ExternalLink, Pen, Trash } from 'lucide-react';
import type { TravelItem } from '../types';
import { ACTIVITY_MODES, getActivityIcon } from '../constants';

interface SortableItemProps {
    item: TravelItem;
    onDelete: (id: string) => void;
    onEdit: (item: TravelItem) => void;
    currentTime: string;
}

export const SortableItem: React.FC<SortableItemProps> = ({ item, onDelete, onEdit, currentTime }) => {
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
