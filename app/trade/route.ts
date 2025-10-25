import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from "mongodb";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

async function getMongoClient() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not set in environment");
    }

    if (!global._mongoClientPromise) {
        const client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
}

export async function GET() {
    try {
        const client = await getMongoClient();
        const db = client.db("trader");
        const coll = db.collection("trades");

        const trades = await coll.find({})
            .sort({ createdAt: -1 })
            .toArray();

        return NextResponse.json(trades);
    } catch (error) {
        console.error("Error fetching trades:", error);
        return NextResponse.json({ message: "Error fetching trades" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const client = await getMongoClient();
        const db = client.db("trader");
        const coll = db.collection("trades");

        const result = await coll.insertOne({
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        });

        return NextResponse.json({ message: "Trade saved", id: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error("Error processing trade data:", error);
        return NextResponse.json({ message: "Error processing trade data" }, { status: 500 });
    }
}