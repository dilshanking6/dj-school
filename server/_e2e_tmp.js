const axios = require('axios');

const BASE = process.env.BASE || 'http://127.0.0.1:5055';
const http = axios.create({ baseURL: BASE, validateStatus: () => true, timeout: 60000 });

const say = (label, res) =>
  console.log(`${label} -> ${res.status} ${JSON.stringify(res.data).slice(0, 300)}`);

const run = async () => {
  const stamp = Date.now();
  const email = `e2e.student.${stamp % 100000}@gmail.com`;
  const phone = `98${String(stamp).slice(-8)}`;
  const password = 'E2e@Pass99';

  // 1. email OTP
  let res = await http.post('/api/auth/email-otp/request', { email });
  say('email-otp/request', res);
  const code = res.data.devCode;
  if (!code) throw new Error('devCode nahi mila — register flow yahin atak jayega');

  // 2. verify -> proof
  res = await http.post('/api/auth/email-otp/verify', { email, code });
  say('email-otp/verify', res);
  const proof = res.data.proof;
  if (!proof) throw new Error('proof nahi mila');

  // 3. register student
  res = await http.post('/api/auth/register', {
    role: 'student',
    firstName: 'E2E',
    lastName: `Student${stamp % 1000}`,
    email,
    phone,
    password,
    fatherName: `E2E Father${stamp % 1000}`,
    motherName: `E2E Mother${stamp % 1000}`,
    className: '10',
    rollNumber: `T${stamp % 10000}`,
    section: 'A',
    gender: 'male',
    proof
  });
  say('register', res);
  if (res.status !== 201) throw new Error('register fail');

  // 4. student login
  res = await http.post('/api/auth/login', { email, password, role: 'student' });
  say('student login', res);
  if (res.status !== 200) throw new Error('student login fail');
  const studentId = res.data.user.id;
  const studentToken = res.data.token;

  // 5. student portal ka ek protected call
  const auth = { headers: { Authorization: `Bearer ${studentToken}` } };
  res = await http.get('/api/forms', auth);
  say('GET /api/forms (student)', res);

  // 6. galat password + galat portal
  res = await http.post('/api/auth/login', { email, password: 'Wrong@Pass1', role: 'student' });
  say('wrong password', res);
  res = await http.post('/api/auth/login', { email, password, role: 'admin' });
  say('student creds on admin portal', res);

  // 7. admin se naya account saaf karo (test data sheet me nahi rehna chahiye)
  res = await http.post('/api/auth/login', {
    email: 'dilshan@gmail.com',
    password: '@##D786c##@',
    role: 'admin'
  });
  if (res.status !== 200) throw new Error('admin login fail');
  const adminAuth = { headers: { Authorization: `Bearer ${res.data.token}` } };
  res = await http.delete(`/api/auth/delete/${studentId}`, adminAuth);
  say('admin delete test student', res);

  // 8. delete ke baad login band hona chahiye
  res = await http.post('/api/auth/login', { email, password, role: 'student' });
  say('login after delete (401 hi aana chahiye)', res);

  console.log('E2E DONE');
};

run().catch((error) => {
  console.error('E2E FAILED:', error.message);
  process.exit(1);
});
