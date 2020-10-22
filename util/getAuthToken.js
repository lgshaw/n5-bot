import fetch from 'node-fetch';

const getAuthToken = async (client_id, client_secret) =>  {
    let token;
    await fetch(`https://us.battle.net/oauth/token?grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`,{ method: 'POST' })
    .then(response => response.json())
    .then(json => {
        token = json.access_token
    })
    .catch(error => {
        return error.response.data
    });

    return token;
}

export default getAuthToken;