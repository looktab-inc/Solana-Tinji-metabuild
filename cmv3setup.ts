import { keypairIdentity, Metaplex, toBigNumber } from "@metaplex-foundation/js";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

async function main() {
    const authority = Keypair.fromSecretKey(
        bs58.decode(
        "2orj8RG3RThFsdtmdeSWwT8R2s8wfxz41FaNqentHuSMbuKv2xJU1x7SEdWZmkHyeUJXJrfCW8dCF9nrs2r27Rpx"
        )
    );

    const connection = new Connection(clusterApiUrl("devnet"));
    const metaplex = new Metaplex(connection);
    metaplex.use(keypairIdentity(authority));

    //1.Metaplex Certified Collections 만들기
    // Create the Collection NFT.
    const { nft: collectionNft } = await metaplex.nfts().create({
            name: '3Collection',
            uri: 'https://example.com/path/to/some/json/metadata.json',
            sellerFeeBasisPoints: 0,
            isCollection: true,
            updateAuthority: authority,
        });
    console.log(collectionNft.address.toBase58());

    // 2.캔디머신 만들기.
    const collectionNFTAddr = new PublicKey(collectionNft.address.toBase58());
    const { candyMachine } = await metaplex.candyMachines().create({
        itemsAvailable: toBigNumber(5000), //이 콜렉션을 몇개나 발행할 것인지 
        sellerFeeBasisPoints: 0, // 0%
        collection: {
        address: collectionNFTAddr,
        updateAuthority: authority,
        },
        symbol: "GOD",
        isMutable: true,
        creators: [
            { address: authority.publicKey, share: 100 },
        ],
        itemSettings: {
            type: 'configLines',
            prefixName: 'My New NFT #$ID+1$',
            nameLength: 0,
            prefixUri: 'https://arweave.net/$ID$.json',
            uriLength: 43,
            isSequential: true,
        },
    });

    // //3. 캔디머신에 실제 데이터 넣기(5천개 설정했으면 5천개 밀어넣기)
    // await metaplex.candyMachines().insertItems({
    //     candyMachine,
    //     items: [
    //     { name: "My NFT #1", uri: "https://example.com/nft1.json" },
    //     { name: "My NFT #2", uri: "https://example.com/nft2.json" },
    //     { name: "My NFT #3", uri: "https://example.com/nft3.json" },
    //     ],
    // });

    // //4.로드 잘됏나 확인
    // console.log(candyMachine.itemsLoaded);
}

main();