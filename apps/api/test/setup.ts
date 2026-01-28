import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

/**
 * Global test setup - runs before all tests
 */
beforeAll(async () => {
    // Use in-memory MongoDB for isolated tests
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to in-memory MongoDB');
});

/**
 * Cleanup after each test
 */
afterEach(async () => {
    // Clear all collections between tests
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

/**
 * Global test teardown - runs after all tests
 */
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('✅ Disconnected from in-memory MongoDB');
});
