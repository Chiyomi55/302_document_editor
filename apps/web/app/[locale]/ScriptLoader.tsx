'use client'
import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectGlobal } from '../store/globalSlice';
const ScriptLoader = () => {
  const global = useAppSelector(selectGlobal)
  useEffect(() => {
    const width = document.body.clientWidth;
    const showBrand = process.env.NEXT_PUBLIC_SHOW_BRAND === "true";
    if (width > 768 && showBrand) {
      const script = document.createElement('script');
      script.src =
        'https://assets.salesmartly.com/js/project_177_61_1649762323.js';
      document.body.appendChild(script);
    }
  }, [global.settings?.hideBrand]);

  return null;
};

export default ScriptLoader;