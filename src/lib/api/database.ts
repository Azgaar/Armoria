import {MONGO_ID, MONGO_PASS} from "$env/static/private";
import {type Collection, MongoClient} from "mongodb";

const MONGO_URL = `mongodb+srv://${MONGO_ID}:${MONGO_PASS}@cluster0.auhmw.mongodb.net/armoria_api?retryWrites=true&w=majority`;
const DB_NAME = "armoria_api";
const COLLECTION_NAME = "claims";

let claims: Collection;
connectToDb();

export async function connectToDb() {
  const client = await MongoClient.connect(MONGO_URL).catch(console.error);
  if (client) claims = client.db(DB_NAME).collection(COLLECTION_NAME);
}

export function getClaim(name: string) {
  return claims.findOne({name});
}

type Claim = {
  name: string;
  coa: string;
  key?: string;
};

export function setClaim(claim: Claim) {
  return claims.insertOne(claim);
}

export function reclaim(claim: Claim) {
  return claims.updateOne({name: claim.name}, {$set: {coa: claim.coa}});
}

export function unclaim(name: string) {
  return claims.deleteOne({name});
}
