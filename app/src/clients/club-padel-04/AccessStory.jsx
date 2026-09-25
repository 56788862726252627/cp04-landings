import { useRef } from 'react';
import { FallbackImage } from '../../saas-core/media/MediaExperience.jsx';
import { useViewportReveal } from '../../saas-core/ui/experienceMotion.js';
import { ACCESS_BACKGROUND } from './accessExperience.js';
export default function AccessStory() {
  return <div className="cp04-access-story" data-reveal>
    <figure className="saas-media" data-media-state="static" aria-label="Club Pádel 04">
      <div className="saas-media-stage">
        <FallbackImage sources={ACCESS_BACKGROUND.fallbackImages} alternativeText="" />
      </div>
    </figure>
  </div>;
}
export function AccessShell({ children, ...props }) {
  const ref = useRef(null);
  useViewportReveal(ref);
  return <section ref={ref} {...props}>
    {children}
  </section>;
}
