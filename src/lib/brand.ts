// Centralized brand info for Ngurdam Honey
export const BRAND = {
  productName: "NGURDAM HONEY",
  legalName: "AB SARDAUNA NGURDAM VENTURES",
  tagline: "Pure. Natural. Goodness.",
  nafdacNumber: "A8-121062L",
  origin: {
    short: "Gembu, Taraba State",
    full: "Gembu, Sardauna Local Government Area, Taraba State, Nigeria",
    region: "Sardauna LGA",
    state: "Taraba State",
  },
  address: {
    line1: "Arkilla Area, Behind Alkanci Plaza",
    line2: "Wamakko Local Government Area",
    line3: "Sokoto State, Nigeria",
  },
  phones: ["07019253574", "08035890705"],
  whatsappNumber: "2347019253574", // primary phone, E.164 without +
  email: "ngurdamhoney@gmail.com",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61584423414429",
    instagram: "#",
    twitter: "#",
  },
} as const;

export const FORMATTED_ADDRESS =
  `${BRAND.address.line1}, ${BRAND.address.line2}, ${BRAND.address.line3}.`;
