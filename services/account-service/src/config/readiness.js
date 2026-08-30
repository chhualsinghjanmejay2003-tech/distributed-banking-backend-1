const readiness = {
    mongodb: false,
};

const isReady = () => {
    return readiness.mongodb === true;
};

module.exports = {
    readiness,
    isReady,
};