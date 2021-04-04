import { addModuleInfo, ModuleInfo, StorageRef, VersionInfoDto, DependencyDto } from '..';
import { storage, Context } from "near-sdk-as";

describe("Greeting ", () => {
    it("should be set and read", () => {
        addModuleInfo(
            [],
            new ModuleInfo(
                1,
                "twitter-near-redirector.dapplet-base.eth",
                "Twitter NEAR Redirector",
                "Add redirections for tweets",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                [],
                new StorageRef(new Uint8Array(0), [new Uint8Array(0)]),
                0
            ),
            [
                new VersionInfoDto(
                    1,
                    "default",
                    0,
                    1,
                    1,
                    0,
                    new StorageRef(new Uint8Array(0), [new Uint8Array(0)]),
                    [
                        new DependencyDto(
                            "twitter-adapter.dapplet-base.eth",
                            "default",
                            0,
                            5,
                            1
                        )
                    ],
                    []
                )
            ],
            "buidl.testnet"
        );
    });
});
