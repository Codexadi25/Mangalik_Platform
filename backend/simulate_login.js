const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/local-login', {
      identifier: 'creedracer111@gmail.com',
      password: 'asdfghjkl'
    });
    console.log("Login Success:", res.status, res.data);
  } catch (err) {
    console.error("Login Failed:", err.response ? err.response.status : err.message, err.response ? err.response.data : '');
  }
}

run();
