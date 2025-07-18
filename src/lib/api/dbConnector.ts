import {Collection, type DeleteResult, type Document, type InsertOneResult, MongoClient, type UpdateResult} from "mongodb";

export class MongoDBConnector {
  private client: MongoClient;
  private collection: Collection<Document> | null = null;
  private readonly uri: string;
  private readonly dbName: string;
  private readonly collectionName: string;

  constructor(uri: string, dbName: string, collectionName: string) {
    this.uri = uri;
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.client = new MongoClient(this.uri);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      const db = this.client.db(this.dbName);
      this.collection = db.collection(this.collectionName);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
      throw error;
    }
  }

  async insertOne(document: Document): Promise<InsertOneResult<Document>> {
    if (!this.collection) throw new Error("Not connected to MongoDB");

    try {
      return await this.collection.insertOne(document);
    } catch (error) {
      console.error("Error inserting document:", error);
      throw error;
    }
  }

  async findOne(query: Document): Promise<Document | null> {
    if (!this.collection) throw new Error("Not connected to MongoDB");

    try {
      return await this.collection.findOne(query);
    } catch (error) {
      console.error("Error finding document:", error);
      throw error;
    }
  }

  async updateOne(filter: Document, update: Document): Promise<UpdateResult> {
    if (!this.collection) throw new Error("Not connected to MongoDB");

    try {
      return await this.collection.updateOne(filter, {$set: update});
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  async deleteOne(filter: Document): Promise<DeleteResult> {
    if (!this.collection) throw new Error("Not connected to MongoDB");

    try {
      return await this.collection.deleteOne(filter);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }
}
