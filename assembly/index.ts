import { Context, logging, storage, util } from 'near-sdk-as';
import { PersistentMap, PersistentVector } from "near-sdk-as";
import { math } from "near-sdk-as";

@nearBindgen
class StorageRef {
    constructor(
        public hash: Uint8Array,
        public uris: string[]
    ) { }
}

@nearBindgen
class ModuleInfo {
    constructor(
        public moduleType: u8,
        public name: string,
        public title: string,
        public description: string,
        public owner: string,
        public interfaces: string[],
        public icon: StorageRef,
        public flags: u32
    ) { }
}

@nearBindgen
class VersionInfo {
    constructor(
        public modIdx: u32,
        public branch: string,
        public major: u8,
        public minor: u8,
        public patch: u8,
        public flags: u8,
        public binary: StorageRef,
        public dependencies: Uint8Array[],
        public interfaces: Uint8Array[]
    ) { }
}

@nearBindgen
class VersionInfoDto {
    constructor(
        public moduleType: u8,
        public branch: string,
        public major: u8,
        public minor: u8,
        public patch: u8,
        public flags: u8,
        public binary: StorageRef,
        public dependencies: DependencyDto[],
        public interfaces: DependencyDto[]
    ) { }
}

@nearBindgen
class DependencyDto {
    constructor(
        public name: string,
        public branch: string,
        public major: u8,
        public minor: u8,
        public patch: u8
    ) { }
}

@nearBindgen
class VersionNumber {
    constructor(
        public major: u8,
        public minor: u8,
        public patch: u8
    ) { }
}

const versionNumbers = new PersistentMap<Uint8Array, VersionNumber[]>("versionNumbers");
const versions = new PersistentMap<Uint8Array, VersionInfo>("versions");
const modsByContextType = new PersistentMap<Uint8Array, u32[]>("modsByContextType");
const moduleIdxs = new PersistentMap<Uint8Array, u32>("moduleIdxs");
const modules = new PersistentVector<ModuleInfo>("modules");

export function init(): void {
    assert(storage.get<string>("init") == null, "Already initialized");
    storage.set("init", "done");
    modules.push(new ModuleInfo(0,"","","","",[], new StorageRef(new Uint8Array(0), []), 0));
  }

export function getModuleInfoBatch(ctxIds: string[], users: string[], maxBufLen: u32): ModuleInfo[][] {
    const mod_info = new Array<ModuleInfo[]>(ctxIds.length);
    for (let i: i32 = 0; i < ctxIds.length; ++i) {
        const mi = getModuleInfo(ctxIds[i], users, maxBufLen);
        mod_info[i] = mi;
    }
    return mod_info;
}

//Very naive impl.
export function getModuleInfo(ctxId: string, users: string[], maxBufLen: u32): ModuleInfo[] {
    const outbuf = new Array<u32>(maxBufLen > 0 ? maxBufLen : 1000);
    const bufLen = _fetchModulesByUsersTag(ctxId, users, outbuf, 0);
    const mod_info = new Array<ModuleInfo>(bufLen);
    for (let i: i32 = 0; i < bufLen; ++i) {
        const idx: u32 = outbuf[i];
        mod_info[i] = modules[idx]; // WARNING! indexes are started from 1.
        //ToDo: strip contentType indexes?
    }
    return mod_info;
}

export function getModuleInfoByName(mod_name: string): ModuleInfo {
    const mKey = math.keccak256(util.stringToBytes(mod_name));
    const moduleIdx = moduleIdxs.getSome(mKey);
    return modules[moduleIdx];
}

export function addModuleInfo(contextIds: string[], mInfo: ModuleInfo, vInfos: VersionInfoDto[], owner: string): void {
    assert(_isEnsOwner(owner));
    const mKey = math.keccak256(util.stringToBytes(mInfo.name));
    moduleIdxs.getSome(mKey);

    // ModuleInfo adding
    mInfo.owner = owner;
    modules.push(mInfo);
    const mIdx: u32 = u32(modules.length - 1); // WARNING! indexes are started from 1.
    moduleIdxs.set(mKey, mIdx);

    // ContextId adding
    for (let i: i32 = 0; i < contextIds.length; ++i) {
        const key = math.keccak256(_concatUint8Arrays([util.stringToBytes(contextIds[i]), util.stringToBytes(owner)]));
        const mods = modsByContextType.get(key, [])!;
        mods.push(mIdx);
        modsByContextType.set(key, mods);
    }

    // events are not implemented yet
    // emit ModuleInfoAdded(contextIds, owner, mIdx);

    // Versions Adding
    for (let i: i32 = 0; i < vInfos.length; ++i) {
        _addModuleVersionNoChecking(mIdx, mInfo.name, vInfos[i]);
    }
}

export function addModuleVersion(mod_name: string, vInfo: VersionInfoDto, owner: string): void {
    assert(_isEnsOwner(owner));
    // ******** TODO: check existing versions and version sorting
    const mKey = math.keccak256(util.stringToBytes(mod_name));
    const moduleIdx = moduleIdxs.getSome(mKey);
    const m: ModuleInfo = modules[moduleIdx]; // WARNING! indexes are started from 1.
    assert(m.owner == owner, 'You are not the owner of this module');

    _addModuleVersionNoChecking(moduleIdx, mod_name, vInfo);
}

export function addModuleVersionBatch(mod_name: string[], vInfo: VersionInfoDto[], userId: string[]): void {
    assert(mod_name.length == vInfo.length && vInfo.length == userId.length, "Number of elements must be equal");
    for (let i: i32 = 0; i < mod_name.length; ++i) {
        addModuleVersion(mod_name[i], vInfo[i], userId[i]);
    }
}

export function getVersionNumbers(name: string, branch: string): VersionNumber[] {
    const key = math.keccak256(_concatUint8Arrays([util.stringToBytes(name), util.stringToBytes(branch)]));
    return versionNumbers.get(key, [])!;
}

// instead of resolveToManifest
export function getVersionInfo(name: string, branch: string, major: u8, minor: u8, patch: u8): VersionInfoDto {
    const key = math.keccak256(_concatUint8Arrays([util.stringToBytes(name), util.stringToBytes(branch), _u8ToUint8Array(major), _u8ToUint8Array(minor), _u8ToUint8Array(patch)]));
    const v = versions.get(key);
    assert(v !== null, "Version doesn't exist");

    const deps = new Array<DependencyDto>(v!.dependencies.length);
    for (let i: i32 = 0; i < v!.dependencies.length; ++i) {
        const depVi = versions.get(v!.dependencies[i])!;
        const depMod: ModuleInfo = modules[depVi.modIdx];
        deps[i] = new DependencyDto(depMod.name, depVi.branch, depVi.major, depVi.minor, depVi.patch);
    }

    const interfaces = new Array<DependencyDto>(v!.interfaces.length);
    for (let i: i32 = 0; i < v!.interfaces.length; ++i) {
        const intVi: VersionInfo = versions.get(v!.interfaces[i])!;
        const intMod: ModuleInfo = modules[intVi.modIdx];
        interfaces[i] = new DependencyDto(intMod.name, intVi.branch, intVi.major, intVi.minor, intVi.patch);
    }

    const moduleType = modules[v!.modIdx].moduleType;
    const dto = new VersionInfoDto(moduleType, v!.branch, v!.major, v!.minor, v!.patch, v!.flags, v!.binary, deps, interfaces);

    return dto;
}

export function transferOwnership(mod_name: string, oldUserId: string, newUserId: string): void {
    assert(_isEnsOwner(oldUserId));
    assert(_isEnsOwner(newUserId));
    const mKey = math.keccak256(util.stringToBytes(mod_name));
    const moduleIdx = moduleIdxs.getSome(mKey);
    const m: ModuleInfo = modules[moduleIdx];
    assert(m.owner == oldUserId, 'You are not the owner of this module');

    m.owner = newUserId;
}

export function addContextId(mod_name: string, contextId: string, owner: string): void {
    assert(_isEnsOwner(owner));
    const mKey = math.keccak256(util.stringToBytes(mod_name));
    const moduleIdx = moduleIdxs.getSome(mKey);
    const m: ModuleInfo = modules[moduleIdx]; // WARNING! indexes are started from 1.
    assert(m.owner == owner, 'You are not the owner of this module');

    // ContextId adding
    const key = math.keccak256(_concatUint8Arrays([util.stringToBytes(contextId), util.stringToBytes(owner)]));
    const mods = modsByContextType.get(key, [])!;
    mods.push(moduleIdx);
    modsByContextType.set(key, mods);
}

export function removeContextId(mod_name: string, contextId: string, owner: string): void {
    assert(_isEnsOwner(owner));
    const mKey = math.keccak256(util.stringToBytes(mod_name));
    const moduleIdx = moduleIdxs.getSome(mKey);
    const m: ModuleInfo = modules[moduleIdx]; // WARNING! indexes are started from 1.
    assert(m.owner == owner, 'You are not the owner of this module');

    // ContextId adding
    const key = math.keccak256(_concatUint8Arrays([util.stringToBytes(contextId), util.stringToBytes(owner)]));
    const mods: u32[] = modsByContextType.get(key, [])!;

    for (let i: i32 = 0; i < mods.length; ++i) {
        if (mods[i] == moduleIdx) {
            mods[i] = mods[modules.length - 1];
            mods.pop();
            break;
        }
    }

    modsByContextType.set(key, mods);
}

function _fetchModulesByUsersTags(interfaces: string[], users: string[], outbuf: u32[], _bufLen: u32): u32 {
    let bufLen: u32 = _bufLen;

    for (let i: i32 = 0; i < interfaces.length; ++i) {
        bufLen = _fetchModulesByUsersTag(interfaces[i], users, outbuf, bufLen);
    }

    return bufLen;
}

// ctxId - URL or ContextType [IdentityAdapter]
function _fetchModulesByUsersTag(ctxId: string, users: string[], outbuf: u32[], _bufLen: u32): i32 {
    let bufLen: i32 = _bufLen;
    for (let i: i32 = 0; i < users.length; ++i) {
        const key = math.keccak256(_concatUint8Arrays([util.stringToBytes(ctxId), util.stringToBytes(users[i])]));
        const modIdxs: u32[] = modsByContextType.get(key, [])!;
        //add if no duplicates in buffer[0..nn-1]
        const lastBufLen: u32 = bufLen;
        for (let j = 0; j < modIdxs.length; ++j) {
            const modIdx: u32 = modIdxs[j];
            let k: u32 = 0;
            for (; k < lastBufLen; ++k) {
                if (outbuf[k] == modIdx) break; //duplicate found
            }
            if (k == lastBufLen) { //no duplicates found  -- add the module's index
                outbuf[bufLen++] = modIdx;
                const m: ModuleInfo = modules[modIdx];
                bufLen = _fetchModulesByUsersTag(m.name, users, outbuf, bufLen); // using index as a tag.
                bufLen = _fetchModulesByUsersTags(m.interfaces, users, outbuf, bufLen);
                //ToDo: what if owner changes? CREATE MODULE ENS  NAMES! on creating ENS  
            }
        }
    }
    return bufLen;
}

function _addModuleVersionNoChecking(moduleIdx: u32, mod_name: string, v: VersionInfoDto): void {
    const deps = new Array<Uint8Array>(v.dependencies.length);
    for (let i: i32 = 0; i < v.dependencies.length; ++i) {
        const d: DependencyDto = v.dependencies[i];
        const dKey = math.keccak256(_concatUint8Arrays([util.stringToBytes(d.name), util.stringToBytes(d.branch), _u8ToUint8Array(d.major), _u8ToUint8Array(d.minor), _u8ToUint8Array(d.patch)]));
        assert(versions.get(dKey) != null, "Dependency doesn't exist");
        deps[i] = dKey;
    }

    const interfaces = new Array<Uint8Array>(v.interfaces.length);
    for (let i: i32 = 0; i < v.interfaces.length; ++i) {
        const interf: DependencyDto = v.interfaces[i];
        const iKey = math.keccak256(_concatUint8Arrays([util.stringToBytes(interf.name), util.stringToBytes(interf.branch), _u8ToUint8Array(interf.major), _u8ToUint8Array(interf.minor), _u8ToUint8Array(interf.patch)]));
        assert(versions.get(iKey) !== null, "Interface doesn't exist");
        interfaces[i] = iKey;

        // add interface name to ModuleInfo if not exist
        let isInterfaceExist = false;
        for (let j = 0; j < modules[moduleIdx].interfaces.length; ++j) {
            if (math.keccak256(util.stringToBytes(modules[moduleIdx].interfaces[j])) == math.keccak256(util.stringToBytes(interf.name))) {
                isInterfaceExist = true;
                break;
            }
        }

        if (isInterfaceExist == false) {
            modules[moduleIdx].interfaces.push(interf.name);
        }
    }

    const vInfo = new VersionInfo(moduleIdx, v.branch, v.major, v.minor, v.patch, v.flags, v.binary, deps, interfaces);
    const vKey = math.keccak256(_concatUint8Arrays([util.stringToBytes(mod_name), util.stringToBytes(v.branch), _u8ToUint8Array(v.major), _u8ToUint8Array(v.minor), _u8ToUint8Array(v.patch)]));
    versions.set(vKey, vInfo);

    const nbKey = math.keccak256(_concatUint8Arrays([util.stringToBytes(mod_name), util.stringToBytes(vInfo.branch)]));
    const modVersions = versionNumbers.get(nbKey, [])!;
    modVersions.push(new VersionNumber(vInfo.major, vInfo.minor, vInfo.patch));
    versionNumbers.set(nbKey, modVersions);
}

function _isEnsOwner(owner: string): boolean {
    return true; //ToDo: NOT_IMPLEMENTED
}

function _concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
    let totalLength = 0;
    for (let i: i32 = 0; i < arrays.length; i++) {
        totalLength += arrays[i].length;
    }

    let shift = 0;
    const c = new Uint8Array(totalLength);
    for (let i: i32 = 0; i < arrays.length; i++) {
        memory.copy(c.dataStart + shift, arrays[i].dataStart, arrays[i].length);
        shift += arrays[i].length;
    }

    return c;
}

function _u8ToUint8Array(a: u8): Uint8Array {
    const arr = new Uint8Array(1);
    arr[0] = a;
    return arr;
}