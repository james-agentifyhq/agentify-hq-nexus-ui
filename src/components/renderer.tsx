import { useEffect, useRef, useState } from 'react';

// Dynamically import Quill only on client-side
let Quill: any = null;
if (typeof window !== 'undefined') {
  const QuillModule = require('quill');
  Quill = QuillModule.default || QuillModule;
}

interface RendererProps {
  value: string;
}

const Renderer = ({ value }: RendererProps) => {
  const [isEmpty, setIsEmpty] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rendererRef.current || !Quill || typeof document === 'undefined') {
      return;
    }

    const container = rendererRef.current;

    const quill = new Quill(document.createElement('div'), {
      theme: 'snow',
    });

    quill.enable(false);

    const contents = JSON.parse(value);
    quill.setContents(contents);

    const isEmpty =
      quill
        .getText()
        .replace(/<(.|\n)*?>/g, '')
        .trim().length === 0;

    setIsEmpty(isEmpty);

    container.innerHTML = quill.root.innerHTML;

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [value]);

  if (isEmpty) return null;

  return <div ref={rendererRef} className="ql-editor ql-renderer" />;
};

export default Renderer;
