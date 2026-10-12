import { useCallback, useEffect, useState } from 'react';
export default function useContentEditor(initial) {
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const dirty = JSON.stringify(data) !== saved;
  const markSaved = useCallback(value => setSaved(JSON.stringify(value)), []);
  const resetData = useCallback(value => { setData(value); setSaved(JSON.stringify(value)); }, []);
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  return { data, setData, resetData, markSaved, dirty };
}
