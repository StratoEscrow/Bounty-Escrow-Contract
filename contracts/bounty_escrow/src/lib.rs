#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, String, Vec, Map, Symbol, token};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Bounty {
    pub id: u64,
    pub sponsor: Address,
    pub title: String,
    pub token_address: Address,
    pub reward_amount: i128,
    pub deadline: u64,
    pub created_at: u64,
    pub status: BountyStatus,
    pub approved_submission_id: Option<u64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BountyStatus {
    Open,
    Approved,
    Reclaimed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Submission {
    pub id: u64,
    pub bounty_id: u64,
    pub contributor: Address,
    pub proof_link: String,
    pub submitted_at: u64,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    BountyNotFound = 1,
    NotAuthorized = 2,
    InvalidAmount = 3,
    BountyExpired = 4,
    BountyNotOpen = 5,
    SubmissionNotFound = 6,
    AlreadyApproved = 7,
    DeadlineNotReached = 8,
    InvalidToken = 9,
    TransferFailed = 10,
}

const BOUNTY_COUNTER: Symbol = Symbol::new(&["BOUNTY_COUNTER"]);
const SUBMISSION_COUNTER: Symbol = Symbol::new(&["SUBMISSION_COUNTER"]);
const BOUNTIES: Symbol = Symbol::new(&["BOUNTIES"]);
const SUBMISSIONS: Symbol = Symbol::new(&["SUBMISSIONS"]);
const BOUNTY_SUBMISSIONS: Symbol = Symbol::new(&["BOUNTY_SUBMISSIONS"]);

#[contract]
pub struct BountyEscrowContract;

#[contractimpl]
impl BountyEscrowContract {
    pub fn create_bounty(
        env: Env,
        sponsor: Address,
        title: String,
        token_address: Address,
        reward_amount: i128,
        deadline: u64,
    ) -> u64 {
        sponsor.require_auth();
        
        if reward_amount <= 0 {
            panic!("{}", Error::InvalidAmount);
        }

        // Transfer tokens from sponsor to contract
        let token_client = token::Client::new(&env, &token_address);
        let contract_address = env.current_contract_address();
        token_client.transfer(&sponsor, &contract_address, &reward_amount);

        let bounty_id = env.storage().instance().get(&BOUNTY_COUNTER).unwrap_or(0) + 1;
        env.storage().instance().set(&BOUNTY_COUNTER, &bounty_id);

        let bounty = Bounty {
            id: bounty_id,
            sponsor: sponsor.clone(),
            title,
            token_address: token_address.clone(),
            reward_amount,
            deadline,
            created_at: env.ledger().timestamp(),
            status: BountyStatus::Open,
            approved_submission_id: None,
        };

        let mut bounties: Map<u64, Bounty> = env.storage().instance().get(&BOUNTIES).unwrap_or(Map::new(&env));
        bounties.set(bounty_id, bounty);
        env.storage().instance().set(&BOUNTIES, &bounties);

        bounty_id
    }

    pub fn submit_work(
        env: Env,
        bounty_id: u64,
        contributor: Address,
        proof_link: String,
    ) -> u64 {
        contributor.require_auth();

        let mut bounties: Map<u64, Bounty> = env.storage().instance().get(&BOUNTIES)
            .unwrap_or_else(|| panic!("{}", Error::BountyNotFound));

        let mut bounty = bounties.get(bounty_id).unwrap_or_else(|| panic!("{}", Error::BountyNotFound));

        if bounty.status != BountyStatus::Open {
            panic!("{}", Error::BountyNotOpen);
        }

        if env.ledger().timestamp() > bounty.deadline {
            panic!("{}", Error::BountyExpired);
        }

        let submission_id = env.storage().instance().get(&SUBMISSION_COUNTER).unwrap_or(0) + 1;
        env.storage().instance().set(&SUBMISSION_COUNTER, &submission_id);

        let submission = Submission {
            id: submission_id,
            bounty_id,
            contributor: contributor.clone(),
            proof_link,
            submitted_at: env.ledger().timestamp(),
        };

        let mut submissions: Map<u64, Submission> = env.storage().instance().get(&SUBMISSIONS)
            .unwrap_or(Map::new(&env));
        submissions.set(submission_id, submission);
        env.storage().instance().set(&SUBMISSIONS, &submissions);

        let mut bounty_submissions: Vec<u64> = env.storage().instance().get(&BOUNTY_SUBMISSIONS)
            .unwrap_or_else(|| Vec::new(&env));
        bounty_submissions.push_back(submission_id);
        env.storage().instance().set(&BOUNTY_SUBMISSIONS, &bounty_submissions);

        submission_id
    }

    pub fn approve_submission(
        env: Env,
        bounty_id: u64,
        submission_id: u64,
        sponsor: Address,
    ) {
        sponsor.require_auth();

        let mut bounties: Map<u64, Bounty> = env.storage().instance().get(&BOUNTIES)
            .unwrap_or_else(|| panic!("{}", Error::BountyNotFound));

        let mut bounty = bounties.get(bounty_id).unwrap_or_else(|| panic!("{}", Error::BountyNotFound));

        if bounty.sponsor != sponsor {
            panic!("{}", Error::NotAuthorized);
        }

        if bounty.status != BountyStatus::Open {
            panic!("{}", Error::BountyNotOpen);
        }

        let submissions: Map<u64, Submission> = env.storage().instance().get(&SUBMISSIONS)
            .unwrap_or_else(|| panic!("{}", Error::SubmissionNotFound));

        let submission = submissions.get(submission_id).unwrap_or_else(|| panic!("{}", Error::SubmissionNotFound));

        if submission.bounty_id != bounty_id {
            panic!("{}", Error::SubmissionNotFound);
        }

        // Transfer locked tokens to the contributor
        let token_client = token::Client::new(&env, &bounty.token_address);
        let contract_address = env.current_contract_address();
        token_client.transfer(&contract_address, &submission.contributor, &bounty.reward_amount);

        bounty.status = BountyStatus::Approved;
        bounty.approved_submission_id = Some(submission_id);
        bounties.set(bounty_id, bounty);
        env.storage().instance().set(&BOUNTIES, &bounties);
    }

    pub fn reclaim_expired(
        env: Env,
        bounty_id: u64,
        sponsor: Address,
    ) {
        sponsor.require_auth();

        let mut bounties: Map<u64, Bounty> = env.storage().instance().get(&BOUNTIES)
            .unwrap_or_else(|| panic!("{}", Error::BountyNotFound));

        let mut bounty = bounties.get(bounty_id).unwrap_or_else(|| panic!("{}", Error::BountyNotFound));

        if bounty.sponsor != sponsor {
            panic!("{}", Error::NotAuthorized);
        }

        if bounty.status != BountyStatus::Open {
            panic!("{}", Error::BountyNotOpen);
        }

        let current_time = env.ledger().timestamp();
        let dispute_window = 7 * 24 * 60 * 60; // 7 days in seconds

        if current_time <= bounty.deadline + dispute_window {
            panic!("{}", Error::DeadlineNotReached);
        }

        // Refund tokens to the sponsor
        let token_client = token::Client::new(&env, &bounty.token_address);
        let contract_address = env.current_contract_address();
        token_client.transfer(&contract_address, &bounty.sponsor, &bounty.reward_amount);

        bounty.status = BountyStatus::Reclaimed;
        bounties.set(bounty_id, bounty);
        env.storage().instance().set(&BOUNTIES, &bounties);
    }

    pub fn get_bounty(env: Env, bounty_id: u64) -> Bounty {
        let bounties: Map<u64, Bounty> = env.storage().instance().get(&BOUNTIES)
            .unwrap_or_else(|| panic!("{}", Error::BountyNotFound));

        bounties.get(bounty_id).unwrap_or_else(|| panic!("{}", Error::BountyNotFound))
    }

    pub fn get_submissions(env: Env, bounty_id: u64) -> Vec<Submission> {
        let bounty_submissions: Vec<u64> = env.storage().instance().get(&BOUNTY_SUBMISSIONS)
            .unwrap_or_else(|| Vec::new(&env));

        let submissions: Map<u64, Submission> = env.storage().instance().get(&SUBMISSIONS)
            .unwrap_or(Map::new(&env));

        let result = Vec::new(&env);
        for submission_id in bounty_submissions.iter() {
            if let Some(submission) = submissions.get(submission_id) {
                if submission.bounty_id == bounty_id {
                    result.push_back(submission);
                }
            }
        }
        result
    }

    pub fn get_all_bounties(env: Env) -> Vec<Bounty> {
        let bounties: Map<u64, Bounty> = env.storage().instance().get(&BOUNTIES)
            .unwrap_or(Map::new(&env));

        let result = Vec::new(&env);
        for (_, bounty) in bounties.iter() {
            result.push_back(bounty);
        }
        result
    }
}

#[cfg(test)]
mod test;
