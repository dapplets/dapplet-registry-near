import { Context } from 'near-sdk-core';
import { listers, getModulesList, getAdjacencyList, getContextIdsList } from './models';

// READ

export function getAllContextIds(lister: string): string[] {
    return getContextIdsList(lister).values();
}

export function getAllModules(lister: string): string[] {
    return getModulesList(lister).values();
}

export function getModulesByContextId(lister: string, c: string): string[] {
    return getAdjacencyList(lister, c).values();
}

export function getContextIdsByModule(lister: string, m: string): string[] {
    return getAdjacencyList(lister, m).values();
}

export function getAllListers(): string[] {
    return listers.values();
}

export function bindingExists(lister: string, c: string, m: string): bool {
    const cAdjacencies = getAdjacencyList(lister, c);
    const mAdjacencies = getAdjacencyList(lister, m);
    return cAdjacencies.has(m) && mAdjacencies.has(c);
}

// WRITE

export function addContextId(c: string, m: string): void {
    const lister = Context.sender;

    const cAdjacencies = getAdjacencyList(lister, c);
    const mAdjacencies = getAdjacencyList(lister, m);

    assert(!cAdjacencies.has(m) && !mAdjacencies.has(c), "Binding already exists.");

    cAdjacencies.add(m);
    mAdjacencies.add(c);

    const contextIds = getContextIdsList(lister);
    const modules = getModulesList(lister);

    if (!contextIds.has(c)) contextIds.add(c);
    if (!modules.has(m)) modules.add(m);

    if (!listers.has(lister)) listers.add(lister);
}

export function removeContextId(c: string, m: string): void {
    const lister = Context.sender;

    const cAdjacencies = getAdjacencyList(lister, c);
    const mAdjacencies = getAdjacencyList(lister, m);

    assert(cAdjacencies.has(m) && mAdjacencies.has(c), "Binding doesn't exist.");

    cAdjacencies.delete(m);
    mAdjacencies.delete(c);
    
    const contextIds = getContextIdsList(lister);
    const modules = getModulesList(lister);

    if (cAdjacencies.size === 0) contextIds.delete(c);
    if (mAdjacencies.size === 0) modules.delete(m);
}