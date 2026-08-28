const {
    getChannel,
} = require("../config/rabbitmq");

const EXCHANGE_NAME =
    "banking.transaction.events";

const EXCHANGE_TYPE = "topic";

const publishTransactionEvent = async (
    eventType,
    transaction
) => {
    const channel = getChannel();

    await channel.assertExchange(
        EXCHANGE_NAME,
        EXCHANGE_TYPE,
        {
            durable: true,
        }
    );

    const message = {
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

    channel.publish(
        EXCHANGE_NAME,
        eventType,
        Buffer.from(
            JSON.stringify(message)
        ),
        {
            persistent: true,
            contentType: "application/json",
        }
    );
};

module.exports = {
    publishTransactionEvent,
};