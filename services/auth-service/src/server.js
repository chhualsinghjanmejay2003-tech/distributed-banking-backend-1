const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
    console.log(
        `${env.nodeEnv} auth-service running on port ${env.port}`
    );
});