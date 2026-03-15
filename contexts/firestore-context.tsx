"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import type { UserProfile, Scenario, Simulation, Factor, Outcome } from "@/lib/types/firestore";
import * as firestoreService from "@/lib/firestore-service";

// Tier limits
const FREE_TIER_LIMITS = {
  maxScenarios: 2,
  maxSimulationsPerScenario: 1,
};

const PRO_TIER_LIMITS = {
  maxScenarios: Infinity,
  maxSimulationsPerScenario: Infinity,
};

interface FirestoreContextType {
  // User
  userProfile: UserProfile | null;
  userPlan: "free" | "pro";
  paidScenarioCredits: number;

  // Tier limits
  freeTierLimits: typeof FREE_TIER_LIMITS;
  canCreateScenario: () => boolean;
  canCreateSimulation: () => boolean;
  getRemainingScenarios: () => number;
  getRemainingSimulations: () => number;
  consumeScenarioCredit: () => Promise<void>;

  // Scenarios
  scenarios: Scenario[];
  selectedScenario: Scenario | null;
  selectScenario: (scenarioId: string) => void;
  createScenario: (title: string, description: string, icon: string, skillId?: string) => Promise<string>;
  deleteScenario: (scenarioId: string) => Promise<void>;

  // Simulations
  simulations: Simulation[];
  selectedSimulation: Simulation | null;
  selectSimulation: (simulationId: string | null) => void;
  createSimulation: (data: {
    title: string;
    status: "optimal" | "moderate" | "risk";
    factors: Factor[];
    outcomes: Outcome[];
    inputSummary: { label: string; value: string }[];
    outcomeSummary: { label: string; value: string; trend: "positive" | "negative" | "neutral" };
    recommendation?: string;
  }, scenarioId?: string) => Promise<string>;
  updateSimulation: (simulationId: string, data: {
    title?: string;
    status?: "optimal" | "moderate" | "risk";
    factors?: Factor[];
    outcomes?: Outcome[];
    inputSummary?: { label: string; value: string }[];
    outcomeSummary?: { label: string; value: string; trend: "positive" | "negative" | "neutral" };
    recommendation?: string;
  }) => Promise<void>;
  deleteSimulation: (simulationId: string) => Promise<void>;

  // Loading states
  loading: boolean;
  scenariosLoading: boolean;
  simulationsLoading: boolean;

  // Error handling
  error: string | null;
  clearError: () => void;

  // Refresh functions
  refreshUserProfile: () => Promise<void>;
  refreshScenarios: () => Promise<void>;
  refreshSimulations: () => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType | null>(null);

interface FirestoreProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export function FirestoreProvider({ children, user }: FirestoreProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);

  const [loading, setLoading] = useState(true);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [simulationsLoading, setSimulationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user profile and scenarios on auth
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setScenarios([]);
      setSimulations([]);
      setSelectedScenario(null);
      setSelectedSimulation(null);
      setLoading(false);
      return;
    }

    const initializeUserData = async () => {
      try {
        setLoading(true);

        // Create or get user profile
        const profile = await firestoreService.createUserProfileIfNotExists(user.uid, {
          email: user.email || "",
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        setUserProfile(profile);

        // Seed default scenarios if needed and load them
        await firestoreService.seedDefaultScenarios(user.uid);
        const userScenarios = await firestoreService.getUserScenarios(user.uid);
        setScenarios(userScenarios);

        // Auto-select first scenario
        if (userScenarios.length > 0) {
          setSelectedScenario(userScenarios[0]);
        }
      } catch (err) {
        console.error("Error initializing user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    initializeUserData();
  }, [user]);

  // Load simulations when scenario changes
  useEffect(() => {
    if (!user || !selectedScenario) {
      setSimulations([]);
      return;
    }

    const loadSimulations = async () => {
      try {
        setSimulationsLoading(true);
        const scenarioSimulations = await firestoreService.getScenarioSimulations(
          user.uid,
          selectedScenario.id
        );
        setSimulations(scenarioSimulations);
      } catch (err) {
        console.error("Error loading simulations:", err);
        setError("Failed to load simulations");
      } finally {
        setSimulationsLoading(false);
      }
    };

    loadSimulations();
  }, [user, selectedScenario]);

  // Scenario operations
  const selectScenario = useCallback(
    (scenarioId: string) => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      setSelectedScenario(scenario || null);
      setSelectedSimulation(null);
    },
    [scenarios]
  );

  const createScenarioHandler = useCallback(
    async (title: string, description: string, icon: string, skillId?: string): Promise<string> => {
      if (!user) throw new Error("Not authenticated");

      const id = await firestoreService.createScenario(user.uid, {
        userId: user.uid,
        title,
        description,
        icon,
        ...(skillId && { skillId }),
      });

      // Refresh scenarios list
      const updated = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updated);

      // Select the new scenario
      const newScenario = updated.find((s) => s.id === id);
      if (newScenario) {
        setSelectedScenario(newScenario);
      }

      return id;
    },
    [user]
  );

  const deleteScenarioHandler = useCallback(
    async (scenarioId: string): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      await firestoreService.deleteScenario(user.uid, scenarioId);

      // Refresh scenarios list
      const updated = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updated);

      // Clear selection if deleted
      if (selectedScenario?.id === scenarioId) {
        setSelectedScenario(updated[0] || null);
      }
    },
    [user, selectedScenario]
  );

  // Simulation operations
  const selectSimulationHandler = useCallback(
    (simulationId: string | null) => {
      if (!simulationId) {
        setSelectedSimulation(null);
        return;
      }
      const simulation = simulations.find((s) => s.id === simulationId);
      setSelectedSimulation(simulation || null);
    },
    [simulations]
  );

  const createSimulationHandler = useCallback(
    async (data: {
      title: string;
      status: "optimal" | "moderate" | "risk";
      factors: Factor[];
      outcomes: Outcome[];
      inputSummary: { label: string; value: string }[];
      outcomeSummary: { label: string; value: string; trend: "positive" | "negative" | "neutral" };
      recommendation?: string;
    }, scenarioId?: string): Promise<string> => {
      // Use provided scenarioId or fall back to selectedScenario
      const targetScenarioId = scenarioId || selectedScenario?.id;
      if (!user || !targetScenarioId) throw new Error("Not authenticated or no scenario selected");

      const id = await firestoreService.createSimulation(user.uid, targetScenarioId, {
        ...data,
        userId: user.uid,
        scenarioId: targetScenarioId,
      });

      // Refresh simulations for the target scenario
      const updated = await firestoreService.getScenarioSimulations(user.uid, targetScenarioId);
      setSimulations(updated);

      // Update scenario simulation count
      const updatedScenarios = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updatedScenarios);

      // Update selected scenario with new count if it matches
      const refreshedScenario = updatedScenarios.find((s) => s.id === targetScenarioId);
      if (refreshedScenario) {
        setSelectedScenario(refreshedScenario);
      }

      return id;
    },
    [user, selectedScenario]
  );

  const updateSimulationHandler = useCallback(
    async (simulationId: string, data: {
      title?: string;
      status?: "optimal" | "moderate" | "risk";
      factors?: Factor[];
      outcomes?: Outcome[];
      inputSummary?: { label: string; value: string }[];
      outcomeSummary?: { label: string; value: string; trend: "positive" | "negative" | "neutral" };
    }): Promise<void> => {
      if (!user || !selectedScenario) throw new Error("Not authenticated or no scenario selected");

      await firestoreService.updateSimulation(user.uid, selectedScenario.id, simulationId, data);

      // Refresh simulations
      const updated = await firestoreService.getScenarioSimulations(user.uid, selectedScenario.id);
      setSimulations(updated);
    },
    [user, selectedScenario]
  );

  const deleteSimulationHandler = useCallback(
    async (simulationId: string): Promise<void> => {
      if (!user || !selectedScenario) throw new Error("Not authenticated or no scenario selected");

      await firestoreService.deleteSimulation(user.uid, selectedScenario.id, simulationId);

      // Refresh simulations
      const updated = await firestoreService.getScenarioSimulations(user.uid, selectedScenario.id);
      setSimulations(updated);

      // Update scenario simulation count
      const updatedScenarios = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updatedScenarios);

      // Update selected scenario with new count
      const refreshedScenario = updatedScenarios.find((s) => s.id === selectedScenario.id);
      if (refreshedScenario) {
        setSelectedScenario(refreshedScenario);
      }

      // Clear selection if deleted
      if (selectedSimulation?.id === simulationId) {
        setSelectedSimulation(null);
      }
    },
    [user, selectedScenario, selectedSimulation]
  );

  // Refresh functions
  const refreshScenarios = useCallback(async () => {
    if (!user) return;
    setScenariosLoading(true);
    try {
      const updated = await firestoreService.getUserScenarios(user.uid);
      setScenarios(updated);
    } finally {
      setScenariosLoading(false);
    }
  }, [user]);

  const refreshSimulations = useCallback(async () => {
    if (!user || !selectedScenario) return;
    setSimulationsLoading(true);
    try {
      const updated = await firestoreService.getScenarioSimulations(user.uid, selectedScenario.id);
      setSimulations(updated);
    } finally {
      setSimulationsLoading(false);
    }
  }, [user, selectedScenario]);

  const clearError = useCallback(() => setError(null), []);

  // Subscription helpers
  const userPlan = userProfile?.subscriptionTier === "pro" && userProfile?.subscriptionStatus === "active"
    ? "pro" as const
    : "free" as const;

  const paidScenarioCredits = userProfile?.paidScenarioCredits ?? 0;

  const effectiveLimits = userPlan === "pro" ? PRO_TIER_LIMITS : FREE_TIER_LIMITS;

  const canCreateScenario = useCallback(() => {
    if (userPlan === "pro") return true;
    // Free users: base limit + paid credits
    return scenarios.length < FREE_TIER_LIMITS.maxScenarios + paidScenarioCredits;
  }, [scenarios.length, userPlan, paidScenarioCredits]);

  const canCreateSimulation = useCallback(() => {
    if (!selectedScenario) return false;
    if (userPlan === "pro") return true;
    return simulations.length < FREE_TIER_LIMITS.maxSimulationsPerScenario;
  }, [selectedScenario, simulations.length, userPlan]);

  const getRemainingScenarios = useCallback(() => {
    if (userPlan === "pro") return Infinity;
    return Math.max(0, (FREE_TIER_LIMITS.maxScenarios + paidScenarioCredits) - scenarios.length);
  }, [scenarios.length, userPlan, paidScenarioCredits]);

  const getRemainingSimulations = useCallback(() => {
    if (userPlan === "pro") return Infinity;
    return Math.max(0, FREE_TIER_LIMITS.maxSimulationsPerScenario - simulations.length);
  }, [simulations.length, userPlan]);

  const refreshUserProfile = useCallback(async () => {
    if (!user) return;
    const profile = await firestoreService.getUserProfile(user.uid);
    if (profile) setUserProfile(profile);
  }, [user]);

  const consumeScenarioCredit = useCallback(async () => {
    if (!user) throw new Error("Not authenticated");
    await firestoreService.consumeScenarioCredit(user.uid);
    // Refresh user profile to get updated credits
    const profile = await firestoreService.getUserProfile(user.uid);
    if (profile) setUserProfile(profile);
  }, [user]);

  const value: FirestoreContextType = {
    userProfile,
    userPlan,
    paidScenarioCredits,
    freeTierLimits: FREE_TIER_LIMITS,
    canCreateScenario,
    canCreateSimulation,
    getRemainingScenarios,
    getRemainingSimulations,
    consumeScenarioCredit,
    scenarios,
    selectedScenario,
    selectScenario,
    createScenario: createScenarioHandler,
    deleteScenario: deleteScenarioHandler,
    simulations,
    selectedSimulation,
    selectSimulation: selectSimulationHandler,
    createSimulation: createSimulationHandler,
    updateSimulation: updateSimulationHandler,
    deleteSimulation: deleteSimulationHandler,
    loading,
    scenariosLoading,
    simulationsLoading,
    error,
    clearError,
    refreshUserProfile,
    refreshScenarios,
    refreshSimulations,
  };

  return <FirestoreContext.Provider value={value}>{children}</FirestoreContext.Provider>;
}

export function useFirestore() {
  const context = useContext(FirestoreContext);
  if (!context) {
    throw new Error("useFirestore must be used within a FirestoreProvider");
  }
  return context;
}
