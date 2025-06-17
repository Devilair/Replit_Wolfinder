// Test rapido Auth Manager - Token Generation
import { authManager } from './server/auth-manager.js';

async function testTokenGeneration() {
  console.log('🔬 Testing Auth Manager - Token Generation');
  
  try {
    // Test user mock
    const testUser = {
      id: 123,
      email: 'test@wolfinder.it',
      role: 'professional'
    };
    
    console.log('📝 Generating tokens for test user...');
    const tokens = await authManager.generateTokens(testUser);
    
    console.log('✅ Tokens generated successfully:');
    console.log('- Access Token Length:', tokens.accessToken.length);
    console.log('- Refresh Token Length:', tokens.refreshToken.length);
    console.log('- Access Token Expires:', tokens.accessTokenExpiresAt);
    console.log('- Refresh Token Expires:', tokens.refreshTokenExpiresAt);
    
    // Test token verification
    console.log('\n🔍 Testing token verification...');
    const payload = authManager.verifyAccessToken(tokens.accessToken);
    
    if (payload) {
      console.log('✅ Access token verification successful:');
      console.log('- User ID:', payload.userId);
      console.log('- Email:', payload.email);
      console.log('- Role:', payload.role);
      console.log('- Token Family:', payload.tokenFamily);
    } else {
      console.log('❌ Access token verification failed');
      return false;
    }
    
    // Test refresh flow
    console.log('\n🔄 Testing refresh flow...');
    const newTokens = await authManager.refreshTokens(tokens.refreshToken);
    
    if (newTokens) {
      console.log('✅ Refresh successful - new tokens generated');
      console.log('- New Access Token Length:', newTokens.accessToken.length);
      console.log('- Access tokens are different:', tokens.accessToken !== newTokens.accessToken);
    } else {
      console.log('❌ Refresh failed');
      return false;
    }
    
    // Test token stats
    console.log('\n📊 Token storage stats:');
    const stats = authManager.getTokenStats();
    console.log('- Total tokens:', stats.totalTokens);
    console.log('- Active tokens:', stats.activeTokens);
    
    console.log('\n🎉 All Auth Manager tests PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Auth Manager test FAILED:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

testTokenGeneration();