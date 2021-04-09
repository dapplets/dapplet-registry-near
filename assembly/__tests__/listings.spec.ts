import { addContextId, getAllListers, getAllContextIds, getAllModules, getContextIdsByModule, getModulesByContextId, removeContextId } from '../listings';
import { Context } from "near-sdk-as";

describe("Greeting ", () => {
    it("should add context ids", () => {
        const lister = Context.sender;

        addContextId("twitter.com", "twitter-adapter");
        addContextId("www.twitter.com", "twitter-adapter");
        addContextId("mobile.twitter.com", "twitter-adapter"); 

        expect(getContextIdsByModule(lister, "twitter-adapter")).toHaveLength(3);
        expect(getModulesByContextId(lister, "twitter.com")).toHaveLength(1);
        expect(getModulesByContextId(lister, "www.twitter.com")).toHaveLength(1);
        expect(getModulesByContextId(lister, "mobile.twitter.com")).toHaveLength(1);
        expect(getAllListers()).toHaveLength(1);
        expect(getAllContextIds(lister)).toHaveLength(3);
        expect(getAllModules(lister)).toHaveLength(1);
    });

    it("should remove context ids", () => {
        const lister = Context.sender;

        addContextId("twitter.com", "twitter-adapter");
        addContextId("www.twitter.com", "twitter-adapter");
        addContextId("mobile.twitter.com", "twitter-adapter"); 

        
        removeContextId("twitter.com", "twitter-adapter");
        expect(getContextIdsByModule(lister, "twitter-adapter")).toHaveLength(2);
        expect(getModulesByContextId(lister, "twitter.com")).toHaveLength(0);
        expect(getAllContextIds(lister)).toHaveLength(2);
        expect(getAllModules(lister)).toHaveLength(1);

        
        removeContextId("www.twitter.com", "twitter-adapter");
        expect(getContextIdsByModule(lister, "twitter-adapter")).toHaveLength(1);
        expect(getModulesByContextId(lister, "www.twitter.com")).toHaveLength(0);
        expect(getAllContextIds(lister)).toHaveLength(1);
        expect(getAllModules(lister)).toHaveLength(1);

        removeContextId("mobile.twitter.com", "twitter-adapter");
        expect(getContextIdsByModule(lister, "twitter-adapter")).toHaveLength(0);
        expect(getModulesByContextId(lister, "mobile.twitter.com")).toHaveLength(0);
        expect(getAllContextIds(lister)).toHaveLength(0);
        expect(getAllModules(lister)).toHaveLength(0);

        expect(getAllListers()).toHaveLength(1);
    });
});

