import { describe, it, expect, beforeEach } from 'vitest';
import { UserStorage } from '../server/storage/user-storage';
import { CategoryStorage } from '../server/storage/category-storage';
import { ProfessionalStorage } from '../server/storage/professional-storage';
import { ReviewStorage } from '../server/storage/review-storage';
import { BadgeStorage } from '../server/storage/badge-storage';
import { DatabaseStorage } from '../server/storage/database-storage';

describe('Modular Storage Architecture', () => {
  describe('Module Instantiation', () => {
    it('should create UserStorage instance', () => {
      const userStorage = new UserStorage();
      expect(userStorage).toBeDefined();
      expect(typeof userStorage.createUser).toBe('function');
      expect(typeof userStorage.getUserByEmail).toBe('function');
    });

    it('should create CategoryStorage instance', () => {
      const categoryStorage = new CategoryStorage();
      expect(categoryStorage).toBeDefined();
      expect(typeof categoryStorage.getCategories).toBe('function');
      expect(typeof categoryStorage.createCategory).toBe('function');
    });

    it('should create ProfessionalStorage instance', () => {
      const professionalStorage = new ProfessionalStorage();
      expect(professionalStorage).toBeDefined();
      expect(typeof professionalStorage.getFeaturedProfessionals).toBe('function');
      expect(typeof professionalStorage.searchProfessionals).toBe('function');
    });

    it('should create ReviewStorage instance', () => {
      const reviewStorage = new ReviewStorage();
      expect(reviewStorage).toBeDefined();
      expect(typeof reviewStorage.createReview).toBe('function');
      expect(typeof reviewStorage.getReviewsByProfessional).toBe('function');
    });

    it('should create BadgeStorage instance', () => {
      const badgeStorage = new BadgeStorage();
      expect(badgeStorage).toBeDefined();
      expect(typeof badgeStorage.getBadges).toBe('function');
      expect(typeof badgeStorage.awardBadge).toBe('function');
    });
  });

  describe('Compositional DatabaseStorage', () => {
    let databaseStorage: DatabaseStorage;

    beforeEach(() => {
      databaseStorage = new DatabaseStorage();
    });

    it('should compose all storage modules', () => {
      expect(databaseStorage).toBeDefined();
      
      // User methods
      expect(typeof databaseStorage.createUser).toBe('function');
      expect(typeof databaseStorage.getUserByEmail).toBe('function');
      
      // Category methods
      expect(typeof databaseStorage.getCategories).toBe('function');
      
      // Professional methods
      expect(typeof databaseStorage.getFeaturedProfessionals).toBe('function');
      expect(typeof databaseStorage.searchProfessionals).toBe('function');
      
      // Review methods
      expect(typeof databaseStorage.createReview).toBe('function');
      
      // Badge methods
      expect(typeof databaseStorage.getBadges).toBe('function');
      
      // Admin methods
      expect(typeof databaseStorage.getAdminDashboardStats).toBe('function');
    });

    it('should maintain interface compatibility', () => {
      // Verify all IStorage interface methods are implemented
      const requiredMethods = [
        'createUser', 'getUserByEmail', 'getUserById', 'updateUser', 'getUsers',
        'getCategories', 'createCategory',
        'createProfessional', 'getProfessional', 'getProfessionals',
        'getFeaturedProfessionals', 'searchProfessionals',
        'createReview', 'getReview', 'updateReview',
        'getBadges', 'createBadge',
        'getAdminDashboardStats'
      ];

      requiredMethods.forEach(method => {
        expect(typeof (databaseStorage as any)[method]).toBe('function');
      });
    });
  });

  describe('Type Safety Validation', () => {
    it('should have proper TypeScript interfaces', () => {
      // This test validates that the module compiles without TypeScript errors
      const storage = new DatabaseStorage();
      
      // Test method signatures exist and are callable
      expect(() => {
        storage.getFeaturedProfessionals(6);
        storage.searchProfessionals('test', 1, 'Roma', 'RM', 10, 0);
        storage.getAdminDashboardStats();
      }).not.toThrow();
    });
  });

  describe('Module Isolation', () => {
    it('should allow independent module testing', () => {
      const userStorage = new UserStorage();
      const categoryStorage = new CategoryStorage();
      
      // Modules should be independent
      expect(userStorage).not.toBe(categoryStorage);
      expect(Object.getPrototypeOf(userStorage)).not.toBe(Object.getPrototypeOf(categoryStorage));
    });
  });
});