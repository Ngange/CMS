const axios = require('axios');

const loginData = {
  email: 'bsallah@cms.com',
  password: 'P@ssw0rd'
};

console.log('Testing login with:', loginData);

axios.post('http://localhost:3000/api/auth/login', loginData)
  .then(response => {
    console.log('\n✅ Login successful!');
    console.log('User:', response.data.user);
    console.log('Access Token:', response.data.accessToken ? 'Present' : 'Missing');
  })
  .catch(error => {
    console.log('\n❌ Login failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('\nFull error details:', error.message);
  });
