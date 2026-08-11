import { Contract, TransactionBuilder, Address as StellarAddress, ScInt, nativeToScVal, scValToNative } from "@stellar/stellar-sdk";
import { signTransaction } from "./useWallet";

// Contract configuration - update these after deployment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE";
const NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";

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
    const contract = new Contract(CONTRACT_ADDRESS);
    const account = new StellarAddress(userAddress);

    const method = contract.call(
      "create_bounty",
      nativeToScVal(account.toScVal()),
      nativeToScVal(params.title),
      nativeToScVal(new StellarAddress(params.token_address).toScVal()),
      nativeToScVal(new ScInt(params.reward_amount, { type: "i128" }).toScVal()),
      nativeToScVal(new ScInt(params.deadline, { type: "u64" }).toScVal())
    );

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const signedXDR = await signTransaction(transaction.toXDR());
    return signedXDR;
  } catch (error) {
    console.error("Error creating bounty:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create bounty");
  }
}

export async function submitWork(
  userAddress: string,
  params: SubmitWorkParams
): Promise<string> {
  try {
    const contract = new Contract(CONTRACT_ADDRESS);
    const account = new StellarAddress(userAddress);

    const method = contract.call(
      "submit_work",
      nativeToScVal(new ScInt(params.bounty_id, { type: "u64" }).toScVal()),
      nativeToScVal(account.toScVal()),
      nativeToScVal(params.proof_link)
    );

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const signedXDR = await signTransaction(transaction.toXDR());
    return signedXDR;
  } catch (error) {
    console.error("Error submitting work:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to submit work");
  }
}

export async function approveSubmission(
  userAddress: string,
  params: ApproveSubmissionParams
): Promise<string> {
  try {
    const contract = new Contract(CONTRACT_ADDRESS);
    const account = new StellarAddress(userAddress);

    const method = contract.call(
      "approve_submission",
      nativeToScVal(new ScInt(params.bounty_id, { type: "u64" }).toScVal()),
      nativeToScVal(new ScInt(params.submission_id, { type: "u64" }).toScVal()),
      nativeToScVal(account.toScVal())
    );

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const signedXDR = await signTransaction(transaction.toXDR());
    return signedXDR;
  } catch (error) {
    console.error("Error approving submission:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to approve submission");
  }
}

export async function reclaimExpired(
  userAddress: string,
  params: ReclaimExpiredParams
): Promise<string> {
  try {
    const contract = new Contract(CONTRACT_ADDRESS);
    const account = new StellarAddress(userAddress);

    const method = contract.call(
      "reclaim_expired",
      nativeToScVal(new ScInt(params.bounty_id, { type: "u64" }).toScVal()),
      nativeToScVal(account.toScVal())
    );

    const transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(method)
      .setTimeout(30)
      .build();

    const signedXDR = await signTransaction(transaction.toXDR());
    return signedXDR;
  } catch (error) {
    console.error("Error reclaiming expired funds:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to reclaim expired funds");
  }
}

export async function getBounty(bountyId: number): Promise<Bounty> {
  const contract = new Contract(CONTRACT_ADDRESS);
  const method = contract.call(
    "get_bounty",
    ...nativeToScVal(new ScInt(bountyId, { type: "u64" }).toScVal())
  );

  // This would typically be called through a simulated transaction
  // For now, this is a placeholder showing the method structure
  throw new Error("RPC call needed to fetch bounty data");
}

export async function getSubmissions(bountyId: number): Promise<Submission[]> {
  const contract = new Contract(CONTRACT_ADDRESS);
  const method = contract.call(
    "get_submissions",
    ...nativeToScVal(new ScInt(bountyId, { type: "u64" }).toScVal())
  );

  // This would typically be called through a simulated transaction
  // For now, this is a placeholder showing the method structure
  throw new Error("RPC call needed to fetch submissions");
}

export async function getAllBounties(): Promise<Bounty[]> {
  const contract = new Contract(CONTRACT_ADDRESS);
  const method = contract.call("get_all_bounties");

  // This would typically be called through a simulated transaction
  // For now, this is a placeholder showing the method structure
  throw new Error("RPC call needed to fetch all bounties");
}
