import { Connection, clusterApiUrl, PublicKey, Keypair } from "@solana/web3.js"
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile, NftWithToken,
} from "@metaplex-foundation/js"
import * as fs from "fs"
import bs58 from "bs58";

async function main() {
    const user = Keypair.fromSecretKey(
        bs58.decode(
        "2orj8RG3RThFsdtmdeSWwT8R2s8wfxz41FaNqentHuSMbuKv2xJU1x7SEdWZmkHyeUJXJrfCW8dCF9nrs2r27Rpx"
        )
    );

    const connection = new Connection(clusterApiUrl("devnet"));
    const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user));

    // //지갑별 조회
    // const nfts = await metaplex.nfts().findAllByOwner({owner: new PublicKey("C6a2PE6TyiKKQBcJB7QT9i4RWsa4hWHtLZyvpuGziMWU")});
    // console.log(nfts);

    // 크리에이터별 조회
    const nfts = await metaplex.nfts().findAllByCreator({creator: user.publicKey});
    console.log(nfts);
}


main();