import { useState, useEffect } from 'react';

export function useUsernameCheck(username: string) {
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/check-username/${username}`
        );
        const data = await response.json();
        setUsernameAvailable(data.available);
      } catch (error) {
        console.error('Error checking username:', error);
        // If endpoint doesn't exist yet, assume available
        setUsernameAvailable(true);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setCheckingUsername(false);
    };
  }, [username]);

  return { usernameAvailable, checkingUsername };
}
