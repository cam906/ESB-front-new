import Link from "next/link";

export default function Footer() {
  return (
    <footer className="dark:bg-gray-900 bg-gray-100 mt-16 py-8">
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="dark:text-gray-400 text-lg font-bold">Elite Sports Bets</h3>
            <p className="dark:text-gray-400 mt-2">Expert basketball betting tips with proven results and transparent tracking.</p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="dark:text-gray-400 hover:text-primary">T</Link>
              <Link href="#" className="dark:text-gray-400 hover:text-primary">D</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-2 space-y-2">
              <li><Link href="#" className="dark:text-gray-400 hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="dark:text-gray-400 hover:text-primary">Contact</Link></li>
              <li><Link href="#" className="dark:text-gray-400 hover:text-primary">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-2 space-y-2">
              <li><Link href="#" className="dark:text-gray-400 hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="dark:text-gray-400 hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="dark:text-gray-400 hover:text-primary">Responsible Gambling</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Support</h4>
            <ul className="mt-2 space-y-2">
              <li><Link href="#" className="dark:text-gray-400 hover:text-primary">Help Center</Link></li>
              <li><Link href="#" className="dark:text-gray-400 hover:text-primary">Discord Support</Link></li>
              <li><Link href="#faq" className="dark:text-gray-400 hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center dark:text-gray-500 mt-8 pt-8 border-t dark:border-gray-700 border-gray-200">
          <p>&copy; 2024 Elite Sports Bets. All rights reserved. | 18+ Only. Gamble Responsibly.</p>
        </div>
      </div>
    </footer>
  );
}


