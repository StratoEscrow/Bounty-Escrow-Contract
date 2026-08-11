"use client";

import { useState, useEffect } from "react";
import { Bounty, Submission, submitWork, approveSubmission, reclaimExpired, getAllBounties, getSubmissions } from "@/lib/contract";
import { useWallet } from "@/lib/useWallet";

interface BountyListProps {
  userAddress: string | null;
}

export function BountyList({ userAddress }: BountyListProps) {
  const { address } = useWallet();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [filteredBounties, setFilteredBounties] = useState<Bounty[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [proofLink, setProofLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Approved" | "Reclaimed">("All");

  useEffect(() => {
    fetchBounties();
  }, []);

  useEffect(() => {
    filterBounties();
  }, [bounties, searchTerm, statusFilter]);

  const filterBounties = () => {
    let filtered = bounties;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(bounty =>
        bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bounty.id.toString().includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(bounty => bounty.status === statusFilter);
    }

    setFilteredBounties(filtered);
  };

  const fetchBounties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allBounties = await getAllBounties();
      setBounties(allBounties);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load bounties";
      console.error("Error fetching bounties:", err);
      setError(errorMessage);
      // If it's a configuration error, show a helpful message
      if (errorMessage.includes("Contract address not configured")) {
        setError("Please configure the contract address in your environment variables to load bounties.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (bountyId: number) => {
    try {
      setError(null);
      const bountySubmissions = await getSubmissions(bountyId);
      setSubmissions(bountySubmissions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load submissions";
      console.error("Error fetching submissions:", err);
      setError(errorMessage);
      // If it's a configuration error, show a helpful message
      if (errorMessage.includes("Contract address not configured")) {
        setError("Please configure the contract address in your environment variables to load submissions.");
      }
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

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

    // Validate URL format
    try {
      new URL(proofLink);
    } catch {
      setError("Please provide a valid URL for the proof link");
      return;
    }

    try {
      setIsSubmitting(true);
      const txHash = await submitWork(address, {
        bounty_id: bountyId,
        proof_link: proofLink,
      });

      console.log("Transaction submitted:", txHash);
      showSuccess(`Work submitted successfully! Transaction hash: ${txHash}`);
      setProofLink("");
      // Refresh submissions
      await fetchSubmissions(bountyId);
      // Refresh bounties to update submission count
      await fetchBounties();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit work";
      setError(errorMessage);
      console.error("Work submission error:", err);
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
      const txHash = await approveSubmission(address, {
        bounty_id: bountyId,
        submission_id: submissionId,
      });

      console.log("Transaction submitted:", txHash);
      showSuccess(`Submission approved successfully! Transaction hash: ${txHash}`);
      // Refresh bounties to show updated status
      await fetchBounties();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to approve submission";
      setError(errorMessage);
      console.error("Approval error:", err);
    }
  };

  const handleReclaim = async (bountyId: number) => {
    setError(null);

    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    try {
      const txHash = await reclaimExpired(address, {
        bounty_id: bountyId,
      });

      console.log("Transaction submitted:", txHash);
      showSuccess(`Funds reclaimed successfully! Transaction hash: ${txHash}`);
      // Refresh bounties to show updated status
      await fetchBounties();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reclaim funds";
      setError(errorMessage);
      console.error("Reclaim error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">Loading bounties...</p>
        </div>
      </div>
    );
  }

  if (filteredBounties.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">
          {bounties.length === 0 
            ? "No bounties found. Create one to get started!" 
            : "No bounties match your search criteria."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search bounties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "All" | "Open" | "Approved" | "Reclaimed")}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Approved">Approved</option>
            <option value="Reclaimed">Reclaimed</option>
          </select>
        </div>
        <p className="text-sm text-gray-400">
          Showing {filteredBounties.length} of {bounties.length} bounties
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg animate-pulse">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-2 rounded-lg animate-pulse">
          {successMessage}
        </div>
      )}

      {filteredBounties.map((bounty) => (
        <div key={bounty.id} className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">{bounty.title}</h3>
              <p className="text-gray-400 text-sm mt-1">
                ID: {bounty.id} • Status:{" "}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  bounty.status === "Open" ? "bg-green-900/50 text-green-300" :
                  bounty.status === "Approved" ? "bg-blue-900/50 text-blue-300" :
                  "bg-yellow-900/50 text-yellow-300"
                }`}>
                  {bounty.status}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-green-400">
                {bounty.reward_amount.toString()} tokens
              </p>
              <p className="text-sm text-gray-400">
                Deadline: {new Date(bounty.deadline * 1000).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Created: {new Date(bounty.created_at * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                if (selectedBounty?.id === bounty.id) {
                  setSelectedBounty(null);
                  setSubmissions([]);
                } else {
                  setSelectedBounty(bounty);
                  fetchSubmissions(bounty.id);
                }
              }}
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
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit"
                  )}
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
