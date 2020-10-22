import { log } from './util/utilFunctions.js';
import { getAllTheData } from './util/characterFunctions.js';

import config from './config-dev.js';
const client_id = config.client_id;
const client_secret = config.client_secret;


getAllTheData('shaweaver','caelestrasz', client_id, client_secret)
.then(response => log(response))
.catch(error => log(error));
