import React from 'react';
import {
    TrainFront,
    BusFront,
    Plane,
    PersonStanding,
    Camera,
    Utensils,
    BedDouble,
    Compass
} from 'lucide-react';
import type { ActivityType, TravelItem } from './types';

export const ACTIVITY_MODES: { type: ActivityType; icon: React.ReactNode; label: string; isTransport: boolean }[] = [
    { type: 'train', icon: <TrainFront size={20} strokeWidth={2} />, label: '電車', isTransport: true },
    { type: 'bus', icon: <BusFront size={20} strokeWidth={2} />, label: 'バス', isTransport: true },
    { type: 'plane', icon: <Plane size={20} strokeWidth={2} />, label: '飛行機', isTransport: true },
    { type: 'walk', icon: <PersonStanding size={20} strokeWidth={2} />, label: '徒歩', isTransport: true },
    { type: 'sightseeing', icon: <Camera size={20} strokeWidth={2} />, label: '観光', isTransport: false },
    { type: 'food', icon: <Utensils size={20} strokeWidth={2} />, label: '食事', isTransport: false },
    { type: 'stay', icon: <BedDouble size={20} strokeWidth={2} />, label: '宿泊', isTransport: false },
    { type: 'other', icon: <Compass size={20} strokeWidth={2} />, label: 'その他', isTransport: false },
];

// Comprehensive mapping of Japanese prefectures and major cities to their coordinates
// This ensures 100% accuracy for common location names in the itinerary
export const JAPAN_LOCATIONS: Record<string, { lat: number; lon: number }> = {
    '北海道': { lat: 43.0642, lon: 141.3469 }, '札幌': { lat: 43.0642, lon: 141.3469 },
    '青森': { lat: 40.8244, lon: 140.74 },
    '岩手': { lat: 39.7036, lon: 141.1527 }, '盛岡': { lat: 39.7036, lon: 141.1527 },
    '宮城': { lat: 38.2682, lon: 140.8694 }, '仙台': { lat: 38.2682, lon: 140.8694 },
    '秋田': { lat: 39.7186, lon: 140.1024 },
    '山形': { lat: 38.2554, lon: 140.3396 },
    '福島': { lat: 37.7503, lon: 140.4675 },
    '茨城': { lat: 36.3418, lon: 140.4468 }, '水戸': { lat: 36.3418, lon: 140.4468 },
    '栃木': { lat: 36.5657, lon: 139.8836 }, '宇都宮': { lat: 36.5657, lon: 139.8836 },
    '群馬': { lat: 36.3895, lon: 139.0634 }, '前橋': { lat: 36.3895, lon: 139.0634 },
    '埼玉': { lat: 35.8569, lon: 139.6489 }, '大宮': { lat: 35.9063, lon: 139.6247 }, 'さいたま': { lat: 35.8569, lon: 139.6489 },
    '千葉': { lat: 35.6073, lon: 140.1063 },
    '東京': { lat: 35.6895, lon: 139.6917 }, '新宿': { lat: 35.6895, lon: 139.6917 }, '渋谷': { lat: 35.6581, lon: 139.7017 }, '上野': { lat: 35.7126, lon: 139.7766 },
    '神奈川': { lat: 35.4478, lon: 139.6425 }, '横浜': { lat: 35.4478, lon: 139.6425 }, '鎌倉': { lat: 35.3192, lon: 139.5467 }, '箱根': { lat: 35.2324, lon: 139.1069 },
    '新潟': { lat: 37.9162, lon: 139.0363 },
    '富山': { lat: 36.6953, lon: 137.2113 },
    '石川': { lat: 36.5613, lon: 136.6562 }, '金沢': { lat: 36.5613, lon: 136.6562 },
    '福井': { lat: 36.0641, lon: 136.2222 },
    '山梨': { lat: 35.6621, lon: 138.5683 }, '甲府': { lat: 35.6621, lon: 138.5683 }, '富士山': { lat: 35.3606, lon: 138.7274 },
    '長野': { lat: 36.6485, lon: 138.1942 }, '軽井沢': { lat: 36.348, lon: 138.635 },
    '岐阜': { lat: 35.3912, lon: 136.7223 },
    '静岡': { lat: 34.9756, lon: 138.3828 }, '熱海': { lat: 35.0963, lon: 139.0717 },
    '愛知': { lat: 35.1815, lon: 136.9066 }, '名古屋': { lat: 35.1815, lon: 136.9066 },
    '三重': { lat: 34.7186, lon: 136.5052 }, '津': { lat: 34.7186, lon: 136.5052 }, '伊勢': { lat: 34.485, lon: 136.705 },
    '滋賀': { lat: 35.0045, lon: 135.8686 }, '大津': { lat: 35.0045, lon: 135.8686 },
    '京都': { lat: 35.0116, lon: 135.7681 }, '嵐山': { lat: 35.012, lon: 135.677 },
    '大阪': { lat: 34.6937, lon: 135.5023 }, '難波': { lat: 34.6648, lon: 135.5019 }, '梅田': { lat: 34.7025, lon: 135.4959 },
    '兵庫': { lat: 34.6913, lon: 135.183 }, '神戸': { lat: 34.6913, lon: 135.183 }, '姫路': { lat: 34.8151, lon: 134.6853 },
    '奈良': { lat: 34.6851, lon: 135.805 },
    '和歌山': { lat: 34.2305, lon: 135.1708 },
    '鳥取': { lat: 35.5011, lon: 134.2351 },
    '島根': { lat: 35.4681, lon: 133.0484 }, '松江': { lat: 35.4681, lon: 133.0484 }, '出雲': { lat: 35.3606, lon: 132.7547 },
    '岡山': { lat: 34.6618, lon: 133.9344 },
    '広島': { lat: 34.3853, lon: 132.4553 }, '宮島': { lat: 34.295, lon: 132.32 },
    '山口': { lat: 34.1785, lon: 131.4737 },
    '徳島': { lat: 34.0703, lon: 134.5548 },
    '香川': { lat: 34.3402, lon: 134.0434 }, '高松': { lat: 34.3402, lon: 134.0434 },
    'Ehime': { lat: 33.8392, lon: 132.7654 }, '愛媛': { lat: 33.8392, lon: 132.7654 }, '松山': { lat: 33.8392, lon: 132.7654 },
    '高知': { lat: 33.5597, lon: 133.5311 },
    '福岡': { lat: 33.5904, lon: 130.4017 }, '博多': { lat: 33.5904, lon: 130.4017 },
    '佐賀': { lat: 33.2635, lon: 130.3008 },
    '長崎': { lat: 32.7503, lon: 129.8777 },
    '熊本': { lat: 32.8032, lon: 130.7079 },
    '大分': { lat: 33.2382, lon: 131.6126 }, '別府': { lat: 33.2783, lon: 131.5039 },
    '宮崎': { lat: 31.9077, lon: 131.4202 },
    '鹿児島': { lat: 31.5966, lon: 130.5571 },
    '沖縄': { lat: 26.2124, lon: 127.6809 }, '那覇': { lat: 26.2124, lon: 127.6809 }, '石垣': { lat: 24.3411, lon: 124.1561 },
};

export const INITIAL_DATA: TravelItem[] = [];

export const getActivityIcon = (type: string) => {
    const mode = ACTIVITY_MODES.find(m => m.type === type);
    return mode ? mode.icon : <Compass size={20} strokeWidth={2} />;
};
