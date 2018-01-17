const mailchimpService = require('../services/service');
const md5 = require('md5');
const _get = require('lodash.get');

module.exports = async(job) => {

	const {
		body,
		workflow: {
			data: wfData
		}
	} = job.data;

	if(!wfData || !wfData.api_key) {
		throw new Error('Missing data api_key');
	}

	if(!wfData || !wfData.list_id) {
		throw new Error('Missing data list_id');
	}

	if(!body || !body.email) {
		throw new Error('Missing email in body');
	}

	mailchimpService.init(wfData.api_key, wfData.api_user_name);

	const isExist = await mailchimpService.isExists(wfData.list_id, body.email);

	if(!isExist) {
		throw new Error(`User does not exists : ${body.email}`);
	}

	if(wfData.mapping) {
		const reg = /^%([a-zA-Z0-9-_]+)%$/;
		Object.keys(wfData.mapping).map((key) => {
			if(wfData.mapping[key].startsWith('$')) {
				wfData.mapping[key] = body[wfData.mapping[key].split('$')[1]];
			}

			if(wfData.mapping[key].indexOf('%') !== -1 && reg.test(wfData.mapping[key])) {
				wfData.mapping[key] = _get(body, wfData.mapping[key].replace(reg, '$1'));
			}
		});
	}

	await mailchimpService.send('PATCH', `/lists/${wfData.list_id}/members/${md5(body.email)}`, {
		status: 'subscribed',
		merge_fields: wfData.mapping,
	});
};