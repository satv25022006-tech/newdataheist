# Security Specification for Code Heist Firebase Firestore

## Data Invariants
1. Cases can be viewed publicly if published or accessed by authenticated users.
2. Questions can be read publicly by participants to conduct investigations.
3. Submissions can be written by any participant and read for leaderboard and admin audit.
4. Branding config can be read publicly and updated by admins.

## The "Dirty Dozen" Payloads (Invariants Verification)
1. Unauthenticated user trying to modify case rules.
2. Malformed submission with string totalScoreEarned.
3. Submission missing submissionRef.
4. Payload trying to wipe out submission records.
5. Malicious user injecting 1MB payload into feedback comments.
6. Spoofed submission record altering another user's submissionRef.
7. Unauthenticated user attempting to alter branding configuration with junk strings.
8. Injection of unrecognized fields into Case entity.
9. Invalid option label in Question creation.
10. Submission payload with negative completion accuracy.
11. Malformed case entity missing mandatory title.
12. Attempt to write to arbitrary unmapped collection path.
