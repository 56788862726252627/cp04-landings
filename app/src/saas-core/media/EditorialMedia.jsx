import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../ui/experienceMotion.js';
import { createEditorialPlayback } from './editorialPlayback.js';
import './editorialMedia.css';

function useSaveData() {
  const [saving, setSaving] = useState(() => Boolean(navigator.connection?.saveData));
  useEffect(() => {
    const connection = navigator.connection;
    const update = () => setSaving(Boolean(connection?.saveData));
    connection?.addEventListener('change', update);
    return () => connection?.removeEventListener('change', update);
  }, []);
  return saving;
}

function EditorialPiece({ item, active, register, blocked, reduced, saving }) {
  const stage = useRef(null);
  const player = useRef(null);
  const controller = useRef(null);
  const visible = useRef(false);
  const isBlocked = useRef(blocked);
  const requested = useRef(false);
  // Keep the same element after its first explicit request, including offscreen/error.
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [captionFailed, setCaptionFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [captions, setCaptions] = useState(true);

  useEffect(() => {
    isBlocked.current = blocked;
    if (blocked) {
      requested.current = false;
      controller.current?.pause('modal');
    }
  }, [blocked]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      visible.current = true;
      return;
    }
    const observer = new IntersectionObserver(entries => {
      visible.current = entries[0].isIntersecting && entries[0].intersectionRatio >= .2;
      if (!visible.current) {
        requested.current = false;
        controller.current?.pause('viewport');
      }
    }, { threshold: [0, .2] });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const video = player.current;
    const caption = video.querySelector('track');
    const onCaptionError = () => { setCaptionFailed(true); setCaptions(false); };
    // Track error does not bubble: listen on the track itself.
    caption?.addEventListener('error', onCaptionError);
    if (caption?.readyState === 3) onCaptionError();
    // Match the initial captions button state even if browser preferences default to off.
    for (const track of video.textTracks) track.mode = 'showing';
    const registration = register(item.id);
    const playback = createEditorialPlayback(video, {
      claim: registration.claim,
      owns: registration.owns,
      allowed: () => visible.current && !isBlocked.current && !document.hidden && !document.querySelector('[aria-modal="true"]'),
      onPlaying: setPlaying,
    });
    registration.attach(playback);
    controller.current = playback;
    const onVisibility = () => playback.visibilityChanged(document.hidden);
    const onModal = () => {
      if (document.querySelector('[aria-modal="true"]')) playback.pause('modal');
    };
    document.addEventListener('visibilitychange', onVisibility);
    const observer = new MutationObserver(onModal);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-modal'] });
    if (requested.current) void playback.play();
    return () => {
      caption?.removeEventListener('error', onCaptionError);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      playback.dispose();
      registration.remove();
      controller.current = null;
    };
  }, [loaded, item.id, register]);

  function toggle() {
    if (controller.current) controller.current.toggle();
    else {
      requested.current = true;
      setLoaded(true);
    }
  }

  return <article className="saas-editorial-piece" data-piece={item.id} data-active={active} aria-labelledby={item.id + '-title'}>
    <header className="saas-editorial-heading">
      <span aria-hidden="true">{String(item.order + 1).padStart(2, '0')}</span>
      <h3 id={item.id + '-title'}>{item.title}</h3>
      <span>{item.duration} s</span>
    </header>
    <div ref={stage} className="saas-editorial-stage">
      {!imageFailed && <img src={item.poster} alt="Ilustración generada para esta pieza educativa" loading="lazy" decoding="async" width="1280" height="720" onError={() => setImageFailed(true)} />}
      {loaded && <video ref={player} src={item.video} poster={item.poster} preload="metadata" playsInline controls muted={muted} aria-label={item.title}
        style={failed ? { display: 'none' } : undefined}
        onPointerDown={() => controller.current?.select()}
        onKeyDown={() => controller.current?.select()}
        onVolumeChange={() => setMuted(player.current?.muted ?? true)}
        onError={() => { controller.current?.pause('error'); setFailed(true); }}>
        <track kind="captions" src={item.subtitles} srcLang="es" label="Español" default />
      </video>}
    </div>
    {failed ? <p role="status">No se ha podido cargar el vídeo. Puedes leer su transcripción.</p> : <div className="saas-editorial-controls" role="group" aria-label={'Controles: ' + item.title}>
      <button type="button" disabled={blocked} onClick={toggle}>{playing ? 'Pausar' : 'Reproducir'}<span className="saas-editorial-sr"> {item.title}</span></button>
      <button type="button" disabled={!loaded || blocked} aria-pressed={!muted} onClick={() => { if (player.current) player.current.muted = !player.current.muted; }}>{muted ? 'Activar sonido' : 'Silenciar'}</button>
      <button type="button" disabled={!loaded || captionFailed} aria-pressed={captions} onClick={() => {
        const next = !captions;
        if (player.current) [...player.current.textTracks].forEach(track => { track.mode = next ? 'showing' : 'hidden'; });
        setCaptions(next);
      }}>Subtítulos</button>
    </div>}
    {captionFailed && <p role="status">No se han podido cargar los subtítulos. Puedes leer la transcripción.</p>}
    {(reduced || saving) && <p className="saas-editorial-note">Vista estática. Reproduce solo si deseas cargar el vídeo.</p>}
    <details className="saas-editorial-transcript"><summary>Leer transcripción: {item.title}</summary><p>{item.transcript}</p></details>
  </article>;
}

export default function EditorialMedia({ catalog, label, disclosure, blocked = false }) {
  const owners = useRef(new Map());
  const selected = useRef(null);
  const [active, setActive] = useState(null);
  const reduced = useReducedMotion();
  const saving = useSaveData();
  const register = useCallback(id => {
    let instance;
    return {
      attach(playback) { instance = playback; owners.current.set(id, playback); },
      owns: () => selected.current === id,
      claim() {
        for (const [other, playback] of owners.current) if (other !== id) playback.pause('selection');
        selected.current = id;
        setActive(id);
      },
      remove() {
        if (owners.current.get(id) === instance) owners.current.delete(id);
        if (selected.current === id) selected.current = null;
      },
    };
  }, []);
  if (!catalog.length) return null;
  return <section className="saas-editorial-media" aria-label={label}>
    <div className="saas-editorial-intro"><h2>{label}</h2><p>{disclosure}</p></div>
    {catalog.map(item => <EditorialPiece key={item.id} item={item} active={active === item.id} register={register} blocked={blocked} reduced={reduced} saving={saving} />)}
  </section>;
}
