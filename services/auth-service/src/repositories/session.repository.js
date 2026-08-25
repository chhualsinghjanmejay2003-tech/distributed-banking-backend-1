const { redisClient } = require("../config/redis");

const buildKey = (refreshToken) => {
    return `refresh_session:${refreshToken}`;
};

const createSession = async (
    refreshToken,
    sessionData,
    ttlSeconds
) => {
    const key = buildKey(refreshToken);

    await redisClient.set(
        key,
        JSON.stringify(sessionData),
        {
            EX: ttlSeconds,
        }
    );
};

const getSession = async (refreshToken) => {
    const key = buildKey(refreshToken);

    const data = await redisClient.get(key);

    if (!data) {
        return null;
    }

    return JSON.parse(data);
};

const deleteSession = async (refreshToken) => {
    const key = buildKey(refreshToken);

    await redisClient.del(key);
};

module.exports = {
    createSession,
    getSession,
    deleteSession,
};