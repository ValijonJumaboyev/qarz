// dbManager.js
import mongoose from "mongoose";

const connections = {}; // cache shop DB connections

/**
 * 
 * @param {string} shopDbName 
 * @returns 
 */

export function getShopDb(shopDbName) {
    if (connections[shopDbName]) {
        return connections[shopDbName];
    }

    const db = mongoose.connection.useDb(shopDbName, { useCache: true });
    connections[shopDbName] = db;
    return db;
}
