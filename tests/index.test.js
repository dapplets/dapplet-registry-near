import 'regenerator-runtime/runtime';

let near;
let contract;
let accountId;

const EMPTY_REF = {
  hash: 'AA==',
  uris: ['AA==']
};

beforeAll(async function () {
  near = await nearlib.connect(nearConfig);
  accountId = nearConfig.contractName;
  contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['getModules', 'getModuleVersion', 'getModuleNames', 'getModuleInfoByNames', 'getModuleBranches', 'getModuleInfoByName', 'getAllContextIds', 'getAllListers', 'getAllModules', 'getContextIdsByModule', 'getModulesByContextId', 'getModuleInfoBatch', 'getModuleInfo', 'getInterfacesOfModule'],
    changeMethods: ['addModuleVersion', 'transferOwnership', 'createModule', 'addContextId', 'addModuleWithContexts', 'removeContextId'],
    sender: accountId
  });
});

it('creates a dynamic-adapter', async () => {
  const mi_a = {
    // 1 - Feature, 2 - Adapter, 3 - Library, 4 - Interface
    moduleType: 2,
    name: 'dynamic-adapter',
    owner: accountId
  }

  await contract.createModule({
    moduleInfo: mi_a
  });

  const mi_b = await contract.getModuleInfoByName({ name: 'dynamic-adapter' });

  expect(mi_a).toMatchObject(mi_b);
});

it('creates a identity-adapter', async () => {
  const mi_a = {
    // 1 - Feature, 2 - Adapter, 3 - Library, 4 - Interface
    moduleType: 4,
    name: 'identity-adapter',
    owner: accountId
  }

  await contract.createModule({
    moduleInfo: mi_a
  });

  const mi_b = await contract.getModuleInfoByName({ name: 'identity-adapter' });

  expect(mi_a).toMatchObject(mi_b);
});

it('creates a twitter-adapter', async () => {
  const mi_a = {
    // 1 - Feature, 2 - Adapter, 3 - Library, 4 - Interface
    moduleType: 2,
    name: 'twitter-adapter',
    owner: accountId
  }

  await contract.createModule({
    moduleInfo: mi_a
  });

  const mi_b = await contract.getModuleInfoByName({ name: 'twitter-adapter' });

  expect(mi_a).toMatchObject(mi_b);
});

it('creates a instagram-adapter', async () => {
  const mi_a = {
    // 1 - Feature, 2 - Adapter, 3 - Library, 4 - Interface
    moduleType: 2,
    name: 'instagram-adapter',
    owner: accountId
  }

  await contract.createModule({
    moduleInfo: mi_a
  });

  const mi_b = await contract.getModuleInfoByName({ name: 'instagram-adapter' });

  expect(mi_a).toMatchObject(mi_b);
});

it('creates a identity-feature', async () => {
  const mi_a = {
    // 1 - Feature, 2 - Adapter, 3 - Library, 4 - Interface
    moduleType: 1,
    name: 'identity-feature',
    owner: accountId
  }

  await contract.createModule({
    moduleInfo: mi_a
  });

  const mi_b = await contract.getModuleInfoByName({ name: 'identity-feature' });

  expect(mi_a).toMatchObject(mi_b);
});

it('adds new version of dynamic-adapter', async () => {
  const v_a = {
    name: 'dynamic-adapter',
    branch: 'default',
    version: '1.0.0',
    title: 'Dynamic Adapter',
    description: 'This is a dynamic adapter',
    icon: null,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [],
    interfaces: []
  };
  await contract.addModuleVersion({ moduleVersion: v_a });
  const v_b = await contract.getModuleVersion({
    name: 'dynamic-adapter',
    branch: 'default',
    version: '1.0.0'
  });
  expect(v_a).toMatchObject(v_b);
});

it('adds new version of identity-adapter', async () => {
  const v_a = {
    name: 'identity-adapter',
    branch: 'default',
    version: '1.0.0',
    title: 'identity Adapter',
    description: 'This is a identity adapter',
    icon: null,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [],
    interfaces: []
  };
  await contract.addModuleVersion({ moduleVersion: v_a });
  const v_b = await contract.getModuleVersion({
    name: 'identity-adapter',
    branch: 'default',
    version: '1.0.0'
  });
  expect(v_a).toMatchObject(v_b);
});

it('adds new version of twitter-adapter', async () => {
  const v_a = {
    name: 'twitter-adapter',
    branch: 'default',
    version: '1.0.0',
    title: 'twitter Adapter',
    description: 'This is a twitter adapter',
    icon: null,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [{ name: 'dynamic-adapter', branch: 'default', version: '1.0.0' }],
    interfaces: [{ name: 'identity-adapter', branch: 'default', version: '1.0.0' }]
  };
  await contract.addModuleVersion({ moduleVersion: v_a });
  const v_b = await contract.getModuleVersion({
    name: 'twitter-adapter',
    branch: 'default',
    version: '1.0.0'
  });
  expect(v_a).toMatchObject(v_b);
});

it('adds new version of twitter-adapter#new', async () => {
  const v_a = {
    name: 'twitter-adapter',
    branch: 'new',
    version: '1.0.0',
    title: 'twitter Adapter',
    description: 'This is a twitter adapter',
    icon: null,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [{ name: 'dynamic-adapter', branch: 'default', version: '1.0.0' }],
    interfaces: [{ name: 'identity-adapter', branch: 'default', version: '1.0.0' }]
  };
  await contract.addModuleVersion({ moduleVersion: v_a });
  const v_b = await contract.getModuleVersion({
    name: 'twitter-adapter',
    branch: 'new',
    version: '1.0.0'
  });
  expect(v_a).toMatchObject(v_b);
});

it('adds new version of twitter-adapter#legacy', async () => {
  const v_a = {
    name: 'twitter-adapter',
    branch: 'legacy',
    version: '1.0.0',
    title: 'twitter Adapter',
    description: 'This is a twitter adapter',
    icon: null,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [{ name: 'dynamic-adapter', branch: 'default', version: '1.0.0' }],
    interfaces: [{ name: 'identity-adapter', branch: 'default', version: '1.0.0' }]
  };
  await contract.addModuleVersion({ moduleVersion: v_a });
  const v_b = await contract.getModuleVersion({
    name: 'twitter-adapter',
    branch: 'legacy',
    version: '1.0.0'
  });
  expect(v_a).toMatchObject(v_b);
});

it('adds new version of instagram-adapter', async () => {
  const v_a = {
    name: 'instagram-adapter',
    branch: 'default',
    version: '1.0.0',
    title: 'instagram Adapter',
    description: 'This is a instagram adapter',
    icon: null,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [{ name: 'dynamic-adapter', branch: 'default', version: '1.0.0' }],
    interfaces: [{ name: 'identity-adapter', branch: 'default', version: '1.0.0' }]
  };
  await contract.addModuleVersion({ moduleVersion: v_a });
  const v_b = await contract.getModuleVersion({
    name: 'instagram-adapter',
    branch: 'default',
    version: '1.0.0'
  });
  expect(v_a).toMatchObject(v_b);
});

it('adds new version of identity-feature', async () => {
  const v_a = {
    name: 'identity-feature',
    branch: 'default',
    version: '1.0.0',
    title: 'Identity Feature',
    description: 'This is a identity feature',
    icon: EMPTY_REF,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [],
    interfaces: [{ name: 'identity-adapter', branch: 'default', version: '1.0.0' }]
  };
  await contract.addModuleVersion({ moduleVersion: v_a });
  const v_b = await contract.getModuleVersion({
    name: 'identity-feature',
    branch: 'default',
    version: '1.0.0'
  });
  expect(v_a).toMatchObject(v_b);
});

it('returns implemented interfaces of a module', async () => {
  const interfaces = await contract.getInterfacesOfModule({ name: 'twitter-adapter' });
  expect(interfaces).toMatchObject(['identity-adapter']);
});

it('returns branches of a module', async () => {
  const branches = await contract.getModuleBranches({ name: 'twitter-adapter' });
  expect(branches).toMatchObject(['default', 'new', 'legacy']);
});

it('returns modules', async () => {
  const modules = await contract.getModules();
  const names = modules.map(x => x.name);
  expect(names).toMatchObject(['dynamic-adapter', 'identity-adapter', 'twitter-adapter', 'instagram-adapter', 'identity-feature']);
});

it('returns names of modules', async () => {
  const names = await contract.getModuleNames();
  expect(names).toMatchObject(['dynamic-adapter', 'identity-adapter', 'twitter-adapter', 'instagram-adapter', 'identity-feature']);
});

it('returns version info by [name, branch, version]', async () => {
  const v_a = {
    name: 'identity-feature',
    branch: 'default',
    version: '1.0.0',
    title: 'Identity Feature',
    description: 'This is a identity feature',
    icon: EMPTY_REF,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [],
    interfaces: [{ name: 'identity-adapter', branch: 'default', version: '1.0.0' }]
  };
  const v_b = await contract.getModuleVersion({ name: 'identity-feature', branch: 'default', version: '1.0.0' });
  expect(v_a).toMatchObject(v_b);
});

it('returns null by non-existing [name, branch, version]', async () => {
  const result = await contract.getModuleVersion({ name: 'non-existing', branch: 'default', version: '1.0.0' });
  expect(result).toBeNull();
});

it('returns module info by [name]', async () => {
  const m_a = {
    moduleType: 1,
    name: 'identity-feature',
    owner: accountId
  };
  const m_b = await contract.getModuleInfoByName({ name: 'identity-feature' });
  expect(m_a).toMatchObject(m_b);
});

it('returns null info by non-existing [name]', async () => {
  const result = await contract.getModuleInfoByName({ name: 'non-existing' });
  expect(result).toBeNull();
});

it('returns null info by non-existing [name]', async () => {
  const result = await contract.getModuleInfoByNames({ names: ['dynamic-adapter', 'identity-adapter', 'twitter-adapter', 'instagram-adapter', 'identity-feature', 'non-existing'] });
  const names = result.map(x => x ? x.name : null);
  expect(names).toMatchObject(['dynamic-adapter', 'identity-adapter', 'twitter-adapter', 'instagram-adapter', 'identity-feature', null]);
});

it('creates twitter-adapter via facade', async () => {
  const mi_a = {
    // 1 - Feature, 2 - Adapter, 3 - Library, 4 - Interface
    moduleType: 2,
    name: 'twitter-adapter',
    owner: accountId
  }

  const vi_a = {
    name: 'twitter-adapter',
    branch: 'default',
    version: '1.0.1',
    title: 'twitter Adapter',
    description: 'This is a twitter adapter',
    icon: null,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [{ name: 'dynamic-adapter', branch: 'default', version: '1.0.0' }],
    interfaces: [{ name: 'identity-adapter', branch: 'default', version: '1.0.0' }]
  }

  await contract.addModuleWithContexts({
    contextIds: ['twitter.com', 'www.twitter.com', 'mobile.twitter.com'],
    mInfo: mi_a,
    vInfo: vi_a
  }, 300000000000000);
});

it('creates instagram-adapter via facade', async () => {
  const mi_a = {
    // 1 - Feature, 2 - Adapter, 3 - Library, 4 - Interface
    moduleType: 2,
    name: 'instagram-adapter',
    owner: accountId
  }

  const vi_a = {
    name: 'instagram-adapter',
    branch: 'default',
    version: '1.0.1',
    title: 'instagram Adapter',
    description: 'This is a instagram adapter',
    icon: null,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [{ name: 'dynamic-adapter', branch: 'default', version: '1.0.0' }],
    interfaces: [{ name: 'identity-adapter', branch: 'default', version: '1.0.0' }]
  }

  await contract.addModuleWithContexts({
    contextIds: ['instagram.com', 'www.instagram.com', 'mobile.instagram.com'],
    mInfo: mi_a,
    vInfo: vi_a
  }, 300000000000000);
});


it('creates identity-feature via facade', async () => {
  const mi_a = {
    // 1 - Feature, 2 - Adapter, 3 - Library, 4 - Interface
    moduleType: 1,
    name: 'identity-feature',
    owner: accountId
  }

  const vi_a = {
    name: 'identity-feature',
    branch: 'default',
    version: '1.0.1',
    title: 'identity-feature',
    description: 'This is a identity-feature',
    icon: null,
    reference: EMPTY_REF,
    docs: EMPTY_REF,
    dependencies: [{ name: 'twitter-adapter', branch: 'default', version: '1.0.1' }],
    interfaces: []
  }

  await contract.addModuleWithContexts({
    contextIds: ['identity-adapter'],
    mInfo: mi_a,
    vInfo: vi_a
  }, 300000000000000);
});

it('returns modules by context id and user', async () => {
  const result = await contract.getModuleInfo({
    ctxId: 'twitter.com',
    users: [accountId],
    maxBufLen: 0
  });

  const names = result.map(x => x.name);

  expect(names).toMatchObject([
    'twitter-adapter',
    'identity-feature',
    'identity-adapter'
  ]);
});

it('returns modules by context ids and users', async () => {
  const result = await contract.getModuleInfoBatch({
    ctxIds: ['twitter.com', 'instagram.com'],
    users: [accountId],
    maxBufLen: 0
  });

  const names = result.map(x => x.map(y => y.name));
  
  expect(names).toMatchObject([
    [
      'twitter-adapter',
      'identity-feature',
      'identity-adapter'
    ],
    [
      'instagram-adapter',
      'identity-feature',
      'identity-adapter'
    ]
  ]);
});