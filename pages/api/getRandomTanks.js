import { getAccountId } from '../../utils/getAccountId';

const fetchTanksInBatches = async (
  accountId,
  server,
  applicationId,
  batchSize = 100
) => {
  let page = 0;
  let allTanks = [];
  let hasMoreTanks = true;

  while (hasMoreTanks) {
    const tanksApiUrl = `https://api.worldoftanks.${server}/wot/account/tanks/?application_id=${applicationId}&account_id=${accountId}&limit=${batchSize}&page_no=${page}`;
    console.log('Tanks API CALL: ', tanksApiUrl);

    const tanksResponse = await fetch(tanksApiUrl);
    const tanksData = await tanksResponse.json();

    if (tanksData.status === 'ok') {
      const tanks = tanksData.data[accountId];
      allTanks = allTanks.concat(tanks);
      hasMoreTanks = tanks.length === batchSize;
      page += 1;
    } else {
      throw new Error('Failed to fetch tanks');
    }
  }

  return allTanks;
};

const fetchTankDetailsInBatches = async (
  tankIds,
  server,
  applicationId,
  batchSize = 100
) => {
  let allTankDetails = [];

  for (let i = 0; i < tankIds.length; i += batchSize) {
    const batchIds = tankIds.slice(i, i + batchSize).join(',');
    const tankopediaApiUrl = `https://api.worldoftanks.${server}/wot/encyclopedia/vehicles/?application_id=${applicationId}&tank_id=${batchIds}`;
    console.log('Tankopedia API CALL: ', tankopediaApiUrl);

    const tankopediaResponse = await fetch(tankopediaApiUrl);
    const tankopediaData = await tankopediaResponse.json();

    if (tankopediaData.status === 'ok') {
      allTankDetails = allTankDetails.concat(
        Object.values(tankopediaData.data)
      );
    } else {
      throw new Error('Failed to fetch tank details');
    }
  }

  return allTankDetails;
};

export default async function handler(req, res) {
  const { username, server } = req.query;
  const applicationId = process.env.NEXT_PUBLIC_WOT_APPLICATION_ID;

  try {
    const accountId = await getAccountId(username, server);
    const tanks = await fetchTanksInBatches(accountId, server, applicationId);

    const tankIds = tanks.map((tank) => tank.tank_id);
    const tankDetails = await fetchTankDetailsInBatches(
      tankIds,
      server,
      applicationId
    );

    const tanksWithDetails = tanks.map((tank) => ({
      ...tank,
      ...tankDetails.find((detail) => detail.tank_id === tank.tank_id),
    }));

    res.status(200).json(tanksWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
