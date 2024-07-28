export default class Fetch {
  async post(url, contentData, formData) {
    const options = {
      method: 'POST',
      credentials: 'include',
    };

    if (contentData === 'multipart/form-data') {
      // For multipart/form-data, set the FormData object directly as the body
      options.body = formData;
    } else if (contentData === 'application/json') {
      options.headers = {
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(formData);
    } else {
      options.headers = {
        'Content-Type': contentData,
      };
      options.body = formData;
    }

    try {
      console.log('Fetch options:', options); // Log fetch options before the request
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log('Fetch response:', response); // Log the response after the request
      return response;
    } catch (err) {
      console.error('Fetch error:', err);
      throw new Error('Network error');
    }
  }

  async get(url) {
    const options = {
      method: 'GET',
      credentials: 'include',
    };

    try {
      console.log('Fetch options:', options); // Log fetch options before the request
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log('Fetch response:', response); // Log the response after the request
      return response;
    } catch (err) {
      console.error('Fetch error:', err);
      throw new Error('Network error');
    }
  }
}
