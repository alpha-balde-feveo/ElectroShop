import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { CategoryModel } from "../models/Category";
import { ProductModel } from "../models/Product";
import { slugify } from "../utils/slugify";

type Demo = {
  name: string;
  label: string; // texte court affiché sur l'image
  brand: string;
  category: string; // slug de catégorie
  price: number;
  oldPrice?: number;
  description: string;
  specs?: Record<string, string>;
  stock: number;
  color: string; // couleur de fond de l'image
};

const DEMO_PRODUCTS: Demo[] = [
  {
    name: "PC Portable HP 250 G9",
    label: "HP 250 G9",
    brand: "HP",
    category: "informatique",
    price: 285000,
    oldPrice: 320000,
    description:
      "Ordinateur portable 15,6\" idéal pour le travail et les études. Processeur Intel Core i5, SSD rapide et autonomie solide.",
    specs: { processeur: "Intel Core i5-1235U", ram: "8 Go", stockage: "SSD 512 Go", ecran: "15,6\" Full HD" },
    stock: 8,
    color: "1e3a8a",
  },
  {
    name: "MacBook Air M2 13\"",
    label: "MacBook Air M2",
    brand: "Apple",
    category: "informatique",
    price: 750000,
    description:
      "Léger, silencieux et très performant grâce à la puce Apple M2. Parfait pour les créatifs et les développeurs.",
    specs: { processeur: "Apple M2", ram: "8 Go", stockage: "SSD 256 Go", ecran: "13,6\" Liquid Retina" },
    stock: 4,
    color: "374151",
  },
  {
    name: "Écran Dell 24\" Full HD",
    label: "Dell 24\"",
    brand: "Dell",
    category: "informatique",
    price: 95000,
    description: "Moniteur 24 pouces IPS avec des couleurs fidèles, idéal pour la bureautique et le multimédia.",
    specs: { taille: "24 pouces", resolution: "1920x1080", dalle: "IPS", connectique: "HDMI / VGA" },
    stock: 12,
    color: "0f766e",
  },
  {
    name: "iPhone 15 128 Go",
    label: "iPhone 15",
    brand: "Apple",
    category: "smartphones",
    price: 550000,
    oldPrice: 595000,
    description: "iPhone 15 avec Dynamic Island, appareil photo 48 Mpx et port USB-C.",
    specs: { ecran: "6,1\" Super Retina XDR", stockage: "128 Go", photo: "48 Mpx", batterie: "Jusqu'à 20h vidéo" },
    stock: 6,
    color: "111827",
  },
  {
    name: "Samsung Galaxy A55 5G",
    label: "Galaxy A55",
    brand: "Samsung",
    category: "smartphones",
    price: 265000,
    description: "Le meilleur rapport qualité/prix Samsung : écran AMOLED 120 Hz, 5G et grosse batterie.",
    specs: { ecran: "6,6\" Super AMOLED 120Hz", stockage: "128 Go", ram: "8 Go", batterie: "5000 mAh" },
    stock: 10,
    color: "1d4ed8",
  },
  {
    name: "Redmi Note 13 Pro",
    label: "Redmi Note 13",
    brand: "Xiaomi",
    category: "smartphones",
    price: 165000,
    oldPrice: 185000,
    description: "Photo 200 Mpx, charge rapide 67W et écran AMOLED : un excellent milieu de gamme.",
    specs: { ecran: "6,67\" AMOLED", stockage: "256 Go", ram: "8 Go", charge: "67W" },
    stock: 15,
    color: "b91c1c",
  },
  {
    name: "Casque Bluetooth JBL Tune 520BT",
    label: "JBL Tune 520BT",
    brand: "JBL",
    category: "accessoires",
    price: 32000,
    description: "Casque sans fil avec le son JBL Pure Bass et 57h d'autonomie.",
    specs: { autonomie: "57 heures", bluetooth: "5.3", pliable: "Oui" },
    stock: 20,
    color: "7c3aed",
  },
  {
    name: "Chargeur Anker USB-C 65W",
    label: "Anker 65W",
    brand: "Anker",
    category: "accessoires",
    price: 22000,
    description: "Chargeur rapide GaN 65W compact, charge un laptop ou deux téléphones à la fois.",
    specs: { puissance: "65W", ports: "2x USB-C + 1x USB-A", technologie: "GaN" },
    stock: 25,
    color: "0369a1",
  },
  {
    name: "Power Bank 20000 mAh",
    label: "Power Bank",
    brand: "Xiaomi",
    category: "accessoires",
    price: 18500,
    description: "Batterie externe grande capacité avec charge rapide 22,5W, indispensable en déplacement.",
    specs: { capacite: "20000 mAh", charge: "22,5W", ports: "USB-C + 2x USB-A" },
    stock: 30,
    color: "047857",
  },
  {
    name: "Souris Logitech MX Master 3S",
    label: "MX Master 3S",
    brand: "Logitech",
    category: "accessoires",
    price: 65000,
    description: "La référence des souris de productivité : silencieuse, précise, multi-appareils.",
    specs: { capteur: "8000 DPI", autonomie: "70 jours", connexion: "Bluetooth / USB" },
    stock: 9,
    color: "334155",
  },
  {
    name: "Routeur WiFi 6 TP-Link AX23",
    label: "TP-Link AX23",
    brand: "TP-Link",
    category: "reseau",
    price: 45000,
    description: "Routeur WiFi 6 double bande pour une connexion rapide et stable dans toute la maison.",
    specs: { norme: "WiFi 6 (AX1800)", bandes: "2,4 + 5 GHz", ports: "4x Gigabit" },
    stock: 11,
    color: "0e7490",
  },
  {
    name: "Clé USB WiFi TP-Link 300Mbps",
    label: "Clé WiFi",
    brand: "TP-Link",
    category: "reseau",
    price: 8500,
    description: "Adaptateur WiFi USB compact pour connecter un PC fixe sans câble.",
    specs: { debit: "300 Mbps", interface: "USB 2.0" },
    stock: 40,
    color: "4d7c0f",
  },
  {
    name: "Manette Xbox Series Sans Fil",
    label: "Manette Xbox",
    brand: "Microsoft",
    category: "gaming",
    price: 48000,
    description: "Manette officielle Xbox, compatible PC, console et mobile via Bluetooth.",
    specs: { connexion: "Bluetooth / USB-C", compatibilite: "Xbox / PC / Mobile" },
    stock: 14,
    color: "166534",
  },
  {
    name: "Clavier Mécanique RGB Redragon K552",
    label: "Redragon K552",
    brand: "Redragon",
    category: "gaming",
    price: 35000,
    oldPrice: 42000,
    description: "Clavier mécanique compact avec switchs rouges et rétroéclairage RGB.",
    specs: { switchs: "Rouges", format: "TKL (87 touches)", retroeclairage: "RGB" },
    stock: 18,
    color: "9f1239",
  },
  {
    name: "Casque Gaming HyperX Cloud III",
    label: "HyperX Cloud III",
    brand: "HyperX",
    category: "gaming",
    price: 78000,
    description: "Confort légendaire et son immersif pour de longues sessions de jeu.",
    specs: { son: "DTS Spatial Audio", micro: "Détachable", compatibilite: "PC / PS5 / Xbox" },
    stock: 7,
    color: "c2410c",
  },
];

const UPLOADS_DIR = path.resolve("uploads");

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Génère une image SVG locale (servie via /uploads) — aucune dépendance internet. */
function writeSvg(label: string, brand: string, color: string): string {
  const filename = `demo-${slugify(label)}.svg`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#${color}"/>
  <rect width="800" height="800" fill="url(#g)"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <text x="400" y="380" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle">${escapeXml(label)}</text>
  <text x="400" y="440" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#ffffff" fill-opacity="0.75" text-anchor="middle">${escapeXml(brand)}</text>
</svg>`;

  fs.writeFileSync(path.join(UPLOADS_DIR, filename), svg, "utf8");
  return `/uploads/${filename}`;
}

async function seedProducts() {
  await connectDB();

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const categories = await CategoryModel.find();
  const bySlug = new Map(categories.map((c) => [c.slug, c._id]));

  let created = 0;
  let fixed = 0;

  for (const p of DEMO_PRODUCTS) {
    const url = writeSvg(p.label, p.brand, p.color);

    const existing = await ProductModel.findOne({ name: p.name });

    if (existing) {
      // Répare les anciennes images externes (dummyimage.com)
      const current = existing.images?.[0]?.url ?? "";
      if (current.includes("dummyimage.com")) {
        existing.images = [{ url }];
        await existing.save();
        fixed++;
        console.log("🔧 Image réparée:", p.name);
      }
      continue;
    }

    const categoryId = bySlug.get(p.category);
    if (!categoryId) {
      console.warn(`⚠️  Catégorie introuvable: ${p.category} (${p.name})`);
      continue;
    }

    await ProductModel.create({
      name: p.name,
      brand: p.brand,
      categoryId,
      price: p.price,
      oldPrice: p.oldPrice,
      description: p.description,
      specs: p.specs ?? {},
      stock: p.stock,
      images: [{ url }],
    });
    created++;
    console.log("✅", p.name);
  }

  if (created) console.log(`\n🎉 ${created} produits créés.`);
  if (fixed) console.log(`🔧 ${fixed} images externes remplacées par des images locales.`);
  if (!created && !fixed) console.log("ℹ️  Rien à faire — produits déjà en place.");

  await mongoose.disconnect();
}

seedProducts().catch((err) => {
  console.error("Erreur de seed:", err);
  process.exit(1);
});
