const readiness = {
    mongodb: false,
    redis: false,
    rabbitmq: false,
    kafka: false,
};

const isReady = () => {
    return Object.values(readiness).every(
        (value) => value === true
    );
};

module.exports = {
    readiness,
    isReady,
};