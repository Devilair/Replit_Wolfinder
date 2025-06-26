import { db } from './db';
import { professionals } from '@wolfinder/shared';
import { eq } from 'drizzle-orm';

export interface ProfessionalStateUpdate {
  verificationStatus?: 'pending' | 'pending_plus' | 'approved' | 'rejected';
  isVerified?: boolean;
  isPremium?: boolean;
  isClaimed?: boolean;
  verificationDate?: Date;
  verifiedBy?: number;
  claimedAt?: Date;
  claimedBy?: number;
}

export class ProfessionalStateManager {
  
  /**
   * Atomic update of professional state to ensure consistency
   * All related fields are updated in a single transaction
   */
  async updateProfessionalState(
    professionalId: number, 
    updates: ProfessionalStateUpdate,
    reason?: string
  ): Promise<void> {
    return await db.transaction(async (tx) => {
      console.log(`[ProfessionalState] Updating professional ${professionalId}: ${reason || 'No reason provided'}`);
      
      // Calculate derived fields based on verification status
      const derivedUpdates = this.calculateDerivedFields(updates);
      
      // Perform atomic update
      await tx
        .update(professionals)
        .set({
          isVerified: updates.isVerified,
          isClaimed: updates.isClaimed,
          verifiedBy: updates.verifiedBy,
          updatedAt: new Date()
        })
        .where(eq(professionals.id, professionalId));
      
      console.log(`[ProfessionalState] Successfully updated professional ${professionalId} with status: ${updates.verificationStatus}`);
    });
  }

  /**
   * Calculate derived fields to ensure consistency
   */
  private calculateDerivedFields(updates: ProfessionalStateUpdate): Partial<ProfessionalStateUpdate> {
    const derived: Partial<ProfessionalStateUpdate> = {};
    
    // Derive isVerified from verificationStatus
    if (updates.verificationStatus === 'approved') {
      derived.isVerified = true;
      derived.verificationDate = derived.verificationDate || new Date();
    } else if (updates.verificationStatus === 'rejected' || updates.verificationStatus === 'pending') {
      derived.isVerified = false;
    }
    
    // Derive isPremium for PLUS verification
    if (updates.verificationStatus === 'approved' && updates.isPremium) {
      derived.isPremium = true;
    }
    
    return derived;
  }

  /**
   * Handle document approval workflow with automatic state transitions
   */
  async handleDocumentApproval(
    professionalId: number,
    approvedDocumentTypes: string[],
    hasQualifications: boolean,
    professional: any,
    verifiedBy: string
  ): Promise<void> {
    const requiredTypes = ['identity', 'albo', 'vat_fiscal'];
    const approvedRequired = approvedDocumentTypes.filter(type => requiredTypes.includes(type));
    
    // Check if basic verification requirements are met (at least 1 required document)
    if (approvedRequired.length >= 1) {
      // Determine if this is PLUS verification (all 3 required + qualifications)
      const isPlus = approvedRequired.length === 3 && hasQualifications;
      
      // Determine auto-claim logic
      const shouldAutoClaim = professional?.userId !== null && !professional?.isClaimed;
      
      const updates: ProfessionalStateUpdate = {
        verificationStatus: 'approved',
        isVerified: true,
        isPremium: isPlus,
        verificationDate: new Date(),
        verifiedBy: parseInt(verifiedBy.toString())
      };
      
      // Add auto-claim fields if needed
      if (shouldAutoClaim) {
        updates.isClaimed = true;
        updates.claimedAt = new Date();
        updates.claimedBy = professional.userId;
      }
      
      await this.updateProfessionalState(
        professionalId, 
        updates,
        `Document approval: ${isPlus ? 'PLUS' : 'Standard'} verification completed`
      );
    }
  }

  /**
   * Handle document rejection
   */
  async handleDocumentRejection(
    professionalId: number,
    rejectedBy: number,
    reason?: string
  ): Promise<void> {
    await this.updateProfessionalState(
      professionalId,
      {
        verificationStatus: 'rejected',
        isVerified: false,
        verifiedBy: rejectedBy
      },
      `Document rejection: ${reason || 'No reason provided'}`
    );
  }

  /**
   * Get current professional state for debugging
   */
  async getProfessionalState(professionalId: number): Promise<any> {
    const [professional] = await db
      .select({
        id: professionals.id,
        isVerified: professionals.isVerified,
        isClaimed: professionals.isClaimed,
        verifiedBy: professionals.verifiedBy
      })
      .from(professionals)
      .where(eq(professionals.id, professionalId));
    
    return professional;
  }
}

export const professionalStateManager = new ProfessionalStateManager();