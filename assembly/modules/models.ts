import { PersistentMap, PersistentSet, PersistentUnorderedMap, PersistentVector } from "near-sdk-core";

@nearBindgen
export class ModuleInfo {
  constructor(
    public moduleType: u8, // 1 - Feature, 2 - Adapter, 3 - Library, 4 - Interface
    public name: string,
    public owner: string
  ) { }
}

@nearBindgen
export class ModuleVersion {
  constructor(
    public name: string,
    public branch: string,
    public version: string,

    public title: string,
    public description: string,
    public icon: StorageRef,
    public owner: string,
    public reference: StorageRef,
    public docs: StorageRef,

    public dependencies: Dependency[],
    public interfaces: Dependency[]
  ) { }
}

@nearBindgen
export class StorageRef {
  constructor(
    public hash: Uint8Array,
    public uris: Uint8Array[]
  ) { }
}

@nearBindgen
export class Dependency {
  constructor(
    public name: string,
    public branch: string,
    public version: string
  ) { }
}

export const modules = new PersistentVector<ModuleInfo>("r_modules");
export const moduleIdxByName = new PersistentMap<string, i32>("r_moduleIdxByName");

export function getVersionsMap(moduleName: string, branch: string): PersistentUnorderedMap<string, ModuleVersion> {
  return new PersistentUnorderedMap<string, ModuleVersion>("r_v:" + moduleName + ":" + branch);
}

export function getBranchesList(moduleName: string): PersistentSet<string> {
  return new PersistentSet<string>("r_b:" + moduleName);
}

// ToDo: remove it, when contextIds will be binded to module versions.
export function getInterfacesList(moduleName: string): PersistentSet<string> {
  return new PersistentSet<string>("r_i:" + moduleName);
}