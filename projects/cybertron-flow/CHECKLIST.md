# Cybertron Flow: User Roles & Permissions Checklist

- [x] User/role model (admin, editor, viewer) implemented in `permission.service.ts`
- [x] Permission checks for create, update, delete, execute in `orchestrator.service.ts`
- [x] Methods require user argument for access control
- [x] Documented changes in README
- [ ] Preview/test the implementation

## Roles
- **admin**: Full access (create, update, delete, execute)
- **editor**: Create, update, execute workflows
- **viewer**: No workflow modification or execution

## Actions
| Action   | Admin | Editor | Viewer |
|----------|-------|--------|--------|
| Create   |   ✓   |   ✓    |   ✗    |
| Update   |   ✓   |   ✓    |   ✗    |
| Delete   |   ✓   |   ✗    |   ✗    |
| Execute  |   ✓   |   ✓    |   ✗    |
