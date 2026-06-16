import { useState, useEffect } from 'react';

export default function useBoards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBoards() {
      try {
        const response = await fetch('http://localhost:5000/api/boards');
        const data = await response.json();
        setBoards(data.map(b => b.name));
      } catch (err) {
        console.error('Failed to fetch boards:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBoards();
  }, []);

  return { boards, loading };
}
