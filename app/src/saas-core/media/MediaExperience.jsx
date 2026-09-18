import { useEffect, useRef, useState } from 'react';
import { commitRotation, planRotation, playableMedia, resolveComposition, safeAsset } from './mediaContract.js';
import { useReducedMotion } from '../ui/experienceMotion.js';
import './mediaExperience.css';

export function FallbackImage({ sources, alternativeText }) {
  const [index, setIndex] = useState(0);
  const valid = [...new Set(sources.filter(safeAsset))];
  return index < valid.length
    ? <img className="saas-media-poster" src={valid[index]} alt={alternativeText} decoding="async" onError={() => setIndex(i => i + 1)} />
    : <div className="saas-media-solid" role={alternativeText ? 'img' : undefined} aria-label={alternativeText || undefined} />;
}
function MediaSession({ config, blocked = false, storage }) {
  const reduced = useReducedMotion();
  const video = useRef(null);
  const autoplayAttempted = useRef(false);
  const candidates = playableMedia(config.catalog, { allowPreviewMotion: config.allowPreviewMotion === true });
  const [plan] = useState(() => {
    let target = storage;
    if (target === undefined) { try { target = window.localStorage; } catch { target = null; } }
    return planRotation(playableMedia(config.catalog, { allowPreviewMotion: config.allowPreviewMotion === true }), target, config.namespace);
  });
  const [order, setOrder] = useState(plan.order);
  const [failedOrder, setFailedOrder] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [captions, setCaptions] = useState(true);
  const item = candidates.find(entry => entry.order === order);
  const silent = item?.kind === 'preview_motion_test_assets';
  const failed = failedOrder === order;
  const composition = resolveComposition(config.composition, candidates.length);
  useEffect(() => {
    let target = storage;
    if (target === undefined) { try { target = window.localStorage; } catch { target = null; } }
    commitRotation(plan, target);
  }, [plan, storage]);
  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const pause = () => player.pause();
    const check = () => {
      if (document.hidden || document.querySelector('[aria-modal="true"]')) pause();
    };
    document.addEventListener('visibilitychange', check);
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-modal'] });
    check();
    return () => {
      document.removeEventListener('visibilitychange', check);
      observer.disconnect();
      player.pause();
      // React StrictMode replays mount effects: the replacement player may
      // attempt muted autoplay again after this instance was cleaned up.
      autoplayAttempted.current = false;
    };
  }, [order, failed, reduced]);
  useEffect(() => {
    if (blocked || reduced) video.current?.pause();
  }, [blocked, reduced]);
  useEffect(() => {
    if (config.autoplay && !autoplayAttempted.current && !reduced && !blocked && !document.hidden &&
      !document.querySelector('[aria-modal="true"]') && video.current) {
      autoplayAttempted.current = true;
      video.current.muted = true;
      video.current.play().catch(() => {
        setFailedOrder(order);
        setPlaying(false);
      });
    }
  }, [config.autoplay, reduced, blocked]);
  async function togglePlayback() {
    const player = video.current;
    if (!player || blocked || document.hidden || document.querySelector('[aria-modal="true"]')) return;
    if (!player.paused) { player.pause(); return; }
    try { await player.play(); } catch { setFailedOrder(order); }
  }
  function select(next) {
    video.current?.pause();
    setPlaying(false);
    setMuted(true);
    setCaptions(true);
    setOrder(next.order);
    let target = storage;
    if (target === undefined) { try { target = window.localStorage; } catch { target = null; } }
    commitRotation({ key: plan.key, order: next.order }, target);
  }
  function step(delta) {
    const index = candidates.findIndex(entry => entry.order === order);
    select(candidates[(index + delta + candidates.length) % candidates.length]);
  }
  const sources = [item?.poster, ...config.fallbackImages];
  return <figure className="saas-media" data-variant={composition} data-playing={playing} data-media-state={!item ? 'static' : failed ? 'fallback' : 'ready'} aria-label={config.label}>
    <div className="saas-media-stage">
      <FallbackImage key={sources.join('|')} sources={sources} alternativeText={item?.alternativeText || ''} />
      {item && !failed && !reduced && <video key={item.id} ref={video} className="saas-media-video" playsInline muted={silent || muted}
        preload="none" controls={playing} tabIndex={playing ? 0 : -1} aria-hidden={!playing} poster={item.poster} src={item.video} aria-label={item.title}
        onPlay={() => {
          if (blocked || document.hidden || document.querySelector('[aria-modal="true"]')) video.current?.pause();
          else setPlaying(true);
        }}
        onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onVolumeChange={() => setMuted(video.current?.muted ?? true)}
        onError={() => { setFailedOrder(order); setPlaying(false); }}>
        {item.subtitles.map(track => <track key={track.src} kind="captions" src={track.src} srcLang={track.language} label={track.label} default={track.default !== false}
          onError={() => { video.current?.pause(); setFailedOrder(order); }} />)}
      </video>}
      {config.showCaption !== false && <div className="saas-media-caption">
        <span>{config.eyebrow}</span>
        <strong>{item?.title || config.label}</strong>
      </div>}
    </div>
    {item && !failed && !reduced && <div className="saas-media-controls" role="group" aria-label="Controles audiovisuales">
      <button type="button" onClick={togglePlayback} disabled={blocked}>{playing ? 'Pausar' : 'Reproducir'}</button>
      {!silent && <>
      <button type="button" onClick={() => { if (video.current) video.current.muted = !video.current.muted; }} aria-pressed={!muted}>{muted ? 'Activar sonido' : 'Silenciar'}</button>
      <button type="button" aria-pressed={captions} onClick={() => {
        const next = !captions;
        if (video.current) [...video.current.textTracks].forEach((track, index) => { track.mode = next && index === 0 ? 'showing' : 'hidden'; });
        setCaptions(next);
      }}>Subtítulos</button>
      </>}
    </div>}
    {item && !silent && <details className="saas-media-transcript"><summary>Leer transcripción</summary><p>{item.transcript}</p></details>}
    {candidates.length > 1 && ['carousel', 'editorial', 'mosaic'].includes(composition) && <div className="saas-media-choices" role="group" aria-label="Elegir contenido audiovisual">
      {composition === 'carousel' ? <>
        <button type="button" onClick={() => step(-1)}>Anterior</button>
        <span aria-live="polite">{candidates.findIndex(entry => entry.order === order) + 1} / {candidates.length}</span>
        <button type="button" onClick={() => step(1)}>Siguiente</button>
      </> : candidates.map(entry => <button key={entry.id} type="button" aria-pressed={entry.order === order} onClick={() => select(entry)}>
        {composition === 'mosaic' && <img src={entry.poster} alt="" loading="lazy" decoding="async" />}
        {entry.title}
      </button>)}
    </div>}
    <figcaption className="saas-media-accessible-caption">{item?.title || config.label}</figcaption>
  </figure>;
}
export default function MediaExperience(props) {
  return <MediaSession key={props.config.namespace} {...props} />;
}
