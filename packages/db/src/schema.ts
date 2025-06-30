import type { Professional, User, Category, Subcategory } from '../../shared/src/client-types';

export type ProfessionalWithDetails = Professional & {
  user?: User | null;
  category?: Category | null;
  subcategory?: Subcategory | null;
}; 