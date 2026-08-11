"use client";

import { useState } from "react";
import { Bounty, Submission, submitWork, approveSubmission, reclaimExpired } from "@/lib/contract";
import { useWallet } from "@/lib/useWallet";

interface BountyListProps {
  userAddress: string | null;
}

export function BountyList({ userAddress }: BountyListProps) {
  const { address } = useWallet();
  const [bounties] = useState<Bounty[]>([]); // This would be fetched from the contract
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [submissions] = useState<Submission[]>([]); // This would be fetched from the contract
  const [proofLink, setProofLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitWork = async (e: React.FormEvent | undefined, bountyId: number) => {
    if (e) e.preventDefault();
    setError(null);

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    if (!proofLink) {
      setError("Please provide a proof link");
      return;
    }

    try {
      setIsSubmitting(true);
      const signedXDR = await submitWork(address, {
        bounty_id: bountyId,
        proof_link: proofLink,
      });

      console.log("Signed XDR:", signedXDR);
      alert("Transaction signed! Submit to network (integration needed)");
      setProofLink("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit work");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (bountyId: number, submissionId: number) => {
    setError(null);

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    try {
      const signedXDR = await approveSubmission(address, {
        bounty_id: bountyId,
        submission_id: submissionId,
      });

      console.log("Signed XDR:", signedXDR);
      alert("Transaction signed! Submit to network (integration needed)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve submission");
    }
  };

  const handleReclaim = async (bountyId: number) => {
    setError(null);

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    try {
      const signedXDR = await reclaimExpired(address, {
        bounty_id: bountyId,
      });

      console.log("Signed XDR:", signedXDR);
      alert("Transaction signed! Submit to network (integration needed)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reclaim funds");
    }
  };

  if (bounties.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">No bounties found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {bounties.map((bounty) => (
        <div key={bounty.id} className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">{bounty.title}</h3>
              <p className="text-gray-400 text-sm mt-1">
                ID: {bounty.id} • Status: {bounty.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-400">
                {bounty.reward_amount.toString()} tokens
              </p>
              <p className="text-sm text-gray-400">
                Deadline: {new Date(bounty.deadline * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setSelectedBounty(selectedBounty?.id === bounty.id ? null : bounty)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              {selectedBounty?.id === bounty.id ? "Hide Submissions" : "View Submissions"}
            </button>

            {bounty.status === "Open" && userAddress === bounty.sponsor && (
              <button
                onClick={() => handleReclaim(bounty.id)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Reclaim Funds
              </button>
            )}
          </div>

          {selectedBounty?.id === bounty.id && (
            <div className="mt-6 border-t border-gray-700 pt-4">
              <h4 className="font-semibold mb-3">Submit Work</h4>
              <form onSubmit={(e) => handleSubmitWork(e, bounty.id)} className="flex gap-2">
                <input
                  type="url"
                  value={proofLink}
                  onChange={(e) => setProofLink(e.target.value)}
                  placeholder="https://github.com/your-repo/pull/123"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>

              <h4 className="font-semibold mt-6 mb-3">Submissions</h4>
              {submissions.length === 0 ? (
                <p className="text-gray-400">No submissions yet</p>
              ) : (
                <div className="space-y-2">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-mono text-sm">
                            {submission.contributor.slice(0, 8)}...{submission.contributor.slice(-4)}
                          </p>
                          <a
                            href={submission.proof_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            {submission.proof_link}
                          </a>
                        </div>
                        {bounty.status === "Open" && userAddress === bounty.sponsor && (
                          <button
                            onClick={() => handleApprove(bounty.id, submission.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
