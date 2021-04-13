import * as modules from './modules';
import * as listings from './listings';
import { ModuleInfo, VersionInfo } from './modules/models';
import { Context } from 'near-sdk-core';

export function addModuleWithContexts(contextIds: string[], mInfo: ModuleInfo, vInfo: VersionInfo): void {
    assert(mInfo.name == vInfo.name, "Module names must be equal.");
    assert(modules.getVersionInfo(mInfo.name, vInfo.branch, vInfo.version) == null, "The module version already exists.");

    // register module name if not exists
    if (modules.getModuleInfoByName(mInfo.name) == null) modules.createModule(mInfo);

    // add version
    modules.addModuleVersion(vInfo);

    // add context ids
    for (let i: i32 = 0; i < contextIds.length; i++) {
        if (!listings.bindingExists(Context.sender, contextIds[i], mInfo.name)) {
            listings.addContextId(contextIds[i], mInfo.name);
        }
    }
}

export function getModuleInfoBatch(ctxIds: string[], users: string[], maxBufLen: i32): ModuleInfo[][] {
    const mod_info = new Array<ModuleInfo[]>(ctxIds.length);
    for (let i: i32 = 0; i < ctxIds.length; ++i) {
        const mi = getModuleInfo(ctxIds[i], users, maxBufLen);
        mod_info[i] = mi;
    }
    return mod_info;
}

//Very naive impl.
export function getModuleInfo(ctxId: string, users: string[], maxBufLen: i32): ModuleInfo[] {
    const outbuf = new Array<string>(maxBufLen > 0 ? maxBufLen : 1000);
    const bufLen = _fetchModulesByUsersTag(ctxId, users, outbuf, 0);
    const mod_info = new Array<ModuleInfo>(bufLen);
    for (let i: i32 = 0; i < bufLen; ++i) {
        const mod_name = outbuf[i];
        mod_info[i] = modules.getModuleInfoByName(mod_name)!; // WARNING! indexes are started from 1.
        //ToDo: strip contentType indexes?
    }
    return mod_info;
}


function _fetchModulesByUsersTag(ctxId: string, listers: string[], outbuf: string[], _bufLen: i32): i32 {
    let bufLen: i32 = _bufLen;

    for (let i: i32 = 0; i < listers.length; ++i) {
        const _modules = listings.getModulesByContextId(listers[i], ctxId);
        //add if no duplicates in buffer[0..nn-1]
        const lastBufLen: i32 = bufLen;
        for (let j = 0; j < _modules.length; ++j) {
            const moduleName = _modules[j];
            let k: i32 = 0;
            for (; k < lastBufLen; ++k) {
                if (outbuf[k] == moduleName) break; //duplicate found
            }
            if (k == lastBufLen) { //no duplicates found  -- add the module's index
                const m = modules.getModuleInfoByName(moduleName);
                if (m == null) continue;

                outbuf[bufLen++] = moduleName;
                bufLen = _fetchModulesByUsersTag(m.name, listers, outbuf, bufLen); // using index as a tag.

                const interfaces = modules.getInterfacesOfModule(moduleName);
                for (let l: i32 = 0; l < interfaces.length; ++l) {
                    bufLen = _fetchModulesByUsersTag(interfaces[l], listers, outbuf, bufLen);
                }

                //ToDo: what if owner changes? CREATE MODULE ENS  NAMES! on creating ENS  
            }
        }
    }
    return bufLen;
}


// ToDo: fix it when this issue will be implemented
// https://github.com/near/near-sdk-as/issues/491
export function getModuleInfoByNames(names: string[]): (ModuleInfo | null)[] {
    return modules.getModuleInfoByNames(names);
}

export function getModuleInfoByName(name: string): ModuleInfo | null {
    return modules.getModuleInfoByName(name);
}

export function getLastVersionInfo(name: string): VersionInfo | null {
    return modules.getLastVersionInfo(name);
}

export function getVersionInfo(name: string, branch: string, version: string): VersionInfo | null {
    return modules.getVersionInfo(name, branch, version);
}

export function getModuleNames(): string[] {
    return modules.getModuleNames();
}

export function getModules(): ModuleInfo[] {
    return modules.getModules();
}

export function getModuleBranches(name: string): string[] {
    return modules.getModuleBranches(name);
}

export function getVersionNumbers(name: string, branch: string): string[] {
    return modules.getVersionNumbers(name, branch);
}

export function getInterfacesOfModule(name: string): string[] {
    return modules.getInterfacesOfModule(name);
}

export function createModule(moduleInfo: ModuleInfo): void {
    modules.createModule(moduleInfo);
}

export function addModuleVersion(moduleVersion: VersionInfo): void {
    modules.addModuleVersion(moduleVersion);
}

export function transferOwnership(moduleName: string, newOwner: string): void {
    modules.transferOwnership(moduleName, newOwner);
}

export function getAllContextIds(lister: string): string[] {
    return listings.getAllContextIds(lister);
}

export function getAllModules(lister: string): string[] {
    return listings.getAllModules(lister);
}

export function getModulesByContextId(lister: string, contextId: string): string[] {
    return listings.getModulesByContextId(lister, contextId);
}

export function getContextIdsByModule(lister: string, moduleName: string): string[] {
    return listings.getContextIdsByModule(lister, moduleName);
}

export function getAllListers(): string[] {
    return listings.getAllListers();
}

export function bindingExists(lister: string, contextId: string, moduleName: string): bool {
    return listings.bindingExists(lister, contextId, moduleName);
}

export function addContextId(contextId: string, moduleName: string): void {
    listings.addContextId(contextId, moduleName);
}

export function removeContextId(contextId: string, moduleName: string): void {
    listings.removeContextId(contextId, moduleName);
}