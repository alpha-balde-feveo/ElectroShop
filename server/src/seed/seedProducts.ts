import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { CategoryModel } from "../models/Category";
import { ProductModel } from "../models/Product";

type Demo = {
  name: string;
  brand: string;
  category: string; // slug de catégorie
  price: number;
  oldPrice?: number;
  description: string;
  specs?: Record<string, string>;
  stock: number;
  image: string;
};

const img = (text: string, bg: string) =>
  `https://dummyimage.com/800x800/${bg}/ffffff.png&text=${encodeURIComponent(text)}`;

const DEMO_PRODUCTS: Demo[] = [
  {
    name: "PC Portable HP 250 G9",
    brand: "HP",
    category: "informatique",
    price: 285000,
    oldPrice: 320000,
    description:
      "Ordinateur portable 15,6\" idéal pour le travail et les études. Processeur Intel Core i5, SSD rapide et autonomie solide.",
    specs: { processeur: "Intel Core i5-1235U", ram: "8 Go", stockage: "SSD 512 Go", ecran: "15,6\" Full HD" },
    stock: 8,
    image: img("HP 250 G9", "1e3a8a"),
  },
  {
    name: "MacBook Air M2 13\"",
    brand: "Apple",
    category: "informatique",
    price: 750000,
    description:
      "Léger, silencieux et très performant grâce à la puce Apple M2. Parfait pour les créatifs et les développeurs.",
    specs: { processeur: "Apple M2", ram: "8 Go", stockage: "SSD 256 Go", ecran: "13,6\" Liquid Retina" },
    stock: 4,
    image: img("MacBook Air M2", "374151"),
  },
  {
    name: "Écran Dell 24\" Full HD",
    brand: "Dell",
    category: "informatique",
    price: 95000,
    description: "Moniteur 24 pouces IPS avec des couleurs fidèles, idéal pour la bureautique et le multimédia.",
    specs: { taille: "24 pouces", resolution: "1920x1080", dalle: "IPS", connectique: "HDMI / VGA" },
    stock: 12,
    image: img("Dell 24 pouces", "0f766e"),
  },
  {
    name: "iPhone 15 128 Go",
    brand: "Apple",
    category: "smartphones",
    price: 550000,
    oldPrice: 595000,
    description: "iPhone 15 avec Dynamic Island, appareil photo 48 Mpx et port USB-C.",
    specs: { ecran: "6,1\" Super Retina XDR", stockage: "128 Go", photo: "48 Mpx", batterie: "Jusqu'à 20h vidéo" },
    stock: 6,
    image: img("iPhone 15", "111827"),
  },
  {
    name: "Samsung Galaxy A55 5G",
    brand: "Samsung",
    category: "smartphones",
    price: 265000,
    description: "Le meilleur rapport qualité/prix Samsung : écran AMOLED 120 Hz, 5G et grosse batterie.",
    specs: { ecran: "6,6\" Super AMOLED 120Hz", stockage: "128 Go", ram: "8 Go", batterie: "5000 mAh" },
    stock: 10,
    image: img("Galaxy A55", "1d4ed8"),
  },
  {
    name: "Redmi Note 13 Pro",
    brand: "Xiaomi",
    category: "smartphones",
    price: 165000,
    oldPrice: 185000,
    description: "Photo 200 Mpx, charge rapide 67W et écran AMOLED : un excellent milieu de gamme.",
    specs: { ecran: "6,67\" AMOLED", stockage: "256 Go", ram: "8 Go", charge: "67W" },
    stock: 15,
    image: img("Redmi Note 13", "b91c1c"),
  },
  {
    name: "Casque Bluetooth JBL Tune 520BT",
    brand: "JBL",
    category: "accessoires",
    price: 32000,
    description: "Casque sans fil avec le son JBL Pure Bass et 57h d'autonomie.",
    specs: { autonomie: "57 heures", bluetooth: "5.3", pliable: "Oui" },
    stock: 20,
    image: img("JBL Tune 520BT", "7c3aed"),
  },
  {
    name: "Chargeur Anker USB-C 65W",
    brand: "Anker",
    category: "accessoires",
    price: 22000,
    description: "Chargeur rapide GaN 65W compact, charge un laptop ou deux téléphones à la fois.",
    specs: { puissance: "65W", ports: "2x USB-C + 1x USB-A", technologie: "GaN" },
    stock: 25,
    image: img("Anker 65W", "0369a1"),
  },
  {
    name: "Power Bank 20000 mAh",
    brand: "Xiaomi",
    category: "accessoires",
    price: 18500,
    description: "Batterie externe grande capacité avec charge rapide 22,5W, indispensable en déplacement.",
    specs: { capacite: "20000 mAh", charge: "22,5W", ports: "USB-C + 2x USB-A" },
    stock: 30,
    image: img("Power Bank 20000", "047857"),
  },
  {
    name: "Souris Logitech MX Master 3S",
    brand: "Logitech",
    category: "accessoires",
    price: 65000,
    description: "La référence des souris de productivité : silencieuse, précise, multi-appareils.",
    specs: { capteur: "8000 DPI", autonomie: "70 jours", connexion: "Bluetooth / USB" },
    stock: 9,
    image: img("MX Master 3S", "334155"),
  },
  {
    name: "Routeur WiFi 6 TP-Link AX23",
    brand: "TP-Link",
    category: "reseau",
    price: 45000,
    description: "Routeur WiFi 6 double bande pour une connexion rapide et stable dans toute la maison.",
    specs: { norme: "WiFi 6 (AX1800)", bandes: "2,4 + 5 GHz", ports: "4x Gigabit" },
    stock: 11,
    image: img("TP-Link AX23", "0e7490"),
  },
  {
    name: "Clé USB WiFi TP-Link 300Mbps",
    brand: "TP-Link",
    category: "reseau",
    price: 8500,
    description: "Adaptateur WiFi USB compact pour connecter un PC fixe sans câble.",
    specs: { debit: "300 Mbps", interface: "USB 2.0" },
    stock: 40,
    image: img("Cle WiFi", "4d7c0f"),
  },
  {
    name: "Manette Xbox Series Sans Fil",
    brand: "Microsoft",
    category: "gaming",
    price: 48000,
    description: "Manette officielle Xbox, compatible PC, console et mobile via Bluetooth.",
    specs: { connexion: "Bluetooth / USB-C", compatibilite: "Xbox / PC / Mobile" },
    stock: 14,
    image: img("Manette Xbox", "166534"),
  },
  {
    name: "Clavier Mécanique RGB Redragon K552",
    brand: "Redragon",
    category: "gaming",
    price: 35000,
    oldPrice: 42000,
    description: "Clavier mécanique compact avec switchs rouges et rétroéclairage RGB.",
    specs: { switchs: "Rouges", format: "TKL (87 touches)", retroeclairage: "RGB" },
    stock: 18,
    image: img("Redragon K552", "9f1239"),
  },
  {
    name: "Casque Gaming HyperX Cloud III",
    brand: "HyperX",
    category: "gaming",
    price: 78000,
    description: "Confort légendaire et son immersif pour de longues sessions de jeu.",
    specs: { son: "DTS Spatial Audio", micro: "Détachable", compatibilite: "PC / PS5 / Xbox" },
    stock: 7,
    image: img("HyperX Cloud III", "c2410c"),
  },
];

async function seedProducts() {
  await connectDB();

  const count = await ProductModel.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  ${count} produits déjà présents — seed ignoré.`);
    console.log("   (supprimez les produits ou la collection pour re-seeder)");
    await mongoose.disconnect();
    return;
  }

  const categories = await CategoryModel.find();
  const bySlug = new Map(categories.map((c) => [c.slug, c._id]));

  let created = 0;
  for (const p of DEMO_PRODUCTS) {
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
      images: [{ url: p.image }],
    });
    created++;
    console.log("✅", p.name);
  }

  console.log(`\n🎉 ${created} produits de démonstration créés.`);
  await mongoose.disconnect();
}

seedProducts().catch((err) => {
  console.error("Erreur de seed:", err);
  process.exit(1);
});
