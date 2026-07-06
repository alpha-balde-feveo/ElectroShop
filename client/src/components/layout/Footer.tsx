import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Marque */}
        <div className="md:col-span-2">
          <div className="font-extrabold tracking-wide text-xl text-white">
            ELECTROSHOP
          </div>
          <p className="mt-3 text-sm text-gray-400 max-w-sm">
            Votre boutique tech de confiance au Sénégal. Ordinateurs,
            smartphones, gaming et accessoires — livrés rapidement, payés à la
            réception.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center hover:bg-orange-500 transition"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="h-9 w-9 rounded-lg bg-white/10 grid place-items-center hover:bg-orange-500 transition"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>

        {/* Liens */}
        <div>
          <div className="font-bold text-white">Boutique</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/shop" className="hover:text-orange-400 transition">
                Tous les produits
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-orange-400 transition">
                Mon panier
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="hover:text-orange-400 transition">
                Commander
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="font-bold text-white">Contact</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-orange-400" />
              Dakar, Sénégal
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-orange-400" />
              <a href="tel:+221771234567" className="hover:text-orange-400">
                +221 77 123 45 67
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-orange-400" />
              <a
                href="mailto:contact@electroshop.sn"
                className="hover:text-orange-400"
              >
                contact@electroshop.sn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Electroshop — Tous droits réservés</div>
          <div>Paiement à la livraison · Cash & Mobile Money</div>
        </div>
      </div>
    </footer>
  );
}
