import { Hammer, GraduationCap, PenLine, Scale } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Suggestion {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  prompt: string;
}

export const suggestions: Suggestion[] = [
  {
    icon: Hammer,
    title: 'Build',
    subtitle: 'Plan a small app from scratch',
    prompt: 'Help me plan and build a small app from scratch.',
  },
  {
    icon: GraduationCap,
    title: 'Learn',
    subtitle: 'Teach me any skill, step by step',
    prompt: 'Teach me a new skill step by step.',
  },
  {
    icon: PenLine,
    title: 'Write',
    subtitle: 'Draft a clear email or proposal',
    prompt: 'Help me draft a clear and professional email.',
  },
  {
    icon: Scale,
    title: 'Decide',
    subtitle: 'Weigh up a tough choice with me',
    prompt: 'Help me think through a tough decision by weighing the pros and cons.',
  },
];
