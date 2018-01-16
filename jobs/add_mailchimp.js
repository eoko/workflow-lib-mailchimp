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

	const isExist = await mailchimpUserExists(wfData.list_id, body.email);

	if(wfData.mapping) {
		Object.keys(wfData.mapping).map((key) => {
			if(wfData.mapping[key].startsWith('$')) {
				wfData.mapping[key] = body[wfData.mapping[key].split('$')[1]];
			}
		});
	}

	try {
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

	} catch(e) {
		console.log(e);
	}


	// try {
	// 	await replyService.api(wfData.api_key).send('GET', `/v1/people?email=${encodeURIComponent(body.email)}`);
	// 	job.progress(35);
	//
	// 	await replyService.api(wfData.api_key).send('POST', '/v1/actions/removepersonfromallcampaigns', {
	// 		'email': body.email
	// 	});
	// 	job.progress(75);
	//
	// 	await replyService.api(wfData.api_key).send('POST', '/v1/actions/pushtocampaign', {
	// 		'campaignId': wfData.campaign_id,
	// 		'email': body.email,
	// 	});
	// 	job.progress(100);
	//
	// } catch(err) {
	// 	if(err.statusCode === 404) {
	// 		await replyService.api(wfData.api_key).send('POST', '/v1/actions/addandpushtocampaign', {
	// 			'campaignId': wfData.campaign_id,
	// 			'email': body.email,
	// 			'firstName': body.email,
	// 		});
	// 		job.progress(100);
	// 	} else {
	// 		throw err;
	// 	}
	// }
};

async function mailchimpUserExists(list_id, query) {
	try {
		const result = await mailchimpService.send('GET', '/search-members', {
			query,
			list_id
		});

		return result.exact_matches.total_items > 0;
	} catch(e) {
		return false;
	}
}
function update() {

}