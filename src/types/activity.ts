/** Type d'activité de plein air pratiquée pendant un trajet. */
export type ActivityType =
  | 'randonnee'
  | 'canot'
  | 'kayak'
  | 'paddleboard'
  | 'voile'
  | 'velo'
  | 'course'
  | 'raquette'
  | 'ski-fond'
  | 'ski-rando'
  | 'patin';

/** Ordre d'affichage dans le sélecteur de sport, du plus courant au moins courant. */
export const ACTIVITY_ORDER: ActivityType[] = [
  'randonnee',
  'canot',
  'kayak',
  'paddleboard',
  'voile',
  'velo',
  'course',
  'raquette',
  'ski-fond',
  'ski-rando',
  'patin',
];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  randonnee: 'Randonnée / marche',
  canot: 'Canot',
  kayak: 'Kayak',
  paddleboard: 'Paddleboard',
  voile: 'Voile',
  velo: 'Vélo',
  course: 'Course',
  raquette: 'Raquette',
  'ski-fond': 'Ski de fond',
  'ski-rando': 'Ski de randonnée',
  patin: 'Patin',
};

/** Sport proposé par défaut à l'ouverture du dialogue de départ — le plus pratiqué par l'utilisateur. */
export const DEFAULT_ACTIVITY: ActivityType = 'paddleboard';
