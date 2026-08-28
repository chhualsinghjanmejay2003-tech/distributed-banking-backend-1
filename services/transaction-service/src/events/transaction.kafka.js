const {
    producer,
} = require("../config/kafka");

const TOPIC =
    "banking.transactions";

const publishTransactionEvent = async (
    eventType,
    transaction
) => {
    const event = {
        eventType,
        transactionId:
            transaction.transactionId,
        type: transaction.type,
        sourceAccountId:
            transaction.sourceAccountId,
        destinationAccountId:
            transaction.destinationAccountId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        createdAt: transaction.createdAt,
    };

    await producer.send({
        topic: TOPIC,
        messages: [
            {
                key:
                    transaction.transactionId,

                value:
                    JSON.stringify(event),
            },
        ],
    });
};

module.exports = {
    publishTransactionEvent,
    TOPIC,
};