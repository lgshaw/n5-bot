const getWoWTokenPrice = ( region, token ) => {
	return axios(`https://us.api.blizzard.com/data/wow/token/?namespace=dynamic-us&locale=en_US&access_token=${token}`)
	.then(response => response.data)
	.catch(error => {
			console.log(error);
	});
}

export default getWoWTokenPrice