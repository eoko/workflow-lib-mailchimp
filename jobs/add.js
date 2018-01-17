const mailchimpService = require('../services/service');
const md5 = require('md5');

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

	if(wfData.mapping) {
		Object.keys(wfData.mapping).map((key) => {
			if(wfData.mapping[key].startsWith('$')) {
				wfData.mapping[key] = body[wfData.mapping[key].split('$')[1]];
			}
		});
	}

	if(isExist) {
		await mailchimpService.send('PATCH', `/lists/${wfData.list_id}/members/${md5(body.email)}`, {
			status: 'subscribed',
			merge_fields: wfData.mapping,
		});
	} else {
		await mailchimpService.send('POST', `/lists/${wfData.list_id}/members`, {
			email_address: body.email,
			status: 'subscribed',
			merge_fields: wfData.mapping,
		});
	}
};