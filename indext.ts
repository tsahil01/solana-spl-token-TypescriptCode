import { burn, createAccount, createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
// add your secret key here
const secretKey = []
const ownerKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

async function createNewToken() {
    const mint = await createMint(
        connection,
        ownerKeypair,
        ownerKeypair.publicKey,
        ownerKeypair.publicKey,
        9
    );

    console.log("New token created: ", mint);

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        ownerKeypair,
        mint,
        ownerKeypair.publicKey,
    )

    const mintTokens = await mintTo(
        connection,
        ownerKeypair,
        mint,
        tokenAccount.address,
        ownerKeypair.publicKey,
        30 ** 9,
    );
    console.log("Tokens minted: ", mintTokens);
}

async function sendTokens(mint: string, destination: string, amount: number) {
    const mintPublicKey = new PublicKey(mint);
    const destinationPublicKey = new PublicKey(destination);

    const createAssociateToken = await getOrCreateAssociatedTokenAccount(
        connection,
        ownerKeypair,
        mintPublicKey,
        destinationPublicKey,
    )

    console.log("Token account created: ", createAssociateToken);

    const transfer = await mintTo(
        connection,
        ownerKeypair,
        mintPublicKey,
        createAssociateToken.address,
        ownerKeypair.publicKey,
        amount
    );

    console.log("Tokens sent: ", transfer);
}

async function transferTokens(mint: string, source: string, destination: string, amount: number) {
    const mintPublicKey = new PublicKey(mint);
    const sourcePublicKey = new PublicKey(source);
    const destinationPublicKey = new PublicKey(destination);

    const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        ownerKeypair,
        mintPublicKey,
        sourcePublicKey,
    )

    const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        ownerKeypair,
        mintPublicKey,
        destinationPublicKey,
    )

    const transferTokens = await transfer(
        connection,
        ownerKeypair,
        sourceTokenAccount.address,
        destinationTokenAccount.address,
        ownerKeypair.publicKey,
        amount
    )

    console.log("Tokens sent: ", transferTokens);
}

async function burnToken(mint: string, source: string, amount: number) {
    const mintPublicKey = new PublicKey(mint);
    const sourcePublicKey = new PublicKey(source);

    console.log("Mint: ", mintPublicKey.toBase58());
    console.log("Source: ", sourcePublicKey.toBase58());
    console.log("Owner: ", ownerKeypair.publicKey.toBase58());

    // Fetch the source token account
    const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        ownerKeypair,
        mintPublicKey,
        sourcePublicKey,
    );

    // Check the balance before burning
    const accountInfo = await connection.getTokenAccountBalance(sourceTokenAccount.address);
    console.log("Current balance: ", accountInfo.value.amount);

    if (parseInt(accountInfo.value.amount) < amount) {
        console.error("Insufficient tokens to burn.");
        return;
    }

    // Attempt to burn the tokens
    const burnTokens = await burn(
        connection,
        ownerKeypair,
        sourceTokenAccount.address,
        mintPublicKey,
        ownerKeypair.publicKey,
        amount
    );

    console.log("Tokens burned: ", burnTokens);
}

async function sendTokenToOwnerAndBurnToken(mint: string, source: string, amount: number) {
    const mintPublicKey = new PublicKey(mint);
    const sourcePublicKey = new PublicKey(source);

    const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        ownerKeypair,
        mintPublicKey,
        sourcePublicKey,
    );

    const ownerTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        ownerKeypair,
        mintPublicKey,
        ownerKeypair.publicKey,
    );

    const transferTokens = await transfer(
        connection,
        ownerKeypair,
        sourceTokenAccount.address,
        ownerTokenAccount.address,
        ownerKeypair.publicKey,
        amount
    );

    console.log("Tokens sent: ", transferTokens);

    const burnTokens = await burn(
        connection,
        ownerKeypair,
        ownerTokenAccount.address,
        mintPublicKey,
        ownerKeypair.publicKey,
        amount
    );

    console.log("Tokens burned: ", burnTokens);

}

// createNewToken();
// sendTokens("mint", "destination", amount);
// transferTokens("mint", "source", "destination", amount);
// burnToken("mint", "source", amount);
// sendTokenToOwnerAndBurnToken("mint", "source", amount);