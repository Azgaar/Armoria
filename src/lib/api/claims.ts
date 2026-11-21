import {env} from "#lib/server/env.ts";
import {ClaimsUnavailableError} from "./claimErrors";
import {MongoDBConnector} from "./dbConnector";
import type {Coa} from "#lib/types/coa.js";
import type {ClaimProtection} from "#lib/server/claimPasswords.ts";

let connection: Promise<MongoDBConnector> | undefined;

// Imports and database-independent requests must never initialize MongoDB.
function getClaims(): Promise<MongoDBConnector> {
  if (connection) return connection;
  const {MONGO_ID, MONGO_PASS} = env;
  if (!MONGO_ID || !MONGO_PASS) return Promise.reject(new ClaimsUnavailableError());
  const uri = `mongodb+srv://${encodeURIComponent(MONGO_ID)}:${encodeURIComponent(MONGO_PASS)}@cluster0.auhmw.mongodb.net/armoria_api?retryWrites=true&w=majority`;
  const claims = new MongoDBConnector(uri, "armoria_api", "claims");
  connection = claims
    .connect()
    .then(() => claims)
    .catch(async () => {
      await claims.disconnect().catch(() => {});
      connection = undefined;
      throw new ClaimsUnavailableError();
    });
  return connection;
}

async function withClaims<T>(operation: (claims: MongoDBConnector) => Promise<T>): Promise<T> {
  const claims = await getClaims();
  try {
    return await operation(claims);
  } catch (error) {
    // Preserve duplicate-key conflicts for the mutation handler; hide all other
    // driver errors, which can contain connection details or submitted records.
    if (error && typeof error === "object" && "code" in error && error.code === 11000) throw error;
    throw new ClaimsUnavailableError();
  }
}

export type Claim = ClaimProtection & {name: string; coa: Coa; _id?: unknown};

export async function getClaim(name: string): Promise<Claim | null> {
  return (await withClaims(claims => claims.findOne({name}))) as Claim | null;
}

export function setClaim(claim: Omit<Claim, "key" | "_id">) {
  // MongoDB's existing unique _id index arbitrates concurrent creation without
  // requiring an index migration on the legacy collection.
  return withClaims(claims => claims.insertOne({...claim, _id: `claim:${claim.name}`}));
}

function authorizedVersion(claim: Claim) {
  return {
    name: claim.name,
    ...(claim._id !== undefined ? {_id: claim._id} : {}),
    key: Object.hasOwn(claim, "key") ? claim.key : {$exists: false},
    keyHash: Object.hasOwn(claim, "keyHash") ? claim.keyHash : {$exists: false}
  };
}

export function reclaim(previous: Claim, coa: Coa, keyHash?: string) {
  return withClaims(claims => claims.updateOne(authorizedVersion(previous), {coa, ...(keyHash ? {keyHash} : {})}, ["key"]));
}

export function unclaim(previous: Claim) {
  return withClaims(claims => claims.deleteOne(authorizedVersion(previous)));
}
