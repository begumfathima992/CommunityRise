import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * RevealBox
 * Thin wrapper that applies the scroll-reveal treatment to any
 * children, so pages don't need to repeat the ref/className wiring.
 */
export default function RevealBox({ as: Tag = 'div', className = '', style, children }) {
  const [ref, visible] = useScrollReveal();
  return (
    <Tag ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
