export type ActivityType = 'train' | 'bus' | 'walk' | 'plane' | 'sightseeing' | 'food' | 'stay' | 'other';

export interface TravelItem {
    id: string;
    type: ActivityType;
    title: string;
    from: string;
    to?: string;
    startTime: string;
    endTime: string;
    distance?: string;
    urls?: string[];
    mapEmbedCode?: string;
    note?: string;
    price?: number;
    todos?: { id: string; text: string; completed: boolean }[];
    weatherInfo?: { temp: number; code: number; sunrise?: string; sunset?: string };
}
