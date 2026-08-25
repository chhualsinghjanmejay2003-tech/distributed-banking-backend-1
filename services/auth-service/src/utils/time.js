const parseDurationToSeconds = (duration) => {
    const match = duration.match(
        /^(\d+)([smhd])$/
    );

    if (!match) {
        throw new Error(
            `Invalid duration format: ${duration}`
        );
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 24 * 60 * 60,
    };

    return value * multipliers[unit];
};

module.exports = {
    parseDurationToSeconds,
};