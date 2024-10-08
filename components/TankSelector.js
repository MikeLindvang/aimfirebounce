import { useState, useEffect } from 'react';
import CheckboxGroup from './CheckboxGroup'; // Adjust the path if needed
import SingleOptionSelect from './SingleOptionSelect'; // Adjust the path if needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faTrash, faStar } from '@fortawesome/free-solid-svg-icons';

const servers = [
  { name: 'North America', value: 'na' },
  { name: 'Europe', value: 'eu' },
  { name: 'Russia', value: 'ru' },
  { name: 'Asia', value: 'asia' },
];

const filters = {
  tiers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  nations: [
    'usa',
    'ussr',
    'germany',
    'uk',
    'china',
    'japan',
    'france',
    'sweden',
    'czechoslovakia',
    'poland',
    'italy',
  ],
  types: ['lightTank', 'mediumTank', 'heavyTank', 'AT-SPG', 'SPG'],
};

export default function TankSelector() {
  const [username, setUsername] = useState('');
  const [server, setServer] = useState('na');
  const [tanks, setTanks] = useState([]);
  const [filteredTanks, setFilteredTanks] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTiers, setSelectedTiers] = useState([]);
  const [selectedNations, setSelectedNations] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [blacklist, setBlacklist] = useState([]);
  const [randomTank, setRandomTank] = useState(null);

  useEffect(() => {
    const storedTanks = localStorage.getItem(`${username}-${server}-tanks`);
    const storedBlacklist = localStorage.getItem(
      `${username}-${server}-blacklist`
    );

    if (storedTanks) {
      setTanks(JSON.parse(storedTanks));
    }
    if (storedBlacklist) {
      setBlacklist(JSON.parse(storedBlacklist));
    }
  }, [username, server]);

  useEffect(() => {
    const newFilteredTanks = tanks.filter((tank) => {
      if (blacklist.includes(tank.tank_id)) return false;
      if (selectedTiers.length > 0 && !selectedTiers.includes(tank.tier))
        return false;
      if (selectedNations.length > 0 && !selectedNations.includes(tank.nation))
        return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(tank.type))
        return false;
      if (isPremium && !tank.is_premium) return false;
      return true;
    });

    setFilteredTanks(newFilteredTanks);
  }, [
    tanks,
    selectedTiers,
    selectedNations,
    selectedTypes,
    isPremium,
    blacklist,
  ]);

  const fetchTanks = async () => {
    setError(null);
    try {
      const response = await fetch(
        `/api/getRandomTanks?username=${username}&server=${server}`
      );
      if (!response.ok) {
        throw new Error('RESPONSE ERROR: ', response);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setTanks(data);
      localStorage.setItem(`${username}-${server}-tanks`, JSON.stringify(data));
    } catch (error) {
      setError(error.message);
      console.error('Fetch error: ', error);
    }
  };

  const handleBlacklist = (tankId) => {
    const newBlacklist = [...blacklist, tankId];
    setBlacklist(newBlacklist);
    localStorage.setItem(
      `${username}-${server}-blacklist`,
      JSON.stringify(newBlacklist)
    );
  };

  const handleClearData = () => {
    localStorage.removeItem(`${username}-${server}-tanks`);
    localStorage.removeItem(`${username}-${server}-blacklist`);
    setTanks([]);
    setBlacklist([]);
    setFilteredTanks([]);
  };

  const pickRandomTank = () => {
    if (filteredTanks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredTanks.length);
      setRandomTank(filteredTanks[randomIndex]);
    } else {
      setRandomTank(null);
    }
  };
  const pickRandomTankInterval = () => {
    if (filteredTanks.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredTanks.length);
      setRandomTank(filteredTanks[randomIndex]);
      setTimeout(() => {
        pickRandomTankInterval();
      }, 120000);
    } else {
      setRandomTank(null);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <h1 className="text-4xl mb-4 text-center align-top">AimFireBounce</h1>
      <h2 className="text-2xl mb-4 text-center">
        World of Tanks Random Tank Selector
      </h2>
      <div className="flex justify-between">
        <div className="mb-4">
          <span className=" text-geeky-blue">Select Server:</span>
          <SingleOptionSelect
            options={servers}
            selectedOption={server}
            onChange={setServer}
            defaultOption={'Europe'}
          />
        </div>
        <div className="mb-4">
          <span className=" text-geeky-blue">Enter Username:</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full p-2 border rounded text-slate-800"
          />
        </div>

        <div className="mb-4 flex">
          <button
            onClick={fetchTanks}
            className="bg-geeky-blue text-white p-2 rounded"
          >
            Load
          </button>

          <button
            onClick={handleClearData}
            className="bg-red-500 text-white p-2 rounded ml-4"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div>
          <input
            type="checkbox"
            id="isPremium"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="peer hidden"
          />
          <label
            htmlFor="isPremium"
            className="select-none cursor-pointer rounded border-2 bg-dark-bg
            py-1 px-2 text-white text-sm transition-colors duration-200 ease-in-out peer-checked:bg-geeky-blue peer-checked:text-white"
          >
            Premium
          </label>
        </div>

        <div className="mt-2">
          <span className="block text-geeky-blue">Select Tiers:</span>
          <CheckboxGroup
            options={filters.tiers}
            selectedOptions={selectedTiers}
            onChange={setSelectedTiers}
          />
        </div>
        <div className="mt-2">
          <span className="block text-geeky-blue">Select Nations:</span>
          <CheckboxGroup
            options={filters.nations}
            selectedOptions={selectedNations}
            onChange={setSelectedNations}
          />
        </div>
        <div className="mt-2">
          <span className="block text-geeky-blue">Select Types:</span>
          <CheckboxGroup
            options={filters.types}
            selectedOptions={selectedTypes}
            onChange={setSelectedTypes}
          />
        </div>
      </div>
      {error && (
        <div className="mt-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}
      <div className="mb-4">
        <button
          onClick={pickRandomTank}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Pick Random Tank
        </button>
        <button
          onClick={pickRandomTankInterval}
          className="bg-blue-500 text-white ml-2 p-2 rounded"
        >
          Pick Random Tank Every 2 Minutes
        </button>
      </div>
      {randomTank && (
        <div className="mt-4 text-center">
          <div className="p-2 border rounded mb-2">
            <p>Name: {randomTank.name}</p>
            <p>Nationality: {randomTank.nation}</p>
            <p>Tier: {randomTank.tier}</p>
            <p>Type: {randomTank.type}</p>
            <p>Battle Count: {randomTank.statistics.battles}</p>
            <button
              onClick={() => handleBlacklist(randomTank.tank_id)}
              className="bg-red-500 text-white p-2 rounded"
            >
              Blacklist
            </button>
          </div>
        </div>
      )}
      {filteredTanks.length > 0 && (
        <>
          <div className="mt-4 text-center">
            <h3 className="text-2xl mt-4">Available Tanks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredTanks.map((tank) => (
                <div key={tank.tank_id} className="p-2 border rounded mb-2">
                  <p>Name: {tank.name}</p>
                  <p>Nationality: {tank.nation}</p>
                  <p>Tier: {tank.tier}</p>
                  <p>Type: {tank.type}</p>
                  <p>Battle Count: {tank.statistics.battles}</p>
                  <button
                    onClick={() => handleBlacklist(tank.tank_id)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    Blacklist
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
