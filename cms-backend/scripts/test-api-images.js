const http = require('http');

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const testAPI = async () => {
  try {
    // Login
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'viewer@cms.local',
      password: 'Viewer@123',
    });

    const token = loginRes.token;
    console.log('✓ Logged in successfully\n');

    // Get articles
    const articlesData = await makeRequest('GET', '/api/articles', null, token);

    console.log('Response type:', typeof articlesData);
    console.log('Is array:', Array.isArray(articlesData));
    console.log(
      'Full response:',
      JSON.stringify(articlesData).substring(0, 200)
    );

    if (!Array.isArray(articlesData)) {
      console.log('ERROR: Response is not an array');
      return;
    }

    console.log('\n=== First 5 Articles with Images ===\n');
    articlesData.slice(0, 5).forEach((article, i) => {
      console.log(`${i + 1}. ${article.title}`);
      if (article.image) {
        console.log(`   ✓ Image: ${article.image.substring(0, 80)}...`);
      } else {
        console.log(`   ✗ NO IMAGE`);
      }
      console.log('');
    });

    console.log(`\nTotal articles: ${articlesData.length}`);
    const withImages = articlesData.filter((a) => a.image).length;
    console.log(`Articles with images: ${withImages}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

testAPI();
