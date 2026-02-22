import { useEffect } from 'react';
import socketClient from '../services/socketClient';

/**
 * useRealTimeSync Hook
 * Listens for 'db_update' events on specific collections and triggers a refresh callback.
 * 
 * @param collections - Array of collection names to listen for (e.g., ['jobapplications', 'jobs']).
 *                      Use empty array [] or undefined to listen for ALL collections.
 * @param onUpdate - Callback function to trigger when a matching update occurs.
 */
export const useRealTimeSync = (
    collections: string[] | undefined,
    onUpdate: (data: any) => void
) => {
    useEffect(() => {
        const handleUpdate = (data: any) => {
            const { collection, type } = data;

            // Check if we care about this specific collection
            if (!collections || collections.length === 0 || collections.includes(collection)) {
                console.log(`🔄 Real-time update received for ${collection}:`, type);
                onUpdate(data);
            }
        };

        // Listen for global DB updates
        socketClient.on('db_update', handleUpdate);

        // Cleanup on unmount
        return () => {
            socketClient.off('db_update', handleUpdate);
        };
    }, [collections, onUpdate]);
};
