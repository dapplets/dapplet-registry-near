import { Context } from 'near-sdk-core';
import { listers, getModulesList, getModulesByContextIdList, getContextIdsByModuleList, getContextIdsList } from './models';

// READ

export function getAllContextIds(lister: string): string[] {
    return getContextIdsList(lister).values();
}

export function getAllModules(lister: string): string[] {
    return getModulesList(lister).values();
}

export function getModulesByContextId(lister: string, contextId: string): string[] {
    return getModulesByContextIdList(lister, contextId).values();
}

export function getContextIdsByModule(lister: string, moduleName: string): string[] {
    return getContextIdsByModuleList(lister, moduleName).values();
}

export function getAllListers(): string[] {
    return listers.values();
}

export function bindingExists(lister: string, contextId: string, moduleName: string): bool {
    const cAdjacencies = getModulesByContextIdList(lister, contextId);
    const mAdjacencies = getContextIdsByModuleList(lister, moduleName);
    return cAdjacencies.has(moduleName) && mAdjacencies.has(contextId);
}

// WRITE

export function addContextId(contextId: string, moduleName: string): void {
    const lister = Context.sender;

    const cAdjacencies = getModulesByContextIdList(lister, contextId);
    const mAdjacencies = getContextIdsByModuleList(lister, moduleName);

    assert(!cAdjacencies.has(moduleName) && !mAdjacencies.has(contextId), "Binding already exists.");

    cAdjacencies.add(moduleName);
    mAdjacencies.add(contextId);

    const contextIds = getContextIdsList(lister);
    const modules = getModulesList(lister);

    if (!contextIds.has(contextId)) contextIds.add(contextId);
    if (!modules.has(moduleName)) modules.add(moduleName);

    if (!listers.has(lister)) listers.add(lister);
}

export function removeContextId(contextId: string, moduleName: string): void {
    const lister = Context.sender;

    const cAdjacencies = getModulesByContextIdList(lister, contextId);
    const mAdjacencies = getContextIdsByModuleList(lister, moduleName);

    assert(cAdjacencies.has(moduleName) && mAdjacencies.has(contextId), "Binding doesn't exist.");

    cAdjacencies.delete(moduleName);
    mAdjacencies.delete(contextId);
    
    const contextIds = getContextIdsList(lister);
    const modules = getModulesList(lister);

    if (cAdjacencies.size == 0) contextIds.delete(contextId);
    if (mAdjacencies.size == 0) modules.delete(moduleName);
}