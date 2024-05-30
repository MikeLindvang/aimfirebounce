// utils/getAccountId.js

export async function getAccountId(username, server) {
  const apiUrls = {
    na: `https://api.worldoftanks.com/wot/account/list/?application_id=83ee6e6df57527a5c4b2873e902b4bfd&search=`,
    eu: `https://api.worldoftanks.eu/wot/account/list/?application_id=83ee6e6df57527a5c4b2873e902b4bfd&search=`,
    ru: `https://api.worldoftanks.ru/wot/account/list/?application_id=83ee6e6df57527a5c4b2873e902b4bfd&search=`,
    asia: `https://api.worldoftanks.asia/wot/account/list/?application_id=83ee6e6df57527a5c4b2873e902b4bfd&search=`,
  };
  console.log('API CALL: ', apiUrls[server]);

  const response = await fetch(`${apiUrls[server]}${username}`);
  const data = await response.json();

  if (data.status === 'ok' && data.data.length > 0) {
    return data.data[0].account_id;
  } else {
    throw new Error('Account not found');
  }
}
