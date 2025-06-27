export type ProfessionalWithDetails = Professional & {
  user?: User | null;
  category?: Category | null;
  subcategory?: Subcategory | null;
}; 