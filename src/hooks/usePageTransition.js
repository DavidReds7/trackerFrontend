import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTransition = () => {
  const { pathname } = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    const timer = setTimeout(() => setTransitioning(false), 220);
    return () => clearTimeout(timer);
  }, [pathname]);

  return { transitioning };
};

export default usePageTransition;
