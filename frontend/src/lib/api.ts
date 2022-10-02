export function get(url: string, params?: Record<string, any>) {
	const urlObject = new URL(url);
	if (params) {
		Object.keys(params).forEach((key) => urlObject.searchParams.append(key, params[key]));
	}
	return fetch(urlObject, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

export function post(url: string, body?: BodyInit) {
	const urlObject = new URL(url);

	return fetch(urlObject, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body
	});
}

export function patch(url: string, body?: BodyInit) {
	const urlObject = new URL(url);

	return fetch(urlObject, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json'
		},
		body
	});
}

export function put(url: string, body?: BodyInit) {
	const urlObject = new URL(url);

	return fetch(urlObject, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body
	});
}

export function del(url: string) {
	const urlObject = new URL(url);

	return fetch(urlObject, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
