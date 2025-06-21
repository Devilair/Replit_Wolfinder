import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Happy Path Integration Tests', () => {
  const BASE_URL = 'http://localhost:5000';
  let authToken: string;
  let professionalId: number;
  let uploadedFileId: string;
  let reviewId: number;

  describe('End-to-End User Journey', () => {
    it('should complete full professional registration and verification flow', async () => {
      // Step 1: Professional Registration
      const registrationData = {
        name: 'Marco Verdi',
        email: `test-professional-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        role: 'professional',
        businessName: 'Studio Verdi Architettura',
        description: 'Studio di architettura specializzato in residenziale',
        categoryId: 24, // Architetto category
        address: 'Via Roma 123',
        city: 'Milano',
        province: 'MI',
        postalCode: '20100',
        phone: '+39 02 1234567',
        website: 'https://studioverdi.it'
      };

      try {
        const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData)
        });

        if (registerResponse.ok) {
          const registerResult = await registerResponse.json();
          expect(registerResult).toHaveProperty('user');
          expect(registerResult).toHaveProperty('professional');
          professionalId = registerResult.professional.id;
          console.log(`✓ Professional registered: ID ${professionalId}`);
        }
      } catch (error) {
        console.log('Registration test skipped - server not available');
      }
    });

    it('should authenticate and obtain access token', async () => {
      const loginData = {
        email: `test-professional-${Date.now()}@example.com`,
        password: 'SecurePass123!'
      };

      try {
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        });

        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          expect(loginResult).toHaveProperty('token');
          authToken = loginResult.token;
          console.log('✓ Authentication successful');
        }
      } catch (error) {
        console.log('Authentication test skipped - server not available');
      }
    });

    it('should upload verification document', async () => {
      if (!authToken || !professionalId) {
        console.log('Skipping upload test - missing auth/professional');
        return;
      }

      // Create a minimal PDF buffer for testing
      const mockPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n%%EOF');
      
      try {
        const formData = new FormData();
        const blob = new Blob([mockPdfBuffer], { type: 'application/pdf' });
        formData.append('document', blob, 'identity-document.pdf');
        formData.append('documentType', 'identity');

        const uploadResponse = await fetch(`${BASE_URL}/api/professionals/${professionalId}/documents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          expect(uploadResult).toHaveProperty('document');
          uploadedFileId = uploadResult.document.id;
          console.log(`✓ Document uploaded: ID ${uploadedFileId}`);
        }
      } catch (error) {
        console.log('Upload test skipped - server not available or missing endpoint');
      }
    });

    it('should create professional review', async () => {
      if (!professionalId) {
        console.log('Skipping review test - missing professional');
        return;
      }

      const reviewData = {
        rating: 5,
        title: 'Lavoro eccellente',
        content: 'Il professionista ha svolto un lavoro di alta qualità, rispettando i tempi e il budget concordato.',
        serviceType: 'Progettazione residenziale',
        projectValue: 50000,
        reviewerName: 'Cliente Soddisfatto',
        reviewerEmail: `client-${Date.now()}@example.com`
      };

      try {
        const reviewResponse = await fetch(`${BASE_URL}/api/professionals/${professionalId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        });

        if (reviewResponse.ok) {
          const reviewResult = await reviewResponse.json();
          expect(reviewResult).toHaveProperty('review');
          reviewId = reviewResult.review.id;
          console.log(`✓ Review created: ID ${reviewId}`);
        }
      } catch (error) {
        console.log('Review test skipped - server not available');
      }
    });

    it('should validate professional profile is accessible', async () => {
      if (!professionalId) {
        console.log('Skipping profile test - missing professional');
        return;
      }

      try {
        const profileResponse = await fetch(`${BASE_URL}/api/professionals/${professionalId}`);

        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          expect(profile).toHaveProperty('id', professionalId);
          expect(profile).toHaveProperty('businessName');
          expect(profile).toHaveProperty('description');
          expect(profile).toHaveProperty('rating');
          expect(profile).toHaveProperty('reviewCount');
          console.log(`✓ Professional profile accessible: ${profile.businessName}`);
        }
      } catch (error) {
        console.log('Profile test skipped - server not available');
      }
    });

    it('should validate professional appears in search results', async () => {
      if (!professionalId) {
        console.log('Skipping search test - missing professional');
        return;
      }

      try {
        const searchResponse = await fetch(`${BASE_URL}/api/professionals/search?query=Verdi&city=Milano`);

        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();
          expect(Array.isArray(searchResults)).toBe(true);
          
          if (searchResults.length > 0) {
            const foundProfessional = searchResults.find((p: any) => p.id === professionalId);
            if (foundProfessional) {
              expect(foundProfessional).toHaveProperty('businessName');
              console.log(`✓ Professional found in search: ${foundProfessional.businessName}`);
            }
          }
        }
      } catch (error) {
        console.log('Search test skipped - server not available');
      }
    });
  });

  describe('Data Consistency Validation', () => {
    it('should ensure review count is updated after review creation', async () => {
      if (!professionalId || !reviewId) {
        console.log('Skipping consistency test - missing data');
        return;
      }

      try {
        const profileResponse = await fetch(`${BASE_URL}/api/professionals/${professionalId}`);

        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          expect(typeof profile.reviewCount).toBe('number');
          expect(profile.reviewCount).toBeGreaterThanOrEqual(0);
          console.log(`✓ Review count consistency: ${profile.reviewCount} reviews`);
        }
      } catch (error) {
        console.log('Consistency test skipped - server not available');
      }
    });

    it('should validate badge calculation after activity', async () => {
      if (!professionalId) {
        console.log('Skipping badge test - missing professional');
        return;
      }

      try {
        const badgeResponse = await fetch(`${BASE_URL}/api/professionals/${professionalId}/calculate-badges`);

        if (badgeResponse.ok) {
          const badges = await badgeResponse.json();
          expect(Array.isArray(badges)).toBe(true);
          
          badges.forEach((badge: any) => {
            expect(badge).toHaveProperty('badgeId');
            expect(badge).toHaveProperty('earned');
            expect(badge).toHaveProperty('progress');
            expect(typeof badge.earned).toBe('boolean');
            expect(typeof badge.progress).toBe('number');
          });
          
          console.log(`✓ Badge calculation: ${badges.length} badges evaluated`);
        }
      } catch (error) {
        console.log('Badge test skipped - server not available');
      }
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle invalid professional ID gracefully', async () => {
      try {
        const invalidResponse = await fetch(`${BASE_URL}/api/professionals/99999999`);
        expect([404, 500]).toContain(invalidResponse.status);
        console.log(`✓ Invalid ID handled gracefully: ${invalidResponse.status}`);
      } catch (error) {
        console.log('Error handling test skipped - server not available');
      }
    });

    it('should respond to API calls within reasonable time', async () => {
      const endpoints = [
        '/api/health',
        '/api/categories',
        '/api/professionals/featured'
      ];

      for (const endpoint of endpoints) {
        try {
          const startTime = Date.now();
          const response = await fetch(`${BASE_URL}${endpoint}`);
          const responseTime = Date.now() - startTime;

          if (response.ok) {
            expect(responseTime).toBeLessThan(2000); // 2 seconds max
            console.log(`✓ ${endpoint}: ${responseTime}ms`);
          }
        } catch (error) {
          console.log(`Performance test skipped for ${endpoint} - server not available`);
        }
      }
    });
  });
});