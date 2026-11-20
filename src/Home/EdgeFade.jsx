/** Black gradient strips for section boundaries. Drop inside any `relative` section. */
export default function EdgeFade({ top = false, bottom = false, color = '#000000', size = '22vh' }) {
  const base = 'pointer-events-none absolute inset-x-0 z-20';
  return (
    <>
      {top && <div aria-hidden="true" className={`${base} top-0`} style={{ height: size, background: `linear-gradient(to bottom, ${color}, ${color}cc 35%, transparent)` }} />}
      {bottom && <div aria-hidden="true" className={`${base} bottom-0`} style={{ height: size, background: `linear-gradient(to top, ${color}, ${color}cc 35%, transparent)` }} />}
    </>
  );
}
