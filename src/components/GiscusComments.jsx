'use client';

import { useEffect, useRef } from 'react';

export default function GiscusComments() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'FunctionOverride000/FunctionOverride');
    script.setAttribute('data-repo-id', 'R_kgDORciNZg');
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', 'DIC_kwDORciNZs4C4BTe');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'transparent_dark');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    ref.current.appendChild(script);
  }, []);

  return (
    <div className="mt-16 pt-10 border-t border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] tracking-[3px] text-gray-600">COMMENTS</span>
        <div className="flex-1 h-px bg-gray-900" />
      </div>
      <div ref={ref} />
    </div>
  );
}