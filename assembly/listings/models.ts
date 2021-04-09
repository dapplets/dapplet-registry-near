import { PersistentSet } from "near-sdk-core";

export const listers = new PersistentSet<string>("l_l");

export function getAdjacencyList(lister: string, vertex: string): PersistentSet<string> {
    return new PersistentSet<string>("l_l:" + lister + ':' + vertex);
}

export function getContextIdsList(lister: string): PersistentSet<string> {
    return new PersistentSet<string>("l_c:" + lister);
}

export function getModulesList(lister: string): PersistentSet<string> {
    return new PersistentSet<string>("l_m:" + lister);
}