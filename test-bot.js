import { log } from './util/utilFunctions.js';
import { getAllTheData, rawCharData } from './util/characterFunctions.js';
import getWoWTokenPrice from './util/getWoWToken.js';

import config from './config-dev.js';
const client_id = config.client_id;
const client_secret = config.client_secret;


getAllTheData('shawbear','caelestrasz', client_id, client_secret)
.then(response => log(response))
.catch(error => log(error));

// getWoWTokenPrice('us', client_id, client_secret)
// .then(response => console.log(response))
