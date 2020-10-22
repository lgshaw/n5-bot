import fetch from 'node-fetch';
import getAuthToken from './getAuthToken.js';

const getWoWTokenPrice = async ( region, client_id, client_secret ) => {
	let price;
	const token = await getAuthToken(client_id, client_secret)

	await fetch(`https://us.api.blizzard.com/data/wow/token/?namespace=dynamic-us&locale=en_US&access_token=${token}`)
	.then(response => response.json())
	.then(response => {
		price = response.price;
	})
	.catch(error => {
			console.log(error);
	});

	return price;
}

export default getWoWTokenPrice