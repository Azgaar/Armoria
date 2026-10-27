import {MONGO_ID, MONGO_PASS} from "$env/static/private";
import {MongoDBConnector} from "./dbConnector";
import type {Coa} from "$lib/types/coa";
import type {ClaimProtection} from "$lib/server/claimPasswords";

const MONGO_URL = `mongodb+srv://${MONGO_ID}:${MONGO_PASS}@cluster0.auhmw.mongodb.net/armoria_api?retryWrites=true&w=majority`;
const claims = new MongoDBConnector(MONGO_URL, "armoria_api", "claims");
await claims.connect();

export type Claim = ClaimProtection & {name: string; coa: Coa; _id?: unknown};

export async function getClaim(name: string): Promise<Claim | null> {
  return (await claims.findOne({name})) as Claim | null;
}

export function setClaim(claim: Omit<Claim, "key" | "_id">) {
  // MongoDB's existing unique _id index arbitrates concurrent creation without
  // requiring an index migration on the legacy collection.
  return claims.insertOne({...claim, _id: `claim:${claim.name}`});
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
  return claims.updateOne(authorizedVersion(previous), {coa, ...(keyHash ? {keyHash} : {})}, ["key"]);
}

export function unclaim(previous: Claim) {
  return claims.deleteOne(authorizedVersion(previous));
}
