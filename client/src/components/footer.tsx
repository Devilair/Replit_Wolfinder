import { Link } from "wouter";
import { Search, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <Search className="text-amber-400 text-2xl mr-2" />
              <span className="text-2xl font-bold">Wolfinder</span>
            </div>
            <p className="text-gray-200 mb-6 max-w-md">
              La piattaforma italiana di fiducia per trovare professionisti qualificati e affidabili nella tua zona.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Per Utenti</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="text-gray-200 hover:text-amber-400 transition-colors">
                  Come Funziona
                </Link>
              </li>
              <li>
                <Link href="/professionals" className="text-gray-200 hover:text-amber-400 transition-colors">
                  Trova Professionisti
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                  Lascia Recensioni
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Per Professionisti</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                  Registrati
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                  Piani e Prezzi
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                  Centro Aiuto
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
                  Verifica Profilo
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-200 text-sm mb-4 md:mb-0">
            © 2024 Wolfinder. Tutti i diritti riservati.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
              Termini di Servizio
            </a>
            <a href="#" className="text-gray-200 hover:text-amber-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
