import { Connection, clusterApiUrl, PublicKey, Keypair } from '@solana/web3.js';
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  NftWithToken,
  MetaplexFile,
} from '@metaplex-foundation/js';
import * as fs from 'fs';
import bs58 from 'bs58';

const tokenName = 'Token Name1';
const description = 'Description';
const symbol = 'SYMBOL';
const sellerFeeBasisPoints = 0;
const imageFile = 'test.png';
const imageFile2 = 'test2.png';

async function main() {
  //키페어를 만드는부분. 실제로는 프론트 지갑(팬텀 등)에서
  const user = Keypair.fromSecretKey(
    bs58.decode('52zoU9tRt6Fh39b6QTXMGVvuYgC4QxDo4KtLzEcD4xkHMn4jFocBvVMeeiLWq47dBSkki3nBTGzhycKtf8G7JJVB'),
  );

  //메타플렉스에 연결하는 부분
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

  //===================================create 할때
  // // 이미지 file to buffer
  // const buffer = fs.readFileSync('src/' + imageFile);
  // // buffer to metaplex file
  // const file = toMetaplexFile(buffer, imageFile);
  // // upload metadata and get metadata uri (off chain metadata=areweave)
  // const uri = await getOriginalUri(metaplex, file);
  // await createNft(metaplex, uri);

  //===================================transfer할때
  // const mintAddress = new PublicKey('3XRhv2tcpqMJDpfGeAxZYGimrZFiGzjW9CHEWfNszm7U'); // You can get this from the Solana Explorer URL
  // await transferNft(
  //   metaplex,
  //   mintAddress,
  //   user.publicKey,
  //   new PublicKey('C6a2PE6TyiKKQBcJB7QT9i4RWsa4hWHtLZyvpuGziMWU'),
  // );

  //===================================update 할때
  // const mintAddress = new PublicKey('3XRhv2tcpqMJDpfGeAxZYGimrZFiGzjW9CHEWfNszm7U'); // You can get this from the Solana Explorer URL
  // // 이미지 file to buffer
  // const buffer = fs.readFileSync('src/' + imageFile2);
  // const file = toMetaplexFile(buffer, imageFile2);
  // const uri = await getUpdatedUri(metaplex, file);
  // await updateNft(metaplex, uri, mintAddress);
}

async function getOriginalUri(metaplex: Metaplex, file: MetaplexFile) {
  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log('image uri:', imageUri);

  const { uri } = await metaplex.nfts().uploadMetadata({
    name: tokenName, //콜렉션 이름은 이걸로 형성됨
    description: description,
    image: imageUri, //변경가능
    symbol: 'SBL', //변경가능
    attributes: [
      { trait_type: 'Layer-1', value: '0' }, //변경가능
      { trait_type: 'Layer-2', value: '0' }, //변경가능
    ],
  });
  return uri;
}

async function getUpdatedUri(metaplex: Metaplex, file: MetaplexFile) {
  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log('image uri:', imageUri);

  const { uri } = await metaplex.nfts().uploadMetadata({
    name: 'tokenName2', //콜렉션 이름은 이걸로 형성됨
    description: 'description updated',
    image: imageUri, //변경가능
    symbol: 'SBL2', //변경가능
    attributes: [
      { trait_type: 'Layer-1', value: '1' }, //변경가능
      { trait_type: 'Layer-2', value: '2' }, //변경가능
      { trait_type: 'Layer-3', value: '3' }, //변경가능
    ],
  });
  return uri;
}

// create NFT
async function createNft(metaplex: Metaplex, uri: string): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: 'tokenName_create', //각 토큰 이름은 이걸로 형성됨
      sellerFeeBasisPoints: sellerFeeBasisPoints,
      symbol: symbol,
    },
    { commitment: 'finalized' },
  );

  console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);

  return nft;
}
async function updateNft(metaplex: Metaplex, uri: string, mintAddress: PublicKey) {
  // get "NftWithToken" type from mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  // omit any fields to keep unchanged
  await metaplex.nfts().update({
    nftOrSft: nft,
    name: 'tokenName_create2', //각 토큰 이름은 이걸로 형성됨
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
