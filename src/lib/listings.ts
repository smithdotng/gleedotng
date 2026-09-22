import { IMG } from "./images";
import type { Operator, OperatorAccount, Service } from "./types";

/**
 * Businesses onboarded by the glee.ng team (rather than through the sign-up form).
 * - Added to the database on startup if they don't exist yet.
 * - Bump `revision` to push edits here (services, plan, copy…) to an existing record;
 *   ratings, reviews and createdAt in the database are kept.
 * Only password *hashes* live here; never commit a plain password.
 */

type S = Omit<Service, "id" | "group"> & { id?: string };

// COME2JANE price list — all prices in Naira. Durations are estimates for scheduling.
const BEAUTYROOM_MENU: Record<string, S[]> = {
  "Hair services": [
    { name: "Haircut (women)", durationMins: 60, price: 60000 },
    { name: "Blow-dry & style", durationMins: 60, price: 20000 },
    { name: "Shampooing", durationMins: 30, price: 16000 },
    { name: "Hair extension sew-in", durationMins: 150, price: 35000, priceMax: 45000 },
    { name: "Frontal installation", durationMins: 150, price: 70000 },
    { name: "Half & half sew-in", durationMins: 120, price: 35000 },
    { name: "Short hair install", durationMins: 90, price: 45000 },
    { name: "Short hair sew-in", durationMins: 120, price: 60000 },
    { name: "Tonging", durationMins: 60, price: 20000 },
    { name: "Colouring (all tones)", durationMins: 150, price: 60000, priceMax: 150000 },
    { name: "Trimming", durationMins: 30, price: 10000 },
    { name: "Cornrows & braided styles", durationMins: 120, price: 10000, priceMax: 50000, description: "Cornrows and lots more — price depends on style." },
    // added in revision 3 — explicit ids keep earlier service ids stable
    { id: "s58", name: "K-tip extensions", durationMins: 300, price: 850000, priceMax: 1250000, description: "Keratin-tip (K-tip) hair extensions." },
    { id: "s59", name: "K-tip removal", durationMins: 120, price: 50000, priceMax: 80000 },
    { id: "s60", name: "Miracle knots install", durationMins: 180, price: 45000, priceMax: 60000 },
    { id: "s61", name: "Crochet", durationMins: 150, price: 30000, priceMax: 80000 },
  ],
  "Hair treatment": [
    { name: "Relaxer + 1 treatment", durationMins: 120, price: 75000 },
    { name: "Relaxer + 2 treatments", durationMins: 150, price: 110000 },
    { name: "Relaxer only", durationMins: 90, price: 40000, priceMax: 50000 },
    { name: "Deep conditioning", durationMins: 60, price: 40000 },
    { name: "Protein treatment", durationMins: 60, price: 50000 },
    { name: "Nourishing treatment", durationMins: 60, price: 35000 },
    { name: "Pro-growth treatment", durationMins: 60, price: 50000 },
    { name: "Meso growth (injectables)", durationMins: 60, price: 450000, priceFrom: true },
    { name: "Deep scalp treatment", durationMins: 60, price: 50000, priceMax: 85000 },
    { name: "Repair treatment", durationMins: 60, price: 50000 },
    { name: "Anti-breakage treatment", durationMins: 60, price: 60000 },
    { name: "Hair-loss treatment", durationMins: 60, price: 60000, priceFrom: true, description: "Price varies with assessment." },
    { name: "Anti-dandruff treatment", durationMins: 60, price: 50000 },
    { name: "Deep protein treatment", durationMins: 75, price: 60000 },
    { name: "Colour treatment", durationMins: 60, price: 45000, priceMax: 50000 },
    { name: "Blondifier", durationMins: 90, price: 60000 },
  ],
  "Aesthetics (medical grade)": [
    { name: "PRP with microneedling facial", durationMins: 90, price: 85000, priceMax: 1200000, description: "PRP + microneedling + superficial peel." },
    { name: "Acne & hyperpigmentation facial protocol", durationMins: 90, price: 350000, priceMax: 1200000, description: "Combined peel protocol." },
    { name: "PRP + microneedling + dermaplaning", durationMins: 120, price: 750000 },
    { name: "PRP + peel / PRP + peel + microneedling", durationMins: 90, price: 0, onRequest: true },
    { name: "Facial rejuvenation", durationMins: 90, price: 400000, priceFrom: true },
    { name: "Chemical peel", durationMins: 60, price: 0, onRequest: true },
    { name: "Bio peel", durationMins: 60, price: 550000 },
    { name: "Meso glow", durationMins: 60, price: 0, onRequest: true },
    { name: "Meso scalp therapy", durationMins: 60, price: 0, onRequest: true },
    { name: "Mesotherapy", durationMins: 60, price: 0, onRequest: true },
    { name: "Botox", durationMins: 45, price: 45000, priceFrom: true },
    { name: "Face contouring", durationMins: 60, price: 15000, priceFrom: true },
    { name: "Dermal filler", durationMins: 60, price: 35000, priceFrom: true },
    { name: "Lip filler", durationMins: 60, price: 55000, priceFrom: true },
    { name: "PDO thread face lift", durationMins: 90, price: 0, onRequest: true },
    { name: "PDO liquid nose job", durationMins: 60, price: 0, onRequest: true },
    { name: "Lipo shot", durationMins: 45, price: 200000, priceMax: 800000, description: "Per vial. Cheeks, under chin, arms, lower tummy, thighs, underarm." },
    { name: "Lipolysis", durationMins: 60, price: 0, onRequest: true },
    { name: "Butt lift", durationMins: 90, price: 0, onRequest: true },
    { name: "Butt enhancement", durationMins: 90, price: 0, onRequest: true },
    { name: "Laser hair removal", durationMins: 60, price: 45000, priceFrom: true, description: "Underarm, arms, full leg, bikini, Brazilian & back, full body." },
    { name: "Tattoo removal", durationMins: 60, price: 250000, priceFrom: true },
    { name: "Skin tag removal", durationMins: 45, price: 180000, priceFrom: true },
    { name: "Skin camouflage", durationMins: 60, price: 0, onRequest: true },
    { name: "IV infusion cocktail", durationMins: 60, price: 150000, priceFrom: true, description: "IV glow, IV super glow, IV detox, IV booster, IV weight loss." },
    { name: "Total weight-loss programme", durationMins: 60, price: 0, onRequest: true },
    { name: "O-Shot", durationMins: 45, price: 25000 },
    { name: "Vaginal tightening", durationMins: 60, price: 250000, priceFrom: true },
  ],
  "Body treatment": [{ name: "Hammam", durationMins: 90, price: 0, onRequest: true }],
};

const withGroups = (groups: Record<string, S[]>): Service[] => {
  let n = 0;
  return Object.entries(groups).flatMap(([group, items]) =>
    items.map((s) => ({ ...s, group, id: s.id ?? `s${++n}` })),
  );
};

export const MANAGED_LISTINGS: { operator: Operator; account: OperatorAccount; revision: number }[] = [
  {
    revision: 5,
    operator: {
      slug: "beautyroom-by-jane-wuse-2",
      name: "Beautyroom by Jane",
      kind: "Spa",
      categories: ["spa", "hair"],
      city: "Abuja",
      area: "Wuse 2",
      address: "5 Tilaberry Close, off Kumasi Street, Aminu Kano Crescent, Wuse 2, Abuja",
      phone: "+234 803 925 4834", // added in revision 5
      instagram: "come2jane",
      email: "janeinme@yahoo.com",
      rating: 0,
      reviewCount: 0,
      priceTier: 4,
      cover: IMG.spaRoom,
      logo: "/listings/beautyroom-by-jane/logo-blue.png", // revision 5 (blue "Beauty Room by Jane")
      gallery: [IMG.facial, IMG.spaMassage, IMG.hairStyling, IMG.skincare],
      lead: { name: "Jane", title: "Founder", avatar: "/listings/beautyroom-by-jane/logo-blue.png" },
      tagline: "COME2JANE — hair, treatments & medical-grade aesthetics in Wuse 2",
      bio: "Beautyroom by Jane (COME2JANE) is a calm, welcoming beauty room off Aminu Kano Crescent bringing expert hair services, restorative hair and scalp treatments, medical-grade aesthetics and body treatments together under one roof — so you can refresh your hair, skin and body in one visit.",
      services: withGroups(BEAUTYROOM_MENU),
      hours: {
        mon: { open: "09:00", close: "19:00" },
        tue: { open: "09:00", close: "19:00" },
        wed: { open: "09:00", close: "19:00" },
        thu: { open: "09:00", close: "19:00" },
        fri: { open: "09:00", close: "19:00" },
        sat: { open: "09:00", close: "19:00" },
        sun: null,
      },
      homeService: false,
      verified: false,
      featured: true,
      plan: "prestige",
      reviews: [],
      createdAt: "2026-09-21T12:00:00.000Z",
    },
    account: {
      email: "janeinme@yahoo.com",
      passwordHash: "scrypt$F68T-1Nz5ruO2vK4_eD7fw$52efZE1OugYFCjYNoLubbL0IFp4zjW_IJYXZ9D_qRRhn74VwsDjxYQuQnU8WFnU7atTWa02LHK5Ej-ruJQt7sw",
      operatorSlug: "beautyroom-by-jane-wuse-2",
      createdAt: "2026-09-21T12:00:00.000Z",
    },
  },
];
