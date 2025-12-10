# Role-Based Access Control - Access Control Example

**Category**: Access Control
**Difficulty**: Intermediate
**Chapter**: access-control

## Overview

Demonstrates role-based access control system protecting encrypted data with fine-grained permissions.

## What You'll Learn

This example teaches:

1. **Role-Based Access Control (RBAC)**: Assign roles to users
2. **Permission Management**: Grant and revoke data access
3. **Encrypted Data Protection**: Secure sensitive information
4. **Access Modifiers**: Enforce authorization checks
5. **Event Tracking**: Log access control changes
6. **Complex Authorization**: Multi-level access policies

## Key Concepts

### Role Hierarchy

```
NONE (0)          - Unregistered user
  ↓
USER (1)          - Regular user (owns encrypted data)
  ↓
ADMIN (2)         - Administrator (can manage all users)
  ↓
AUDITOR (3)       - Compliance officer (limited view access)
```

### Access Patterns

1. **Self Access**: Users can access their own data
2. **Granted Access**: Users can grant access to others
3. **Admin Access**: Admins can access any data
4. **Revocation**: Owners can revoke granted access

### Encrypted Data

Each user has:
- `encryptedBalance`: Private financial data
- `encryptedScore`: Private score/rating

## Functions

### Role Management

#### assignRole(address user, Role role)
```solidity
function assignRole(address user, Role role) external onlyOwner
```
Assign a role to user. Only owner can call.

#### getUserRole(address user)
```solidity
function getUserRole(address user) external view returns (Role)
```
Check a user's role.

### Access Control

#### grantAccess(address grantor, address grantee)
```solidity
function grantAccess(address grantor, address grantee)
    external onlyUserOrAdmin(grantor)
```
Grant someone access to your encrypted data.

#### revokeAccess(address grantor, address grantee)
```solidity
function revokeAccess(address grantor, address grantee)
    external onlyUserOrAdmin(grantor)
```
Revoke previously granted access.

#### hasUserAccess(address targetUser, address accessor)
```solidity
function hasUserAccess(address targetUser, address accessor)
    external view returns (bool)
```
Check if someone has access to user's data.

### Encrypted Data

#### setBalance(address user, euint32 newBalance)
```solidity
function setBalance(address user, euint32 newBalance) external onlyAdmin
```
Set encrypted balance. Only admin can call.

#### getBalance(address user)
```solidity
function getBalance(address user) external view hasAccess(user)
    returns (euint32)
```
Get encrypted balance. Access control enforced.

#### setScore(address user, euint32 newScore)
```solidity
function setScore(address user, euint32 newScore) external onlyAdmin
```
Set encrypted score/rating.

#### getScore(address user)
```solidity
function getScore(address user) external view hasAccess(user)
    returns (euint32)
```
Get encrypted score with access control.

## Access Control Modifiers

### onlyOwner
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Only owner");
    _;
}
```
Restricts function to contract owner.

### onlyAdmin
```solidity
modifier onlyAdmin() {
    require(users[msg.sender].role == Role.ADMIN, "Only admin");
    _;
}
```
Restricts function to admin role.

### onlyUserOrAdmin(address targetUser)
```solidity
modifier onlyUserOrAdmin(address targetUser) {
    require(
        msg.sender == targetUser ||
        users[msg.sender].role == Role.ADMIN,
        "Not authorized"
    );
    _;
}
```
Allows owner or admin.

### hasAccess(address targetUser)
```solidity
modifier hasAccess(address targetUser) {
    require(
        msg.sender == targetUser ||
        users[msg.sender].role == Role.ADMIN ||
        accessGrants[targetUser][msg.sender],
        "Access denied"
    );
    _;
}
```
Checks if caller has access to user's data.

## Setup & Installation

```bash
npm install
npm run compile
npm run test
npm run deploy:sepolia
```

## Project Structure

```
access-control-basic/
├── contracts/
│   └── AccessControl.sol
├── test/
│   └── AccessControl.test.ts
├── scripts/
│   └── deploy.ts
├── hardhat.config.ts
├── package.json
└── README.md
```

## Authorization Flow

### User Wants to Grant Access

```
User A has encrypted data
    ↓
Calls: grantAccess(userA, userB)
    ↓
Modifier checks: msg.sender == userA or admin
    ↓
If authorized:
    Set accessGrants[userA][userB] = true
    Emit AccessGranted event
    ↓
User B can now call: getBalance(userA)
    ↓
Modifier hasAccess checks access
    ↓
If authorized, return encrypted data
```

### Access Decision Tree

```
Calling getBalance(targetUser)?
    ↓
Is caller the owner? → YES → Allow
    ↓ NO
Is caller admin? → YES → Allow
    ↓ NO
Does caller have grant? → YES → Allow
    ↓ NO
Deny with "Access denied"
```

## Testing Strategy

Tests cover:

### Deployment & Initialization
- ✓ Contract deploys
- ✓ Owner has admin role
- ✓ Initial state correct

### Role Management
- ✓ Owner can assign roles
- ✓ Non-owner cannot assign
- ✓ Multiple roles work
- ✓ Role changes work

### Access Control
- ✓ User can grant access
- ✓ Admin can manage access
- ✓ User can revoke access
- ✓ Cannot grant to self
- ✓ Admin always has access

### Encrypted Data
- ✓ Admin can set data
- ✓ User cannot set own data
- ✓ Owner/Admin can view
- ✓ Authorization enforced

### Events
- ✓ RoleAssigned event
- ✓ AccessGranted event
- ✓ AccessRevoked event
- ✓ DataModified event

## Real-World Use Cases

### Healthcare
- **Patients**: Own encrypted health records
- **Doctors**: Can access with patient permission
- **Auditors**: Limited view for compliance
- **Admin**: Manage system users

### Finance
- **Account Holders**: Own encrypted balances
- **Accountants**: Access for reporting
- **Auditors**: Verify compliance
- **Support**: Limited help desk access

### Enterprise
- **Employees**: Private salary/reviews
- **Managers**: Access reports with consent
- **HR**: Admin access to all data
- **Auditors**: Verify policies

## Key Learnings

After this example, understand:

1. **RBAC Systems**: Implementing role-based access
2. **Modifiers**: Using Solidity modifiers for access control
3. **Encrypted Data**: Protecting sensitive information
4. **Permission Grants**: Allowing dynamic access
5. **Access Enforcement**: Checking permissions before operations

## Extending This Example

### Enhancement Ideas

1. **More Roles**: Add MANAGER, VIEWER roles
2. **Time-Based Access**: Expire permissions
3. **Audit Log**: Track all access attempts
4. **Approval Workflows**: Require approval for changes
5. **Rate Limiting**: Limit access frequency

### Advanced Patterns

1. **Delegation**: Users can delegate powers
2. **Hierarchical Roles**: Role inheritance
3. **Conditional Access**: Access based on conditions
4. **Resource-Level Access**: Different permissions per resource
5. **Dynamic Policies**: Rules engine for access

## Common Issues & Solutions

### Issue: Access Denied Error
**Problem**: User trying to access data they don't have permission for
**Solution**: Grant access via `grantAccess()` or ask admin

### Issue: Only Admin Error
**Problem**: Non-admin trying to set encrypted data
**Solution**: Only admin can modify. Request admin to update.

### Issue: Role Not Found
**Problem**: Trying to get role of non-existent user
**Solution**: User must be assigned role first via `assignRole()`

## Security Considerations

✅ **Good Practices**:
- Multiple role levels
- Clear permission boundaries
- Event tracking for audit
- Owner controls role assignment
- Access can be revoked

❌ **Pitfalls to Avoid**:
- Granting excessive permissions
- Forgetting to revoke access
- No audit trail
- Hardcoded access rules
- No expiration on grants

## Resources

### Documentation
- [Access Control Patterns](https://docs.openzeppelin.com/contracts/4.x/access-control/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [FHEVM Docs](https://docs.zama.ai/)

### Related Examples
- Basic Counter - Simple operations
- Arithmetic - Encrypted operations
- Input Proofs - Secure input handling

## Summary

This example demonstrates:
- ✓ Role-based access control
- ✓ Fine-grained permissions
- ✓ Encrypted data protection
- ✓ Dynamic access grants
- ✓ Event tracking

**Next**: Explore input proofs, advanced patterns, and decryption workflows.

---

**Example Version**: 1.0
**Last Updated**: December 2025
**Status**: Production Ready
