import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Notification "stats en direct", distincte de celle du plugin de
 * géolocalisation en arrière-plan (qui doit rester statique — c'est elle
 * qui garde le service Android actif). Celle-ci sert uniquement d'affichage
 * — se met à jour périodiquement pendant l'enregistrement, et se répercute
 * automatiquement sur une montre connectée (Wear OS reflète les
 * notifications du téléphone par défaut, sans code spécifique à la montre).
 */
const CHANNEL_ID = 'bolac-live-stats';
const NOTIFICATION_ID = 424_242;

let channelReady = false;
let notificationCreated = false;

async function ensureChannel(): Promise<void> {
  if (channelReady) return;
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'Statistiques en direct',
    description: 'Distance, vitesse et temps pendant un enregistrement.',
    // Importance basse (2 = LOW) : la notification se met à jour sans son
    // ni pop-up à chaque rafraîchissement — sinon ça sonnerait/vibrerait à
    // chaque mise à jour, ce qui serait très vite agaçant.
    importance: 2,
    visibility: 1,
  }).catch(() => undefined);
  channelReady = true;
}

/** Affiche ou met à jour la notification de stats en direct (même id à chaque fois, pas de doublon). */
export async function updateLiveStatsNotification(title: string, body: string): Promise<void> {
  await ensureChannel();
  const notifications = [
    {
      id: NOTIFICATION_ID,
      title,
      body,
      channelId: CHANNEL_ID,
      ongoing: true,
      autoCancel: false,
    },
  ];
  if (notificationCreated) {
    await LocalNotifications.update({ notifications }).catch(() => undefined);
  } else {
    await LocalNotifications.schedule({ notifications }).catch(() => undefined);
    notificationCreated = true;
  }
}

/** Retire la notification de stats en direct (fin d'enregistrement). */
export async function clearLiveStatsNotification(): Promise<void> {
  await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] }).catch(() => undefined);
  notificationCreated = false;
}
