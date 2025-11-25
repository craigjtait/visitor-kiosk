let currentSearchNumber = 0;

const webexMsgUrl = 'https://webexapis.com/v1/messages';
const webexMembershipsUrl = 'https://webexapis.com/v1/memberships';

async function get(url, token) {
  if (!token) throw(new Error('No webex token specified'));

  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };
  try {
    const data = await fetch(url, options);
    const json = await data.json();
    return json.items || [];
  }
  catch(e) {
    console.log('not able to fetch');
    return [];
  }
}

// Modified sendMessage to accept roomId instead of toPersonEmail
function sendMessage(token, roomId, markdown, file) {
  const formData = new FormData();
  if (file) {
    formData.append('files', file);
  }
  formData.set('markdown', markdown);
  formData.set('roomId', roomId); // Changed to roomId

  const options = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
    method: 'POST',
    body: formData,
  };

  return fetch(webexMsgUrl, options);
}

async function checkVisitorMembership(email, roomId, token, callback) {
  if (!email || !roomId) {
    callback(false); // Cannot check without email or roomId
    return;
  }
  if (!token) {
    // If token is missing, we cannot perform a real check.
    callback(false); // Assume not authorized if no token
    return;
  }

  const url = `${webexMembershipsUrl}?roomId=${roomId}&personEmail=${encodeURIComponent(email)}`;
  try {
    const result = await get(url, token);
    callback(result.length > 0); // True if any membership found, false otherwise
  } catch (e) {
    console.error('Error checking visitor membership:', e);
    callback(false); // Assume not authorized on error
  }
}

// Removed: searchMembership function