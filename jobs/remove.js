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

	await mailchimpService.send('DELETE', `/lists/${wfData.list_id}/members/${md5(body.email.toLowerCase())}`);
};