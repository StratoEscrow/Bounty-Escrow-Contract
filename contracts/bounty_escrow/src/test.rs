#![cfg(test)]

use soroban_sdk::{Env, Address, String};

use crate::{BountyEscrowContract, BountyStatus, Error};

#[test]
fn test_create_bounty() {
    let env = Env::default();
    
    let sponsor = Address::generate(&env);
    let token_address = Address::generate(&env);
    let title = String::from_str(&env, "Test Bounty");
    let reward_amount = 1000_i128;
    let deadline = env.ledger().timestamp() + 86400; // 1 day from now

    let bounty_id = BountyEscrowContract::create_bounty(
        &env,
        sponsor.clone(),
        title.clone(),
        token_address.clone(),
        reward_amount,
        deadline,
    );

    assert_eq!(bounty_id, 1);

    let bounty = BountyEscrowContract::get_bounty(&env, bounty_id);
    assert_eq!(bounty.id, bounty_id);
    assert_eq!(bounty.sponsor, sponsor);
    assert_eq!(bounty.title, title);
    assert_eq!(bounty.token_address, token_address);
    assert_eq!(bounty.reward_amount, reward_amount);
    assert_eq!(bounty.deadline, deadline);
    assert_eq!(bounty.status, BountyStatus::Open);
    assert!(bounty.approved_submission_id.is_none());
}

#[test]
fn test_submit_work() {
    let env = Env::default();
    
    let sponsor = Address::generate(&env);
    let contributor = Address::generate(&env);
    let token_address = Address::generate(&env);
    let title = String::from_str(&env, "Test Bounty");
    let reward_amount = 1000_i128;
    let deadline = env.ledger().timestamp() + 86400;

    let bounty_id = BountyEscrowContract::create_bounty(
        &env,
        sponsor.clone(),
        title.clone(),
        token_address.clone(),
        reward_amount,
        deadline,
    );

    let proof_link = String::from_str(&env, "https://github.com/test/pr/1");
    let submission_id = BountyEscrowContract::submit_work(
        &env,
        bounty_id,
        contributor.clone(),
        proof_link.clone(),
    );

    assert_eq!(submission_id, 1);

    let submissions = BountyEscrowContract::get_submissions(&env, bounty_id);
    assert_eq!(submissions.len(), 1);
    assert_eq!(submissions.get(0).unwrap().id, submission_id);
    assert_eq!(submissions.get(0).unwrap().bounty_id, bounty_id);
    assert_eq!(submissions.get(0).unwrap().contributor, contributor);
    assert_eq!(submissions.get(0).unwrap().proof_link, proof_link);
}

#[test]
fn test_approve_submission() {
    let env = Env::default();
    
    let sponsor = Address::generate(&env);
    let contributor = Address::generate(&env);
    let token_address = Address::generate(&env);
    let title = String::from_str(&env, "Test Bounty");
    let reward_amount = 1000_i128;
    let deadline = env.ledger().timestamp() + 86400;

    let bounty_id = BountyEscrowContract::create_bounty(
        &env,
        sponsor.clone(),
        title.clone(),
        token_address.clone(),
        reward_amount,
        deadline,
    );

    let proof_link = String::from_str(&env, "https://github.com/test/pr/1");
    let submission_id = BountyEscrowContract::submit_work(
        &env,
        bounty_id,
        contributor.clone(),
        proof_link.clone(),
    );

    BountyEscrowContract::approve_submission(&env, bounty_id, submission_id, sponsor.clone());

    let bounty = BountyEscrowContract::get_bounty(&env, bounty_id);
    assert_eq!(bounty.status, BountyStatus::Approved);
    assert_eq!(bounty.approved_submission_id.unwrap(), submission_id);
}

#[test]
fn test_reclaim_expired() {
    let env = Env::default();
    
    let sponsor = Address::generate(&env);
    let token_address = Address::generate(&env);
    let title = String::from_str(&env, "Test Bounty");
    let reward_amount = 1000_i128;
    let deadline = env.ledger().timestamp();

    let bounty_id = BountyEscrowContract::create_bounty(
        &env,
        sponsor.clone(),
        title.clone(),
        token_address.clone(),
        reward_amount,
        deadline,
    );

    // Advance time past the dispute window (7 days)
    env.ledger().set_timestamp(env.ledger().timestamp() + 8 * 24 * 60 * 60);

    BountyEscrowContract::reclaim_expired(&env, bounty_id, sponsor.clone());

    let bounty = BountyEscrowContract::get_bounty(&env, bounty_id);
    assert_eq!(bounty.status, BountyStatus::Reclaimed);
}

#[test]
fn test_invalid_amount() {
    let env = Env::default();
    
    let sponsor = Address::generate(&env);
    let token_address = Address::generate(&env);
    let title = String::from_str(&env, "Test Bounty");
    let reward_amount = 0_i128; // Invalid amount
    let deadline = env.ledger().timestamp() + 86400;

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        BountyEscrowContract::create_bounty(
            &env,
            sponsor.clone(),
            title.clone(),
            token_address.clone(),
            reward_amount,
            deadline,
        );
    }));

    assert!(result.is_err());
}

#[test]
fn test_get_all_bounties() {
    let env = Env::default();
    
    let sponsor = Address::generate(&env);
    let token_address = Address::generate(&env);
    let title = String::from_str(&env, "Test Bounty");
    let reward_amount = 1000_i128;
    let deadline = env.ledger().timestamp() + 86400;

    BountyEscrowContract::create_bounty(
        &env,
        sponsor.clone(),
        title.clone(),
        token_address.clone(),
        reward_amount,
        deadline,
    );

    BountyEscrowContract::create_bounty(
        &env,
        sponsor.clone(),
        title.clone(),
        token_address.clone(),
        reward_amount,
        deadline,
    );

    let all_bounties = BountyEscrowContract::get_all_bounties(&env);
    assert_eq!(all_bounties.len(), 2);
}
