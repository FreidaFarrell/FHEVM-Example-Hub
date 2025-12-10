// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title RoleBasedAccessControl
 * @description Demonstrates role-based access control with encrypted data
 * @chapter: access-control
 */
contract RoleBasedAccessControl is ZamaEthereumConfig {
    // Role definitions
    enum Role {
        NONE,
        USER,
        ADMIN,
        AUDITOR
    }

    // User structure with role and encrypted data
    struct UserData {
        Role role;
        euint32 encryptedBalance;
        euint32 encryptedScore;
        bool exists;
    }

    // State variables
    mapping(address => UserData) private users;
    mapping(address => mapping(address => bool)) private accessGrants;
    address public owner;

    // Events
    event RoleAssigned(address indexed user, Role role);
    event AccessGranted(address indexed owner, address indexed grantee);
    event AccessRevoked(address indexed owner, address indexed grantee);
    event DataModified(address indexed user, string dataType, uint256 timestamp);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.ADMIN, "Only admin");
        _;
    }

    modifier onlyUserOrAdmin(address targetUser) {
        require(
            msg.sender == targetUser || users[msg.sender].role == Role.ADMIN,
            "Not authorized"
        );
        _;
    }

    modifier hasAccess(address targetUser) {
        require(
            msg.sender == targetUser ||
            users[msg.sender].role == Role.ADMIN ||
            accessGrants[targetUser][msg.sender],
            "Access denied"
        );
        _;
    }

    /**
     * @notice Constructor - set owner and initial role
     */
    constructor() {
        owner = msg.sender;
        users[msg.sender] = UserData({
            role: Role.ADMIN,
            encryptedBalance: FHE.asEuint32(0),
            encryptedScore: FHE.asEuint32(100),
            exists: true
        });
    }

    /**
     * @notice Assign role to user
     * @param user Address to assign role to
     * @param role New role
     */
    function assignRole(address user, Role role) external onlyOwner {
        require(user != address(0), "Invalid address");
        require(role != Role.NONE, "Invalid role");

        users[user].role = role;
        users[user].exists = true;

        // Initialize encrypted data
        if (!users[user].exists) {
            users[user].encryptedBalance = FHE.asEuint32(0);
            users[user].encryptedScore = FHE.asEuint32(0);
        }

        emit RoleAssigned(user, role);
    }

    /**
     * @notice Grant access to view encrypted data
     * @param grantor User whose data can be accessed
     * @param grantee User being granted access
     */
    function grantAccess(address grantor, address grantee) external onlyUserOrAdmin(grantor) {
        require(grantee != address(0), "Invalid grantee");
        require(grantor != grantee, "Cannot grant to self");

        accessGrants[grantor][grantee] = true;

        emit AccessGranted(grantor, grantee);
    }

    /**
     * @notice Revoke access to encrypted data
     * @param grantor User who owns the data
     * @param grantee User losing access
     */
    function revokeAccess(address grantor, address grantee) external onlyUserOrAdmin(grantor) {
        accessGrants[grantor][grantee] = false;

        emit AccessRevoked(grantor, grantee);
    }

    /**
     * @notice Check if user has access to target's data
     * @param targetUser Owner of the data
     * @param accessor User trying to access
     * @return True if has access
     */
    function hasUserAccess(address targetUser, address accessor) external view returns (bool) {
        return
            accessor == targetUser ||
            users[accessor].role == Role.ADMIN ||
            accessGrants[targetUser][accessor];
    }

    /**
     * @notice Get user role
     * @param user Address to check
     * @return User's role
     */
    function getUserRole(address user) external view returns (Role) {
        require(users[user].exists, "User not found");
        return users[user].role;
    }

    /**
     * @notice Update encrypted balance (only owner or admin)
     * @param user Target user
     * @param newBalance New encrypted balance
     */
    function setBalance(address user, euint32 newBalance) external onlyAdmin {
        require(users[user].exists, "User not found");

        users[user].encryptedBalance = newBalance;

        FHE.allowThis(newBalance);
        FHE.allow(newBalance, user);
        FHE.allow(newBalance, owner);

        emit DataModified(user, "balance", block.timestamp);
    }

    /**
     * @notice Get encrypted balance (with access control)
     * @param user Target user
     * @return Encrypted balance
     */
    function getBalance(address user) external view hasAccess(user) returns (euint32) {
        require(users[user].exists, "User not found");
        return users[user].encryptedBalance;
    }

    /**
     * @notice Update encrypted score
     * @param user Target user
     * @param newScore New encrypted score
     */
    function setScore(address user, euint32 newScore) external onlyAdmin {
        require(users[user].exists, "User not found");

        users[user].encryptedScore = newScore;

        FHE.allowThis(newScore);
        FHE.allow(newScore, user);
        FHE.allow(newScore, owner);

        emit DataModified(user, "score", block.timestamp);
    }

    /**
     * @notice Get encrypted score (with access control)
     * @param user Target user
     * @return Encrypted score
     */
    function getScore(address user) external view hasAccess(user) returns (euint32) {
        require(users[user].exists, "User not found");
        return users[user].encryptedScore;
    }

    /**
     * @notice Check if user exists
     * @param user Address to check
     * @return True if user exists
     */
    function userExists(address user) external view returns (bool) {
        return users[user].exists;
    }
}
