import { useEffect, useRef } from 'react';

interface ScrollSyncFooterProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

export function ScrollSyncFooter({ contentRef }: ScrollSyncFooterProps) {
  const footerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const verticalScrollRef = useRef<HTMLDivElement>(null);
  const verticalSpacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const footer = footerRef.current;
    const spacer = spacerRef.current;
    const verticalScroll = verticalScrollRef.current;
    const verticalSpacer = verticalSpacerRef.current;

    if (!content || !footer || !spacer || !verticalScroll || !verticalSpacer) return;

    // Atualizar largura do spacer para corresponder ao conteúdo horizontal
    const updateSpacerWidth = () => {
      const contentScrollWidth = content.scrollWidth;
      spacer.style.width = `${contentScrollWidth}px`;
    };

    // Atualizar altura do spacer para corresponder ao conteúdo vertical
    const updateVerticalSpacerHeight = () => {
      const contentScrollHeight = content.scrollHeight;
      verticalSpacer.style.height = `${contentScrollHeight}px`;
    };

    // Sincronizar scroll horizontal entre conteúdo e footer
    const syncHorizontalScrollToFooter = () => {
      footer.scrollLeft = content.scrollLeft;
    };

    const syncHorizontalScrollToContent = () => {
      content.scrollLeft = footer.scrollLeft;
    };

    // Sincronizar scroll vertical entre conteúdo e barra lateral
    const syncVerticalScrollToSidebar = () => {
      verticalScroll.scrollTop = content.scrollTop;
    };

    const syncVerticalScrollToContent = () => {
      content.scrollTop = verticalScroll.scrollTop;
    };

    // Event listeners horizontais
    content.addEventListener('scroll', syncHorizontalScrollToFooter);
    footer.addEventListener('scroll', syncHorizontalScrollToContent);

    // Event listeners verticais
    content.addEventListener('scroll', syncVerticalScrollToSidebar);
    verticalScroll.addEventListener('scroll', syncVerticalScrollToContent);

    // Observer para mudanças no DOM
    const resizeObserver = new ResizeObserver(() => {
      updateSpacerWidth();
      updateVerticalSpacerHeight();
    });
    resizeObserver.observe(content);

    // Configuração inicial
    updateSpacerWidth();
    updateVerticalSpacerHeight();

    return () => {
      content.removeEventListener('scroll', syncHorizontalScrollToFooter);
      footer.removeEventListener('scroll', syncHorizontalScrollToContent);
      content.removeEventListener('scroll', syncVerticalScrollToSidebar);
      verticalScroll.removeEventListener('scroll', syncVerticalScrollToContent);
      resizeObserver.disconnect();
    };
  }, [contentRef]);

  return (
    <>
      {/* Barra horizontal no footer */}
      <div ref={footerRef} className="kanban-scroll-footer">
        <div ref={spacerRef} className="kanban-scroll-spacer" />
      </div>
      
      {/* Barra vertical na lateral direita */}
      <div ref={verticalScrollRef} className="kanban-scroll-vertical">
        <div ref={verticalSpacerRef} className="kanban-scroll-vertical-spacer" />
      </div>
    </>
  );
}
