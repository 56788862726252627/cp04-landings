// One controller per persistent element. No source/currentTime mutations.
export function createEditorialPlayback(video, { claim, owns, allowed, onPlaying }) {
  let disposed = false;
  let version = 0;
  let pending = null;
  let wanted = false;
  let resumeAfterHidden = false;
  function pause(reason = 'user') {
    const wasPlaying = wanted || !video.paused;
    resumeAfterHidden = reason === 'hidden' && wasPlaying && !video.ended;
    wanted = false;
    pending = null;
    version += 1;
    video.pause();
    onPlaying(false);
  }
  async function play() {
    if (disposed || !allowed()) return;
    claim();
    wanted = true;
    resumeAfterHidden = false;
    const attempt = ++version;
    pending = attempt;
    try {
      await video.play();
      if (!disposed && (!owns() || !allowed() || !wanted)) video.pause();
    } catch {
      if (!disposed && attempt === version) {
        wanted = false;
        onPlaying(false);
      }
    } finally {
      if (pending === attempt) pending = null;
    }
  }
  function visibilityChanged(hidden) {
    if (hidden) {
      if (!resumeAfterHidden) pause('hidden');
    } else if (resumeAfterHidden) {
      resumeAfterHidden = false;
      if (owns() && allowed()) void play();
    }
  }
  const onPlay = () => {
    if (disposed || !owns() || !allowed()) { pause('blocked'); return; }
    wanted = true;
    onPlaying(true);
  };
  const onPause = () => {
    if (!video.paused) return;
    if (pending === null) wanted = false;
    onPlaying(false);
  };
  const onEnded = () => pause('ended');
  video.addEventListener('play', onPlay);
  video.addEventListener('pause', onPause);
  video.addEventListener('ended', onEnded);
  return {
    play, pause, visibilityChanged,
    select: claim,
    toggle() {
      if (wanted || !video.paused) pause('user');
      else void play();
    },
    dispose() {
      disposed = true;
      version += 1;
      wanted = false;
      resumeAfterHidden = false;
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.pause();
    },
  };
}
