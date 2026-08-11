import { Contract, TransactionBuilder, Address as StellarAddress, ScInt, nativeToScVal, scValToNative, Server, Horizon } from "@stellar/stellar-sdk";
import { signTransaction } from "./useWallet";

// Contract configuration - update these after deployment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE";
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
const HORIZON_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://horizon-testnet.stellar.org";

// Initialize Stellar server
const server = new Server(HORIZON_URL);

export interface Bounty {
  id: number;
  sponsor: string;
  title: string;
  token_address: string;
  reward_amount: bigint;
  deadline: number;
  created_at: number;
  status: "Open" | "Approved" | "Reclaimed";
  approved_submission_id: number | null;
}

export interface Submission {
  id: number;
  bounty_id: number;
  contributor: string;
  proof_link: string;
  submitted_at: number;
}

export interface CreateBountyParams {
  title: string;
  token_address: string;
  reward_amount: string;
  deadline: number;
}

export interface SubmitWorkParams {
  bounty_id: number;
  proof_link: string;
}

export interface ApproveSubmissionParams {
  bounty_id: number;
  submission_id: number;
}

export interface ReclaimExpiredParams {
  bounty_id: number;
}

export async function createBounty(
  userAddress: string,
  params: CreateBountyParams
): Promise<string> {
  try {
    if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
      throw new Error("Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.");
    }

    const contract = new Contract(CONTRACT_ADDRESS);
    
    // Load account to get sequence number
    const account = await server.loadAccount(userAddress);
    
    const method = contract.call(
      "create_bounty",
      nativeToScVal(new StellarAddress(userAddress).toScVal()),
      nativeToScVal(params.title),
      nativeToScVal(new StellarAddress(params.token_address).toScVal()),
      nativeToScVal(new ScInt(params.reward_amount, { type: "i128" }).toScVal()),
      nativeToScVal(new ScInt(params.deadline, { type: "u64" }).toScVal())
    );

    const transaction = new TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const signedXDR = await signTransaction(transaction.toXDR());
    
    // Submit the transaction to the network
    const result = await server.submitTransaction(signedXDR);
    
    return result.hash;
  } catch (error) {
    console.error("Error creating bounty:", error);
    if (error instanceof Error && error.message.includes("Contract address not configured")) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Failed to create bounty");
  }
}

export async function submitWork(
  userAddress: string,
  params: SubmitWorkParams
): Promise<string> {
  try {
    if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
      throw new Error("Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.");
    }

    const contract = new Contract(CONTRACT_ADDRESS);
    const account = await server.loadAccount(userAddress);

    const method = contract.call(
      "submit_work",
      nativeToScVal(new ScInt(params.bounty_id, { type: "u64" }).toScVal()),
      nativeToScVal(new StellarAddress(userAddress).toScVal()),
      nativeToScVal(params.proof_link)
    );

    const transaction = new TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const signedXDR = await signTransaction(transaction.toXDR());
    const result = await server.submitTransaction(signedXDR);
    
    return result.hash;
  } catch (error) {
    console.error("Error submitting work:", error);
    if (error instanceof Error && error.message.includes("Contract address not configured")) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Failed to submit work");
  }
}

export async function approveSubmission(
  userAddress: string,
  params: ApproveSubmissionParams
): Promise<string> {
  try {
    if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
      throw new Error("Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.");
    }

    const contract = new Contract(CONTRACT_ADDRESS);
    const account = await server.loadAccount(userAddress);

    const method = contract.call(
      "approve_submission",
      nativeToScVal(new ScInt(params.bounty_id, { type: "u64" }).toScVal()),
      nativeToScVal(new ScInt(params.submission_id, { type: "u64" }).toScVal()),
      nativeToScVal(new StellarAddress(userAddress).toScVal())
    );

    const transaction = new TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const signedXDR = await signTransaction(transaction.toXDR());
    const result = await server.submitTransaction(signedXDR);
    
    return result.hash;
  } catch (error) {
    console.error("Error approving submission:", error);
    if (error instanceof Error && error.message.includes("Contract address not configured")) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Failed to approve submission");
  }
}

export async function reclaimExpired(
  userAddress: string,
  params: ReclaimExpiredParams
): Promise<string> {
  try {
    if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
      throw new Error("Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.");
    }

    const contract = new Contract(CONTRACT_ADDRESS);
    const account = await server.loadAccount(userAddress);

    const method = contract.call(
      "reclaim_expired",
      nativeToScVal(new ScInt(params.bounty_id, { type: "u64" }).toScVal()),
      nativeToScVal(new StellarAddress(userAddress).toScVal())
    );

    const transaction = new TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const signedXDR = await signTransaction(transaction.toXDR());
    const result = await server.submitTransaction(signedXDR);
    
    return result.hash;
  } catch (error) {
    console.error("Error reclaiming expired funds:", error);
    if (error instanceof Error && error.message.includes("Contract address not configured")) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Failed to reclaim expired funds");
  }
}

export async function getBounty(bountyId: number): Promise<Bounty> {
  try {
    if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
      throw new Error("Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.");
    }

    const contract = new Contract(CONTRACT_ADDRESS);
    const method = contract.call(
      "get_bounty",
      nativeToScVal(new ScInt(bountyId, { type: "u64" }).toScVal())
    );

    // Simulate the transaction to get the result
    const account = await server.loadAccount(CONTRACT_ADDRESS);
    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const result = await server.simulateTransaction(transaction);
    
    if (result.result && result.result.scval) {
      const bountyData = scValToNative(result.result.scval);
      return {
        id: bountyData.id as number,
        sponsor: bountyData.sponsor as string,
        title: bountyData.title as string,
        token_address: bountyData.token_address as string,
        reward_amount: BigInt(bountyData.reward_amount),
        deadline: bountyData.deadline as number,
        created_at: bountyData.created_at as number,
        status: bountyData.status as "Open" | "Approved" | "Reclaimed",
        approved_submission_id: bountyData.approved_submission_id as number | null,
      };
    }
    
    throw new Error("Failed to parse bounty data");
  } catch (error) {
    console.error("Error fetching bounty:", error);
    if (error instanceof Error && error.message.includes("Contract address not configured")) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Failed to fetch bounty");
  }
}

export async function getSubmissions(bountyId: number): Promise<Submission[]> {
  try {
    if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
      throw new Error("Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.");
    }

    const contract = new Contract(CONTRACT_ADDRESS);
    const method = contract.call(
      "get_submissions",
      nativeToScVal(new ScInt(bountyId, { type: "u64" }).toScVal())
    );

    const account = await server.loadAccount(CONTRACT_ADDRESS);
    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const result = await server.simulateTransaction(transaction);
    
    if (result.result && result.result.scval) {
      const submissionsData = scValToNative(result.result.scval) as any[];
      return submissionsData.map(sub => ({
        id: sub.id as number,
        bounty_id: sub.bounty_id as number,
        contributor: sub.contributor as string,
        proof_link: sub.proof_link as string,
        submitted_at: sub.submitted_at as number,
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching submissions:", error);
    if (error instanceof Error && error.message.includes("Contract address not configured")) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Failed to fetch submissions");
  }
}

export async function getAllBounties(): Promise<Bounty[]> {
  try {
    if (CONTRACT_ADDRESS === "YOUR_CONTRACT_ADDRESS_HERE") {
      throw new Error("Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your environment variables.");
    }

    const contract = new Contract(CONTRACT_ADDRESS);
    const method = contract.call("get_all_bounties");

    const account = await server.loadAccount(CONTRACT_ADDRESS);
    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const result = await server.simulateTransaction(transaction);
    
    if (result.result && result.result.scval) {
      const bountiesData = scValToNative(result.result.scval) as any[];
      return bountiesData.map(bounty => ({
        id: bounty.id as number,
        sponsor: bounty.sponsor as string,
        title: bounty.title as string,
        token_address: bounty.token_address as string,
        reward_amount: BigInt(bounty.reward_amount),
        deadline: bounty.deadline as number,
        created_at: bounty.created_at as number,
        status: bounty.status as "Open" | "Approved" | "Reclaimed",
        approved_submission_id: bounty.approved_submission_id as number | null,
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching all bounties:", error);
    if (error instanceof Error && error.message.includes("Contract address not configured")) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Failed to fetch all bounties");
  }
}
