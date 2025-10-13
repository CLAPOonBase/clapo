import { useState, useEffect } from 'react';
import { usePostToken } from './usePostToken';

export const usePostTokenPrice = (postId: string) => {
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getCurrentPrice, getActualPrice } = usePostToken();

  useEffect(() => {
    const fetchPrice = async () => {
      if (!postId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const tokenUuid = postId; // postId is already the UUID
        
        // Try to get the actual price first, fallback to current price
        let postPrice = 0;
        try {
          postPrice = await getActualPrice(tokenUuid);
        } catch (err) {
          console.log('Failed to get actual price, trying current price:', err);
          postPrice = await getCurrentPrice(tokenUuid);
        }
        
        setPrice(postPrice);
      } catch (err) {
        console.error('Error fetching post token price:', err);
        setError('Failed to load price');
        setPrice(0);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();

    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => clearInterval(interval);
  }, [postId, getCurrentPrice, getActualPrice]);

  return { price, loading, error };
};