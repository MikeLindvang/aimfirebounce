import { getAccountId } from '../../utils/getAccountId';

const API_TIMEOUT = 8000; // 8 seconds, leaving 2 seconds for processing
const ITEMS_PER_CALL = 50; // Limit each call to 50 items

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
};

const fetchTanksInBatches = async (accountId, server, applicationId) => {
  let allTanks = [];
  let page = 1;
  let hasMoreTanks = true;

  while (hasMoreTanks) {
    const tanksApiUrl = `https://api.worldoftanks.${server}/wot/account/tanks/?application_id=${applicationId}&account_id=${accountId}&limit=${ITEMS_PER_CALL}&page_no=${page}`;
    console.log(`Tanks API CALL (Page ${page}):`, tanksApiUrl);

    try {
      const tanksResponse = await fetchWithTimeout(tanksApiUrl);

      if (!tanksResponse.ok) {
        console.error(
          `Error fetching tanks: ${tanksResponse.status} ${tanksResponse.statusText}`
        );
        break;
      }

      const tanksData = await tanksResponse.json();

      if (tanksData.status !== 'ok') {
        console.error('API Error:', tanksData.error);
        break;
      }

      const tanks = tanksData.data[accountId];
      if (!tanks || tanks.length === 0) {
        console.log(
          `No more tanks found for account ID: ${accountId} on page ${page}`
        );
        hasMoreTanks = false;
        break;
      }

      const validTanks = tanks.filter(
        (tank) => tank && typeof tank === 'object' && 'tank_id' in tank
      );
      allTanks = allTanks.concat(validTanks);

      console.log(`Fetched ${validTanks.length} valid tanks on page ${page}`);

      hasMoreTanks = validTanks.length === ITEMS_PER_CALL;
      page += 1;
    } catch (error) {
      console.error('Fetch tanks error:', error);
      break;
    }
  }

  console.log(`Total tanks fetched: ${allTanks.length}`);
  return allTanks;
};

const fetchTankDetailsInBatches = async (tankIds, server, applicationId) => {
  let allTankDetails = [];

  for (let i = 0; i < tankIds.length; i += ITEMS_PER_CALL) {
    const batchIds = tankIds.slice(i, i + ITEMS_PER_CALL).join(',');
    const tankopediaApiUrl = `https://api.worldoftanks.${server}/wot/encyclopedia/vehicles/?application_id=${applicationId}&tank_id=${batchIds}`;
    console.log(
      `Tankopedia API CALL (Batch ${Math.floor(i / ITEMS_PER_CALL) + 1}):`,
      tankopediaApiUrl
    );

    try {
      const tankopediaResponse = await fetchWithTimeout(tankopediaApiUrl);

      if (!tankopediaResponse.ok) {
        console.error(
          `Error fetching tank details: ${tankopediaResponse.status} ${tankopediaResponse.statusText}`
        );
        continue;
      }

      const tankopediaData = await tankopediaResponse.json();

      if (tankopediaData.status !== 'ok') {
        console.error('API Error:', tankopediaData.error);
        continue;
      }

      const validTankDetails = Object.values(tankopediaData.data).filter(
        (detail) => detail && typeof detail === 'object' && 'tank_id' in detail
      );
      allTankDetails = allTankDetails.concat(validTankDetails);

      console.log(
        `Fetched details for ${validTankDetails.length} tanks in this batch`
      );
    } catch (error) {
      console.error('Fetch tank details error:', error);
    }

    // Optional delay to avoid hitting rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
  }

  console.log(`Total tank details fetched: ${allTankDetails.length}`);
  return allTankDetails;
};

export default async function handler(req, res) {
  console.time('Total API Time');
  const { username, server } = req.query;
  const applicationId = process.env.NEXT_PUBLIC_WOT_APPLICATION_ID;

  console.log(`Received request for username: ${username}, server: ${server}`);

  try {
    console.time('Get Account ID');
    const accountId = await getAccountId(username, server);
    console.timeEnd('Get Account ID');
    console.log(`Account ID for username ${username} is ${accountId}`);

    console.time('Fetch Tanks');
    const tanks = await fetchTanksInBatches(accountId, server, applicationId);
    console.timeEnd('Fetch Tanks');
    console.log(`Fetched ${tanks.length} tanks for account ID ${accountId}`);

    if (tanks.length === 0) {
      console.timeEnd('Total API Time');
      return res
        .status(404)
        .json({ message: 'No tanks found for this account' });
    }

    const tankIds = tanks.map((tank) => tank.tank_id).filter(Boolean);
    console.log(`Valid Tank IDs: ${tankIds.length}`);

    console.time('Fetch Tank Details');
    const tankDetails = await fetchTankDetailsInBatches(
      tankIds,
      server,
      applicationId
    );
    console.timeEnd('Fetch Tank Details');
    console.log(`Fetched details for ${tankDetails.length} tanks`);

    const tanksWithDetails = tanks
      .map((tank) => {
        if (!tank || typeof tank !== 'object' || !('tank_id' in tank)) {
          console.warn(`Invalid tank object: ${JSON.stringify(tank)}`);
          return null;
        }
        const detail = tankDetails.find(
          (detail) => detail && detail.tank_id === tank.tank_id
        );
        if (!detail) {
          console.warn(`No details found for tank_id: ${tank.tank_id}`);
          return null;
        }
        return { ...tank, ...detail };
      })
      .filter(Boolean);

    console.log(`Final list of tanks with details: ${tanksWithDetails.length}`);

    if (tanksWithDetails.length === 0) {
      console.timeEnd('Total API Time');
      return res.status(404).json({ message: 'No tank details found' });
    }

    console.timeEnd('Total API Time');
    res.status(200).json(tanksWithDetails);
  } catch (error) {
    console.error('Handler error:', error);
    console.timeEnd('Total API Time');
    res.status(500).json({ error: error.message });
  }
}
