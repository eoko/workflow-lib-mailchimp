const request = require('request-promise-native');

let username, apikey = null;

module.exports.init = (api_key, user_name) => {
	apikey = api_key;
	username = user_name;
};

module.exports.send = async(method, endpoint, params) => {
	return (await sendRequest(method, endpoint, params));
};

module.exports.isExists = async(list_id, query) => {
	try {
		const result = await module.exports.send('GET', '/search-members', {
			query,
			list_id
		});

		return result.exact_matches.total_items > 0;
	} catch(e) {
		return false;
	}
};

/**
 * Send request to reply
 * @param method
 * @param endpoint
 * @param params
 * @param apiKey
 * @returns {*}
 */
async function sendRequest(method, endpoint, params) {
	if (apikey === null || apikey === undefined) {
		throw new Error('Missing api key');
	}

	if (username === null || username === undefined) {
		throw new Error('Missing user name');
	}
    const mailchimpServer = apikey.split('-')[1];
	const options = {
		uri: `https://${mailchimpServer}.api.mailchimp.com/3.0${endpoint}`,
		port: 443,
		method: method,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		auth: {
			'user': username,
			'pass': apikey,
			'sendImmediately': true
		}
	};

	if (options.method === 'GET') {
		options['qs'] = params;
	} else {
		options['body'] = JSON.stringify(params);
	}

	return request(options).then((data) => {
		if (data) {
			return JSON.parse(data);
		} else {
			return null;
		}
	});
}