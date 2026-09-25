/**
 * Factory Design System V2 — Central export
 * Import tokens and motion wrappers from here.
 */

export * from './tokens.js';
export {
  FactoryMotion,
  MotionButton,
  MotionCard,
  Reveal,
  Stagger,
  AnimatedMetric,
  PageTransition,
  LayoutTransition,
  AnimatedPresence,
  MotionProgress,
  MotionTabs,
  MotionDrawer,
  MotionToast,
  FACTORY_MOTION_VERSION,
} from './FactoryMotion.jsx';

export {
  Drawer,
  Dialog,
  Popover,
  Tooltip,
  NavigationMenu,
  Combobox,
  Autocomplete,
  useToast,
  ScrollArea,
} from './primitives.jsx';

export const PRIMITIVES_VERSION = '2.0.0';

export const DS_V2 = {
  version:  '2.0.0',
  motion:   'motion/react',
  primitives: 'native-react',
  a11y:     'WCAG-2.1-AA',
};
