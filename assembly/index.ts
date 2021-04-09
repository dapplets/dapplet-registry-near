import { addModuleVersion, transferOwnership, getModules, getModuleVersion, getModuleNames, getModuleInfoByNames, getModuleBranches, createModule, getModuleInfoByName, getInterfacesOfModule } from './modules';
import { addContextId, getAllContextIds, getAllListers, getAllModules, getContextIdsByModule, getModulesByContextId, removeContextId, bindingExists } from './listings';
import { ModuleInfo, ModuleVersion } from './modules/models';
import { Context } from 'near-sdk-core';

export { addModuleVersion, transferOwnership, getModules, getModuleVersion, getModuleNames, getModuleInfoByNames, getModuleBranches, createModule, getModuleInfoByName };
export { addContextId, getAllContextIds, getAllListers, getAllModules, getContextIdsByModule, getModulesByContextId, removeContextId };

export function addModuleWithContexts(contextIds: string[], mInfo: ModuleInfo, vInfo: ModuleVersion): void {
    assert(getModuleVersion(mInfo.name, vInfo.branch, vInfo.version) == null, "The module version already exists.");

    // register module name if not exists
    if (getModuleInfoByName(mInfo.name) == null) createModule(mInfo);

    // add version
    addModuleVersion(vInfo);

    // add context ids
    for (let i: i32 = 0; i < contextIds.length; i++) {
        if (!bindingExists(Context.sender, contextIds[i], mInfo.name)) {
            addContextId(contextIds[i], mInfo.name);
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
        mod_info[i] = getModuleInfoByName(mod_name)!; // WARNING! indexes are started from 1.
        //ToDo: strip contentType indexes?
    }
    return mod_info;
}

function _fetchModulesByUsersTag(ctxId: string, listers: string[], outbuf: string[], _bufLen: i32): i32 {
    let bufLen: i32 = _bufLen;

    for (let i: i32 = 0; i < listers.length; ++i) {
        const modules = getModulesByContextId(listers[i], ctxId);
        //add if no duplicates in buffer[0..nn-1]
        const lastBufLen: i32 = bufLen;
        for (let j = 0; j < modules.length; ++j) {
            const moduleName = modules[j];
            let k: i32 = 0;
            for (; k < lastBufLen; ++k) {
                if (outbuf[k] == moduleName) break; //duplicate found
            }
            if (k == lastBufLen) { //no duplicates found  -- add the module's index
                outbuf[bufLen++] = moduleName;
                
                const m = getModuleInfoByName(moduleName);
                const interfaces = getInterfacesOfModule(moduleName);

                if (m == null) continue;

                bufLen = _fetchModulesByUsersTag(m.name, listers, outbuf, bufLen); // using index as a tag.
                
                for (let i: i32 = 0; i < interfaces.length; ++i) {
                    bufLen = _fetchModulesByUsersTag(interfaces[i], listers, outbuf, bufLen);
                }

                //ToDo: what if owner changes? CREATE MODULE ENS  NAMES! on creating ENS  
            }
        }
    }
    return bufLen;
}
