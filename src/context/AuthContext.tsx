"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { isAllowedAdminEmail } from "@/lib/adminConfig";

interface UserProfile {
  name: string;
  email: string;
  role?: "user" | "organization" | "admin";
  bio?: string;
  education?: string;
  skills?: string[];
  interests?: string[];
  location?: string;
  category?: string;
  income?: string;
  createdAt?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile(uid?: string) {
    const activeUid = uid || currentUser?.uid;
    if (!activeUid) return;

    try {
      const snap = await getDoc(doc(db, "users", activeUid));
      if (snap.exists()) {
        const data = snap.data() as UserProfile;

        // Self-heal: if this email is on the hardcoded admin allowlist but
        // the stored role doesn't say "admin" yet (e.g. they signed up
        // before being whitelisted), promote them now. Firestore rules are
        // the real enforcement layer — this just keeps the UI in sync.
        if (isAllowedAdminEmail(data.email) && data.role !== "admin") {
          await updateDoc(doc(db, "users", activeUid), { role: "admin" });
          data.role = "admin";
        }

        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }

  async function signup(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    
    const initialProfile: UserProfile = {
      name,
      email,
      role: isAllowedAdminEmail(email) ? "admin" : "user",
      bio: "",
      education: "",
      skills: [],
      interests: [],
      location: "",
      category: "",
      income: "",
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, "users", cred.user.uid), initialProfile);
    setProfile(initialProfile);
    return cred;
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    
    // Check if doc exists, otherwise create it
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) {
      const initialProfile: UserProfile = {
        name: cred.user.displayName || "User",
        email: cred.user.email || "",
        role: isAllowedAdminEmail(cred.user.email) ? "admin" : "user",
        bio: "",
        education: "",
        skills: [],
        interests: [],
        location: "",
        category: "",
        income: "",
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", cred.user.uid), initialProfile);
      setProfile(initialProfile);
    } else {
      const data = snap.data() as UserProfile;
      if (isAllowedAdminEmail(data.email) && data.role !== "admin") {
        await updateDoc(doc(db, "users", cred.user.uid), { role: "admin" });
        data.role = "admin";
      }
      setProfile(data);
    }
    return cred;
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!currentUser) throw new Error("No authenticated user");
    await updateDoc(doc(db, "users", currentUser.uid), data);
    await refreshProfile(currentUser.uid);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await refreshProfile(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [currentUser?.uid]);

  const value = {
    currentUser,
    profile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
