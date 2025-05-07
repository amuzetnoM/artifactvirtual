// Simple user and role model for Cybertron Flow
export type Role = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: Role;
}

// Permission checks for workflow actions
export class PermissionService {
  static canCreateWorkflow(user: User): boolean {
    return user.role === 'admin' || user.role === 'editor';
  }
  static canUpdateWorkflow(user: User): boolean {
    return user.role === 'admin' || user.role === 'editor';
  }
  static canDeleteWorkflow(user: User): boolean {
    return user.role === 'admin';
  }
  static canExecuteWorkflow(user: User): boolean {
    return user.role === 'admin' || user.role === 'editor';
  }
}
