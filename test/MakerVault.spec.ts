import { expect } from "chai";
import { BigNumber } from "ethers";
import hre, { deployments, waffle } from "hardhat";

const AddressZero = "0x0000000000000000000000000000000000000000";

describe("DP: Maker", async () => {
  const [user] = waffle.provider.getWallets();

  const baseSetup = deployments.createFixture(async () => {
    await deployments.fixture();
    const urn = 123;
    const VAT = await hre.ethers.getContractFactory("MockVat");
    const vat = await VAT.deploy();
    const CDPManager = await hre.ethers.getContractFactory("MockCDPManager");
    const cdpManager = await CDPManager.deploy(vat.address);
    const Spotter = await hre.ethers.getContractFactory("MockSpot");
    const spotter = await Spotter.deploy();
    const Dai = await hre.ethers.getContractFactory("TestToken");
    const dai = await Dai.deploy(18);
    const DaiJoin = await hre.ethers.getContractFactory("DaiJoin");
    const daiJoin = await DaiJoin.deploy(vat.address, dai.address);
    const DsProxy = await hre.ethers.getContractFactory("DssProxy");
    const dsProxy = await DsProxy.deploy(user.address);
    const DsProxyActions = await hre.ethers.getContractFactory(
      "DssProxyActions"
    );
    const dsProxyActions = await DsProxyActions.deploy();
    const Adapter = await hre.ethers.getContractFactory("MakerVaultAdapter");
    const adapter = await Adapter.deploy(
      dai.address, // assetDebt
      cdpManager.address, // cdpManager
      daiJoin.address, // daiJoin
      dsProxy.address, // dsProxy
      dsProxyActions.address, // dsProxyActions
      spotter.address, // spotter
      3000000000000000000000000000n, // ratio target
      2994000000000000000000000000n, // ratio trigger
      urn // vault
    );

    await adapter.setAssetDebt(AddressZero);

    return {
      adapter,
      cdpManager,
      spotter,
      urn,
      vat,
    };
  });

  it("Returns Correct Ratio", async () => {
    const { adapter } = await baseSetup();
    const ratio = await adapter.ratio();
    const expectedRatio = BigNumber.from(3235057286664591397522280128n);
    expect(ratio).to.equal(expectedRatio);
  });

  it("Returns Correct Delta", async () => {
    const { adapter } = await baseSetup();
    const delta = await adapter.delta();
    const expectedDelta = BigNumber.from(850381492464913306532836n);
    expect(delta).to.equal(expectedDelta);
  });
});
