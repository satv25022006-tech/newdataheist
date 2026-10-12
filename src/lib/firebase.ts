import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  collection,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CaseItem, Question, FinalSubmission } from '../types';

// Initialize Firebase SDK
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection verification test
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection verified successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration or internet connection.');
    }
  }
}

testFirestoreConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

class FirebaseManager {
  /**
   * Persists a player's final submission directly into Firestore 'submissions' collection
   */
  public async insertSubmission(submission: FinalSubmission): Promise<{
    success: boolean;
    error?: string;
  }> {
    const path = `submissions/${submission.id}`;
    try {
      const docRef = doc(db, 'submissions', submission.id);
      await setDoc(docRef, {
        ...submission,
        submittedAt: submission.submittedAt || new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      console.warn('Firestore submission insert notice:', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch (e: any) {
        return { success: false, error: e?.message || 'Firestore write error' };
      }
      return { success: false, error: String(err) };
    }
  }

  /**
   * Syncs cases, questions, and submissions into Firestore
   */
  public async syncDataToFirebase(
    cases: CaseItem[],
    questions: Question[],
    submissions: FinalSubmission[]
  ): Promise<{
    success: boolean;
    syncedCases: number;
    syncedQuestions: number;
    syncedSubmissions: number;
    message: string;
  }> {
    try {
      // 1. Write Cases
      for (const c of cases) {
        await setDoc(doc(db, 'cases', c.id), c, { merge: true });
      }

      // 2. Write Questions
      for (const q of questions) {
        await setDoc(doc(db, 'questions', q.id), q, { merge: true });
      }

      // 3. Write Submissions
      for (const s of submissions) {
        await setDoc(doc(db, 'submissions', s.id), s, { merge: true });
      }

      return {
        success: true,
        syncedCases: cases.length,
        syncedQuestions: questions.length,
        syncedSubmissions: submissions.length,
        message: `Successfully synced ${cases.length} cases, ${questions.length} questions, and ${submissions.length} submissions to Firebase Firestore!`,
      };
    } catch (err) {
      console.error('Firebase sync error:', err);
      return {
        success: false,
        syncedCases: 0,
        syncedQuestions: 0,
        syncedSubmissions: 0,
        message: `Firebase sync failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  /**
   * Fetches all submissions from Firestore
   */
  public async fetchSubmissions(): Promise<FinalSubmission[]> {
    const path = 'submissions';
    try {
      const querySnapshot = await getDocs(collection(db, 'submissions'));
      const list: FinalSubmission[] = [];
      querySnapshot.forEach((d) => {
        list.push(d.data() as FinalSubmission);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  /**
   * Fetches all cases from Firestore
   */
  public async fetchCases(): Promise<CaseItem[]> {
    const path = 'cases';
    try {
      const querySnapshot = await getDocs(collection(db, 'cases'));
      const list: CaseItem[] = [];
      querySnapshot.forEach((d) => {
        list.push(d.data() as CaseItem);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
      return [];
    }
  }

  /**
   * Clears all cases, questions, and submissions from Firestore
   */
  public async clearFirestoreCollections(): Promise<{ success: boolean; message: string }> {
    try {
      const collectionsToPurge = ['cases', 'questions', 'submissions'];
      for (const colName of collectionsToPurge) {
        const snapshot = await getDocs(collection(db, colName));
        for (const d of snapshot.docs) {
          await deleteDoc(doc(db, colName, d.id));
        }
      }
      return { success: true, message: 'All Cloud Firestore collections cleared completely.' };
    } catch (err: any) {
      console.warn('Error clearing Firestore collections:', err);
      return { success: false, message: err?.message || 'Failed to clear Firestore collections.' };
    }
  }
}

export const firebaseManager = new FirebaseManager();

export async function saveSubmissionToFirebase(submission: FinalSubmission) {
  return firebaseManager.insertSubmission(submission);
}

export async function saveCaseToFirebase(caseItem: CaseItem) {
  try {
    await setDoc(doc(db, 'cases', caseItem.id), caseItem, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn('Error saving case to Firebase:', err);
    return { success: false, error: String(err) };
  }
}

export async function deleteCaseFromFirebase(caseId: string) {
  try {
    await deleteDoc(doc(db, 'cases', caseId));
    return { success: true };
  } catch (err) {
    console.warn('Error deleting case from Firebase:', err);
    return { success: false, error: String(err) };
  }
}

export async function saveQuestionToFirebase(question: Question) {
  try {
    await setDoc(doc(db, 'questions', question.id), question, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn('Error saving question to Firebase:', err);
    return { success: false, error: String(err) };
  }
}

export async function saveBrandingToFirebase(bureauName: string, logoUrl?: string) {
  try {
    await setDoc(doc(db, 'settings', 'branding'), { bureauName, logoUrl, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn('Error saving branding to Firebase:', err);
    return { success: false, error: String(err) };
  }
}

