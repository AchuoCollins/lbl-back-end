import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "yourPassword"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nAdd this to back_end/.env as ADMIN_PASSWORD_HASH:\n');
console.log(hash);
console.log('');
