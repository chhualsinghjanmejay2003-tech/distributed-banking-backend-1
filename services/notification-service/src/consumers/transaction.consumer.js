const {
    EXCHANGE_NAME,
    QUEUE_NAME,
} = require("../config/rabbitmq");

const startTransactionConsumer = async (
    channel
) => {
    await channel.consume(
        QUEUE_NAME,
        async (message) => {
            if (!message) {
                return;
            }

            try {
                const event =
                    JSON.parse(
                        message.content.toString()
                    );

                console.log(
                    "Transaction event received:"
                );

                console.log(event);

                /*
                 * Notification logic will be
                 * implemented here later.
                 *
                 * For now, we simply consume
                 * and acknowledge the event.
                 */

                channel.ack(message);
            } catch (error) {
                console.error(
                    "Failed to process transaction event:",
                    error.message
                );

                /*
                 * Reject the message without
                 * requeueing it.
                 */
                channel.nack(
                    message,
                    false,
                    false
                );
            }
        }
    );

    console.log(
        `Listening for transaction events from ${EXCHANGE_NAME}`
    );
};

module.exports = {
    startTransactionConsumer,
};