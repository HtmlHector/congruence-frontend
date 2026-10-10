export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  createdAt: string;
  owner_id?: string;
  created_by?: string;
  stripe_subscription_id?: string;
  billing_period_end?: string;
}

export interface CreateWorkspaceInput {
  name: string;
  companyType?: string;
  teamSize?: string;
}
