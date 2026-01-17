import { useState, useEffect } from 'react';
import type { TravelItem } from '../types';
import { INITIAL_DATA } from '../constants';

export const useItinerary = () => {
    const [tripTitle, setTripTitle] = useState(() => {
        return localStorage.getItem('voyage_title') || '青森・埼玉 鉄道と歴史の旅';
    });
    const [tripDate, setTripDate] = useState(() => {
        return localStorage.getItem('voyage_date') || '2026年1月';
    });
    const [items, setItems] = useState<TravelItem[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'saved' | 'syncing' | 'error'>('saved');

    // Fetch from local server on mount
    useEffect(() => {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isLocalhost) {
            fetch(`http://${window.location.hostname}:3001/api/itinerary`)
                .then(res => res.json())
                .then(data => {
                    if (data.items) setItems(data.items);
                    if (data.title) setTripTitle(data.title);
                    if (data.date) setTripDate(data.date);
                    setHasLoaded(true);
                })
                .catch(() => {
                    console.log('Local server not found, falling back to localStorage');
                    const savedItems = localStorage.getItem('voyage_items');
                    setItems(savedItems ? JSON.parse(savedItems) : INITIAL_DATA);
                    setHasLoaded(true);
                });
        } else {
            // Production: Always use localStorage
            const savedItems = localStorage.getItem('voyage_items');
            setItems(savedItems ? JSON.parse(savedItems) : INITIAL_DATA);
            setHasLoaded(true);
        }
    }, []);

    // Sync to local server and localStorage only after initial load
    useEffect(() => {
        if (!hasLoaded) return;

        localStorage.setItem('voyage_items', JSON.stringify(items));
        localStorage.setItem('voyage_title', tripTitle);
        localStorage.setItem('voyage_date', tripDate);

        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
            setSyncStatus('syncing');
            fetch(`http://${window.location.hostname}:3001/api/itinerary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: tripTitle, date: tripDate, items })
            })
                .then(() => setSyncStatus('saved'))
                .catch(() => setSyncStatus('error'));
        }
    }, [items, tripTitle, tripDate, hasLoaded]);

    const exportData = () => {
        const data = { title: tripTitle, date: tripDate, items };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tripTitle || 'travel'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importData = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.items) setItems(data.items);
                if (data.title) setTripTitle(data.title);
                if (data.date) setTripDate(data.date);
                alert('データを読み込みました');
            } catch (err) {
                alert('ファイル形式が正しくありません');
            }
        };
        reader.readAsText(file);
    };

    return {
        tripTitle,
        setTripTitle,
        tripDate,
        setTripDate,
        items,
        setItems,
        hasLoaded,
        syncStatus,
        exportData,
        importData
    };
};
