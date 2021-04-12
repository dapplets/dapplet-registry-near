import { Context } from 'near-sdk-as';;
import { getVersionsMap, getBranchesList, modules, moduleIdxByName, ModuleVersion, ModuleInfo, getInterfacesList } from './models';

// READ

export function getModuleInfoByNames(names: string[]): (ModuleInfo | null)[] {
  const result = new Array<ModuleInfo | null>(names.length);
  for (let i: i32 = 0; i < names.length; i++) {
    result[i] = getModuleInfoByName(names[i]);
  }
  return result;
}

export function getModuleInfoByName(name: string): ModuleInfo | null {
  if (!moduleIdxByName.contains(name)) return null;
  const moduleIdx = moduleIdxByName.getSome(name);
  return modules.containsIndex(moduleIdx) ? modules[moduleIdx] : null;
}

export function getModuleVersion(name: string, branch: string, version: string): ModuleVersion | null {
  const versions = getVersionsMap(name, branch);
  return versions.get(version);
}

export function getModuleNames(): string[] {
  const names = new Array<string>(modules.length);
  for (let i: i32 = 0; i < modules.length; i++) {
    names[i] = modules[i].name;
  }
  return names;
}

export function getModules(): ModuleInfo[] {
  const moduleInfos = new Array<ModuleInfo>(modules.length);
  for (let i: i32 = 0; i < moduleInfos.length; i++) {
    moduleInfos[i] = modules[i];
  }
  return moduleInfos;
}

export function getModuleBranches(name: string): string[] {
  const branches = getBranchesList(name);
  return branches.values();
}

// ToDo: remove it, when contextIds will be binded to module versions.
export function getInterfacesOfModule(name: string): string[] {
  return getInterfacesList(name).values();
}

// WRITE

export function createModule(moduleInfo: ModuleInfo): void {
  assert(!moduleIdxByName.contains(moduleInfo.name), "The module with such name already exists.");
  assert(Context.sender == moduleInfo.owner, "The module's owner must be sender of transaction.");
  
  const idx = modules.push(moduleInfo);
  moduleIdxByName.set(moduleInfo.name, idx);
}

export function addModuleVersion(moduleVersion: ModuleVersion): void {
  const idx = moduleIdxByName.getSome(moduleVersion.name);
  const module = modules[idx];
  assert(module.owner == Context.sender, 'You are not the owner of this module.');

  const versions = getVersionsMap(moduleVersion.name, moduleVersion.branch);
  assert(!versions.contains(moduleVersion.version), "The version already exists.");
  
  // ToDo: check semver

  // ToDo: check dependencies
  for (let i: i32 = 0; i < moduleVersion.dependencies.length; i++) {
    const _dep = moduleVersion.dependencies[i];
    const depModule = getModuleInfoByName(_dep.name);
    assert(depModule != null, "The dependency is not exist.");
    assert(depModule!.moduleType == 2 || depModule!.moduleType == 3, "The dependency is not an adapter or a library.");
    
    const version = getModuleVersion(_dep.name, _dep.branch, _dep.version);
    assert(version != null, "The dependency version doesn't exist.");    
  }

  const interfacesList = getInterfacesList(moduleVersion.name);

  // ToDo: check interfaces
  for (let i: i32 = 0; i < moduleVersion.interfaces.length; i++) {
    const _interface = moduleVersion.interfaces[i];
    const interfaceModule = getModuleInfoByName(_interface.name);
    assert(interfaceModule != null, "The interface is not exist.");
    assert(interfaceModule!.moduleType == 4, "The module is not interface.");
    
    const version = getModuleVersion(_interface.name, _interface.branch, _interface.version);
    assert(version != null, "The interface version doesn't exist.");    
    
    // Add interfaces
    // ToDo: remove it, when contextIds will be binded to module versions.
    if (!interfacesList.has(_interface.name)) interfacesList.add(_interface.name);
  }
  
  // Add version
  versions.set(moduleVersion.version, moduleVersion); 

  // Add branch
  const branches = getBranchesList(moduleVersion.name);
  if (!branches.has(moduleVersion.branch)) branches.add(moduleVersion.branch);
}

export function transferOwnership(moduleName: string, newOwner: string): void {
  const idx = moduleIdxByName.getSome(moduleName);
  const module = modules[idx];
  assert(module.owner == Context.sender, 'You are not the owner of this module');

  module.owner = newOwner;
  modules.replace(idx, module);
}