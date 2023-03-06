import { Connection, clusterApiUrl, PublicKey, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile, NftWithToken } from '@metaplex-foundation/js';
import * as fs from 'fs';
import bs58 from 'bs58';

const tokenName = 'Token Name1';
const description = 'Description';
const symbol = 'SYMBOL';
const sellerFeeBasisPoints = 0;
const imageFile = 'test.png';

async function main() {
  const user = Keypair.fromSecretKey(
    bs58.decode('2orj8RG3RThFsdtmdeSWwT8R2s8wfxz41FaNqentHuSMbuKv2xJU1x7SEdWZmkHyeUJXJrfCW8dCF9nrs2r27Rpx'),
  );

  const connection = new Connection(clusterApiUrl('devnet'));
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      }),
    );

  // file to buffer
  const buffer = fs.readFileSync('src/' + imageFile);

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, imageFile);

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log('image uri:', imageUri);

  // upload metadata and get metadata uri (off chain metadata=areweave)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: tokenName,
    description: description,
    image: imageUri,
    symbol: 'SBL',
    attributes: [
      { trait_type: 'Layer-1', value: '0' },
      { trait_type: 'Layer-2', value: '0' },
    ],
  });

  console.log('metadata uri:', uri);

  //===================================create 할때
  // await createNft(metaplex, uri);

  //===================================update 할때
  const mintAddress = new PublicKey('5u2LxjBfNBLVPXPTH6k3TJ2ZFaeAZg2EmSn61MA6C5Sa'); // You can get this from the Solana Explorer URL
  await updateNft(metaplex, uri, mintAddress);

  //===================================transfer할때
  // const mintAddress = new PublicKey('5dqHx2gW3EnJi6wpCN6RqegDjWZDUqkMDzerYsL9pNWc'); // You can get this from the Solana Explorer URL
  // await transferNft(
  //   metaplex,
  //   mintAddress,
  //   user.publicKey,
  //   new PublicKey('C6a2PE6TyiKKQBcJB7QT9i4RWsa4hWHtLZyvpuGziMWU'),
  // );
}

// create NFT
async function createNft(metaplex: Metaplex, uri: string): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create({
    uri: uri,
    name: tokenName,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
    symbol: symbol,
  });

  console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);

  return nft;
}
async function updateNft(metaplex: Metaplex, uri: string, mintAddress: PublicKey) {
  // get "NftWithToken" type from mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  // omit any fields to keep unchanged
  await metaplex.nfts().update({
    nftOrSft: nft,
    name: tokenName,
    symbol: symbol,
    uri: uri,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
  });

  console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
}

async function transferNft(metaplex: Metaplex, mintAddress: PublicKey, from: PublicKey, to: PublicKey) {
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  await metaplex.nfts().transfer({
    nftOrSft: nft,
    fromOwner: from,
    toOwner: to,
  });
}

main();
