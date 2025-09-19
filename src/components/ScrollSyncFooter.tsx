import { useEffect, useRef } from 'react';

interface ScrollSyncFooterProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

export function ScrollSyncFooter({ contentRef }: ScrollSyncFooterProps) {
  const footerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const footer = footerRef.current;
    const spacer = spacerRef.current;

    if (!content || !footer || !spacer) return;

    // Atualizar largura do spacer para corresponder ao conteúdo
    const updateSpacerWidth = () => {
      const contentScrollWidth = content.scrollWidth;
      spacer.style.width = `${contentScrollWidth}px`;
    };

    // Sincronizar scroll entre conteúdo e footer
    const syncScrollToFooter = () => {
      footer.scrollLeft = content.scrollLeft;
    };

    const syncScrollToContent = () => {
      content.scrollLeft = footer.scrollLeft;
    };

    // Event listeners
    content.addEventListener('scroll', syncScrollToFooter);
    footer.addEventListener('scroll', syncScrollToContent);

    // Observer para mudanças no DOM
    const resizeObserver = new ResizeObserver(updateSpacerWidth);
    resizeObserver.observe(content);

    // Configuração inicial
    updateSpacerWidth();

    return () => {
      content.removeEventListener('scroll', syncScrollToFooter);
      footer.removeEventListener('scroll', syncScrollToContent);
      resizeObserver.disconnect();
    };
  }, [contentRef]);

  return (
    <div ref={footerRef} className="kanban-scroll-footer">
      <div ref={spacerRef} className="kanban-scroll-spacer" />
    </div>
  );
}
