// pages/index.js

import Head from 'next/head';
import TankSelector from '../components/TankSelector';

export default function Home() {
  return (
    <div>
      <Head>
        <title>AimFireBounce - Random Tank Selector</title>
        <meta
          name="description"
          content="Randomly select tanks for any account in World of Tanks"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col items-center justify-center min-h-screen py-2">
        <TankSelector />
      </main>
    </div>
  );
}
