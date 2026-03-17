import {
    collection,
    collectionGroup,
    doc,
    addDoc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    increment,
    writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
    UserProfile,
    Scenario,
    Simulation,
    Payment,
    CreateUserProfile,
    CreateScenario,
    UpdateScenario,
    CreateSimulation,
    UpdateSimulation,
    SubscriptionTier,
    SubscriptionStatus,
} from "./types/firestore";

// ============ Collection References ============

const getUserRef = (userId: string) => doc(db, "users", userId);
const getScenariosRef = (userId: string) => collection(db, "users", userId, "scenarios");
const getScenarioRef = (userId: string, scenarioId: string) =>
    doc(db, "users", userId, "scenarios", scenarioId);
const getSimulationsRef = (userId: string, scenarioId: string) =>
    collection(db, "users", userId, "scenarios", scenarioId, "simulations");
const getSimulationRef = (userId: string, scenarioId: string, simulationId: string) =>
    doc(db, "users", userId, "scenarios", scenarioId, "simulations", simulationId);

// ============ User Profile Operations ============

export const createUserProfile = async (
    userId: string,
    data: CreateUserProfile
): Promise<void> => {
    const userRef = getUserRef(userId);
    await setDoc(userRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const userRef = getUserRef(userId);
    const snapshot = await getDoc(userRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as UserProfile;
};

export const updateUserProfile = async (
    userId: string,
    data: Partial<CreateUserProfile>
): Promise<void> => {
    const userRef = getUserRef(userId);
    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

export const createUserProfileIfNotExists = async (
    userId: string,
    data: CreateUserProfile
): Promise<UserProfile> => {
    const existing = await getUserProfile(userId);
    if (existing) return existing;
    await createUserProfile(userId, data);
    return (await getUserProfile(userId))!;
};

// ============ Scenario Operations ============

export const createScenario = async (
    userId: string,
    data: CreateScenario
): Promise<string> => {
    const scenariosRef = getScenariosRef(userId);
    const docRef = await addDoc(scenariosRef, {
        ...data,
        userId,
        simulationCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getScenario = async (
    userId: string,
    scenarioId: string
): Promise<Scenario | null> => {
    const scenarioRef = getScenarioRef(userId, scenarioId);
    const snapshot = await getDoc(scenarioRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Scenario;
};

export const getUserScenarios = async (userId: string): Promise<Scenario[]> => {
    const scenariosRef = getScenariosRef(userId);
    const q = query(scenariosRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Scenario));
};

export const updateScenario = async (
    userId: string,
    scenarioId: string,
    data: UpdateScenario
): Promise<void> => {
    const scenarioRef = getScenarioRef(userId, scenarioId);
    await updateDoc(scenarioRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

export const deleteScenario = async (
    userId: string,
    scenarioId: string
): Promise<void> => {
    const simulationsRef = getSimulationsRef(userId, scenarioId);
    const simulationsSnapshot = await getDocs(simulationsRef);

    const batch = writeBatch(db);
    simulationsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    const scenarioRef = getScenarioRef(userId, scenarioId);
    batch.delete(scenarioRef);

    await batch.commit();
};

// ============ Simulation Operations ============

export const createSimulation = async (
    userId: string,
    scenarioId: string,
    data: CreateSimulation
): Promise<string> => {
    const simulationsRef = getSimulationsRef(userId, scenarioId);
    const scenarioRef = getScenarioRef(userId, scenarioId);

    const docRef = await addDoc(simulationsRef, {
        ...data,
        userId,
        scenarioId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await updateDoc(scenarioRef, {
        simulationCount: increment(1),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
};

export const getSimulation = async (
    userId: string,
    scenarioId: string,
    simulationId: string
): Promise<Simulation | null> => {
    const simulationRef = getSimulationRef(userId, scenarioId, simulationId);
    const snapshot = await getDoc(simulationRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Simulation;
};

export const getScenarioSimulations = async (
    userId: string,
    scenarioId: string
): Promise<Simulation[]> => {
    const simulationsRef = getSimulationsRef(userId, scenarioId);
    const q = query(simulationsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Simulation));
};

export const updateSimulation = async (
    userId: string,
    scenarioId: string,
    simulationId: string,
    data: UpdateSimulation
): Promise<void> => {
    const simulationRef = getSimulationRef(userId, scenarioId, simulationId);
    await updateDoc(simulationRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

export const deleteSimulation = async (
    userId: string,
    scenarioId: string,
    simulationId: string
): Promise<void> => {
    const simulationRef = getSimulationRef(userId, scenarioId, simulationId);
    const scenarioRef = getScenarioRef(userId, scenarioId);

    await deleteDoc(simulationRef);

    await updateDoc(scenarioRef, {
        simulationCount: increment(-1),
        updatedAt: serverTimestamp(),
    });
};

// ============ Payment Operations ============

const getPaymentsRef = (userId: string) => collection(db, "users", userId, "payments");

export const createPayment = async (
    userId: string,
    data: {
        stripeSessionId: string;
        stripeCustomerId?: string;
        type: "per_scenario" | "pro_subscription";
        amount: number;
        currency: string;
        status: "completed" | "failed" | "refunded";
    }
): Promise<string> => {
    const paymentsRef = getPaymentsRef(userId);
    const docRef = await addDoc(paymentsRef, {
        ...data,
        userId,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getUserPayments = async (userId: string): Promise<Payment[]> => {
    const paymentsRef = getPaymentsRef(userId);
    const q = query(paymentsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Payment));
};

// ============ Subscription Operations ============

export const updateSubscription = async (
    userId: string,
    data: {
        subscriptionTier?: SubscriptionTier;
        paidScenarioCredits?: number;
        stripeCustomerId?: string;
        stripeSubscriptionId?: string;
        subscriptionStatus?: SubscriptionStatus;
    }
): Promise<void> => {
    const userRef = getUserRef(userId);
    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

export const addScenarioCredits = async (
    userId: string,
    credits: number
): Promise<void> => {
    const userRef = getUserRef(userId);
    await updateDoc(userRef, {
        paidScenarioCredits: increment(credits),
        updatedAt: serverTimestamp(),
    });
};

export const consumeScenarioCredit = async (
    userId: string
): Promise<void> => {
    const userRef = getUserRef(userId);
    await updateDoc(userRef, {
        paidScenarioCredits: increment(-1),
        updatedAt: serverTimestamp(),
    });
};

// ============ Seed Default Scenarios ============

export const seedDefaultScenarios = async (userId: string): Promise<void> => {
    // Default scenarios are disabled for new users to start with an empty dashboard
    return;
};
