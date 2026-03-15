import { Promise, PromiseStatus } from "./promise";

export interface PersonalPromise extends Promise {
  isPersonal: true;
  origin: "voluntary";
  promisee: string;
  reflection?: string;
  renegotiatedFrom?: string;
  completedAt?: string;
  createdAt: string;
}

export interface PersonalStats {
  totalPromises: number;
  activePromises: number;
  keptRate: number;
  mtkp: number;
  mtkpByDomain: Record<string, number>;
  byDomain: Record<string, {
    total: number;
    kept: number;
    broken: number;
    active: number;
    keptRate: number;
    mtkp: number;
  }>;
  trend: { month: string; keptRate: number }[];
}
