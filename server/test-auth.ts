// Test di login con hash della password corretta per Password123!
import bcrypt from 'bcrypt';

async function testPassword() {
  const password = 'Password123!';
  const hash = await bcrypt.hash(password, 12);
  console.log('Hash generato:', hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Password valida:', isValid);
  
  // Test con hash nel database
  const dbHash = '$2b$12$rQZ8kqY.Zs3qP2gJ9VxF6OzX8wY.mN7LpQ4rT6sU9vW1xA2bC3dE4f';
  const isValidDb = await bcrypt.compare(password, dbHash);
  console.log('Password valida con hash DB:', isValidDb);
}

testPassword();