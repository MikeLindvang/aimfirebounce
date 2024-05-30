// components/NavBar.js

import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="bg-dark-bg p-4">
      <ul className="flex space-x-4 justify-center">
        <li>
          <Link href="/" className="text-light-text">
            Home
          </Link>
        </li>
        <li>
          <Link href="/random-tank" className="text-light-text">
            Random Tank Selector
          </Link>
        </li>
        {/* Add more links for future tools */}
      </ul>
    </nav>
  );
}
