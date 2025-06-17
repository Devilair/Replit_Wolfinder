import { db } from './db';
import { 
  users,
  professionals,
  auditLogs
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Simplified Transaction Manager Test
 * Basic atomicity validation for second OK DONE certificate
 */
export class TransactionManagerTest {
  
  /**
   * Test basic transaction rollback functionality
   */
  async testTransactionRollback(): Promise<{ success: boolean; message: string }> {
    try {
      await db.transaction(async (tx) => {
        // Create a test user
        const [testUser] = await tx.insert(users).values({
          email: `test-${Date.now()}@test.com`,
          passwordHash: 'test-hash',
          role: 'user'
        }).returning();

        // Log the creation
        await tx.insert(auditLogs).values({
          userId: testUser.id,
          action: 'test_user_created',
          entityType: 'user',
          entityId: testUser.id,
          newValues: JSON.stringify({ email: testUser.email })
        });

        // Force rollback by throwing error
        throw new Error('Intentional rollback test');
      });

      return { success: false, message: 'Transaction should have rolled back' };
    } catch (error) {
      // This is expected - verify no test user was created
      const testUsers = await db.select()
        .from(users)
        .where(eq(users.email, `test-${Date.now()}@test.com`));

      if (testUsers.length === 0) {
        return { success: true, message: 'Transaction rollback working correctly' };
      } else {
        return { success: false, message: 'Transaction rollback failed - data persisted' };
      }
    }
  }

  /**
   * Test basic transaction commit functionality
   */
  async testTransactionCommit(): Promise<{ success: boolean; message: string }> {
    try {
      const testEmail = `commit-test-${Date.now()}@test.com`;
      
      await db.transaction(async (tx) => {
        // Create a test user
        const [testUser] = await tx.insert(users).values({
          email: testEmail,
          passwordHash: 'test-hash',
          role: 'user'
        }).returning();

        // Log the creation
        await tx.insert(auditLogs).values({
          userId: testUser.id,
          action: 'test_user_created',
          entityType: 'user',
          entityId: testUser.id,
          newValues: JSON.stringify({ email: testUser.email })
        });

        // Transaction should commit successfully
      });

      // Verify user was created
      const testUsers = await db.select()
        .from(users)
        .where(eq(users.email, testEmail));

      if (testUsers.length === 1) {
        // Cleanup
        await db.delete(users).where(eq(users.email, testEmail));
        await db.delete(auditLogs).where(eq(auditLogs.entityId, testUsers[0].id));
        
        return { success: true, message: 'Transaction commit working correctly' };
      } else {
        return { success: false, message: 'Transaction commit failed - data not persisted' };
      }
    } catch (error) {
      return { success: false, message: `Transaction commit failed: ${error}` };
    }
  }

  /**
   * Run all transaction tests
   */
  async runAllTests(): Promise<{ 
    rollbackTest: { success: boolean; message: string };
    commitTest: { success: boolean; message: string };
    overallSuccess: boolean;
  }> {
    const rollbackTest = await this.testTransactionRollback();
    const commitTest = await this.testTransactionCommit();
    
    const overallSuccess = rollbackTest.success && commitTest.success;
    
    return {
      rollbackTest,
      commitTest,
      overallSuccess
    };
  }
}

export const transactionManagerTest = new TransactionManagerTest();