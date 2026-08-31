const readiness = {
    rabbitmq: false,
    kafka: false,
};


const isReady = () => {

    return Object.values(
        readiness
    ).every(
        (value) => value === true
    );
};


const setRabbitMQReady = (
    value
) => {

    readiness.rabbitmq = value;
};


const setKafkaReady = (
    value
) => {

    readiness.kafka = value;
};


module.exports = {
    readiness,
    isReady,
    setRabbitMQReady,
    setKafkaReady,
};