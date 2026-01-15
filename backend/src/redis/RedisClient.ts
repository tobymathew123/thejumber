import Redis from 'ioredis';

class RedisClient {
    private static instance: RedisClient;
    private client: Redis;
    private subscriber: Redis;
    private publisher: Redis;

    private constructor() {
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
        };

        this.client = new Redis(redisConfig);
        this.subscriber = new Redis(redisConfig);
        this.publisher = new Redis(redisConfig);

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.client.on('connect', () => {
            console.log('✅ Redis client connected');
        });

        this.client.on('error', (err) => {
            console.error('❌ Redis client error:', err);
        });

        this.subscriber.on('connect', () => {
            console.log('✅ Redis subscriber connected');
        });

        this.publisher.on('connect', () => {
            console.log('✅ Redis publisher connected');
        });
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public getClient(): Redis {
        return this.client;
    }

    public getSubscriber(): Redis {
        return this.subscriber;
    }

    public getPublisher(): Redis {
        return this.publisher;
    }

    public async disconnect(): Promise<void> {
        await Promise.all([
            this.client.quit(),
            this.subscriber.quit(),
            this.publisher.quit(),
        ]);
        console.log('🔌 Redis connections closed');
    }

    // Helper methods for common operations
    public async setWithExpiry(key: string, value: string, expirySeconds: number): Promise<void> {
        await this.client.setex(key, expirySeconds, value);
    }

    public async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    public async delete(key: string): Promise<number> {
        return await this.client.del(key);
    }

    public async exists(key: string): Promise<number> {
        return await this.client.exists(key);
    }

    public async publish(channel: string, message: string): Promise<number> {
        return await this.publisher.publish(channel, message);
    }

    public async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
        await this.subscriber.subscribe(channel);
        this.subscriber.on('message', (ch, msg) => {
            if (ch === channel) {
                callback(msg);
            }
        });
    }
}

export default RedisClient;
