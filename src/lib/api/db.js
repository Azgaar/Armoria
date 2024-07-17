import {MongoClient} from "mongodb";

const MONGO_ID = process.env.MONGO_ID;
const MONGO_PASS = process.env.MONGO_PASS;
const MONGO_URL = `mongodb+srv://${MONGO_ID}:${MONGO_PASS}@cluster0.auhmw.mongodb.net/armoria_api?retryWrites=true&w=majority`;
const DB_NAME = "armoria_api";
const COLLECTION_NAME = "claims";

let claims;
try {
  const client = await MongoClient.connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
  claims = client.db(DB_NAME).collection(COLLECTION_NAME);
}
catch(err) {
  console.error(err);
}

export function isConnected() {
  return !!claims;
}

export async function getClaim(name) {
  return claims.findOne({name});
}

export async function setClaim(claim) {
  return claims.insertOne(claim);
}

export async function reclaim(claim) {
  return claims.updateOne({name: claim.name}, {$set: {coa: claim.coa}});
}

export async function unclaim(name) {
  return claims.deleteOne({name});
}
