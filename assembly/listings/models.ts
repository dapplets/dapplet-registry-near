import { PersistentSet } from "near-sdk-core";

export const listers = new PersistentSet<string>("ba");

export function getModulesByContextIdList(lister: string, contextId: string): PersistentSet<string> {
    return new PersistentSet<string>("bb:" + lister + ':' + contextId);
}

export function getContextIdsByModuleList(lister: string, moduleName: string): PersistentSet<string> {
    return new PersistentSet<string>("bc:" + lister + ':' + moduleName);
}

export function getContextIdsList(lister: string): PersistentSet<string> {
    return new PersistentSet<string>("bd:" + lister);
}

export function getModulesList(lister: string): PersistentSet<string> {
    return new PersistentSet<string>("be:" + lister);
}