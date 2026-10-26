export interface GalleryItem {
  src: string;
  w: number;
  h: number;
  alt: string;
  cap: string;
  featured?: boolean;
}

export const gallery: GalleryItem[] = [
  { src: '/img/gallery-invitational-poster.webp', w: 800, h: 1200, alt: 'Match poster for the MMC Poppy Lebethe Invitational Football Tournament, Bethanie United East versus Bethanie United West, Sunday 20 September 2026 at Bethanie Sports Grounds', cap: 'MMC Poppy Lebethe Invitational: Bethanie United East vs West' },
  { src: '/img/gallery-team-red.webp', w: 1000, h: 450, alt: 'Bethanie United FC junior players in red kit posing together on the pitch with the hills of Bethanie behind them', cap: 'Our juniors, ready to play', featured: true },
  { src: '/img/gallery-lineup.webp', w: 1000, h: 450, alt: 'Two junior teams lined up on the halfway line before kick-off', cap: 'Teams lined up before kick-off', featured: true },
  { src: '/img/gallery-thank-you.webp', w: 800, h: 1200, alt: 'Thank-you poster from the Bethanie United FC family after the MMC Poppy Lebethe Invitational Tournament, naming Spanish Eagles FC, Shorty FC, Bethanie Superstrikers FC and Bethanie United FC', cap: 'Thank you to Spanish Eagles FC, Shorty FC, Bethanie Superstrikers FC and everyone who made the tournament a success' },
  { src: '/img/gallery-clinic.webp', w: 1000, h: 562, alt: 'Young players seated on the grass with footballs during a Madibeng Local Football Association event at Bethanie', cap: 'Madibeng Local Football Association event' },
  { src: '/img/gallery-sideline.webp', w: 1000, h: 450, alt: 'Young players on the sideline watching a match at Bethanie Sports Grounds', cap: 'On the touchline at Bethanie Sports Grounds' },
  { src: '/img/gallery-training.webp', w: 1000, h: 450, alt: 'Children playing football on the training pitch at Bethanie with portable goals', cap: 'Training day at Bethanie', featured: true },
];
