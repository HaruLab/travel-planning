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
    useEffect(() => {
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

    return {
        tripTitle,
        setTripTitle,
        tripDate,
        setTripDate,
        items,
        setItems,
        hasLoaded,
        syncStatus
    };
};
