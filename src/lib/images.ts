// Curated Unsplash photography (free to use under the Unsplash License).
// Swap these for operators' own uploads in production.
const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  salonInterior: u("1560066984-138dadb4c035"),
  salonChairs: u("1521590832167-7bcbfaa6381f"),
  salonLounge: u("1600948836101-f9ffda59d250"),
  hairStyling: u("1522337360788-8b13dee7a37e"),
  hairWash: u("1562322140-8baeececf3df"),
  hairColour: u("1580618672591-eb180b1a973f"),
  hairCut: u("1595476108010-b4d1f102b1b1"),
  makeupFace: u("1487412947147-5cebf100ffc2"),
  makeupBrushes: u("1516975080664-ed2fc6a32937"),
  makeupFlatlay: u("1512496015851-a90fb38ba796"),
  makeupProducts: u("1522335789203-aabd1fc54bc9"),
  nailsManicure: u("1604654894610-df63bc536371"),
  nailsArt: u("1610992015732-2449b76344bc"),
  facial: u("1570172619644-dfd03ed5d881"),
  skincare: u("1616394584738-fc6e612e71b9"),
  spaMassage: u("1540555700478-4be289fbecef"),
  spaTreatment: u("1544161515-4ab6ce6db874"),
  spaRoom: u("1600334129128-685c5582fd35"),
  barberCut: u("1503951914875-452162b0f3f1"),
  barberChair: u("1599351431202-1e0f0137899a"),
  barberShop: u("1585747860715-2ba37e788b70"),
  portraitA: u("1531746020798-e6953c6e8e04", 600),
  portraitB: u("1589156280159-27698a70f29e", 600),
  portraitC: u("1507003211169-0a1dd7228f2d", 600),
  portraitD: u("1534528741775-53994a69daeb", 600),
  portraitE: u("1494790108377-be9c29b29330", 600),
};

export const UPLOAD_CHOICES: { label: string; url: string }[] = [
  { label: "Salon interior", url: IMG.salonInterior },
  { label: "Salon chairs", url: IMG.salonChairs },
  { label: "Lounge", url: IMG.salonLounge },
  { label: "Hair styling", url: IMG.hairStyling },
  { label: "Makeup", url: IMG.makeupFace },
  { label: "Nails", url: IMG.nailsManicure },
  { label: "Spa", url: IMG.spaMassage },
  { label: "Barbering", url: IMG.barberCut },
  { label: "Skincare", url: IMG.facial },
];
