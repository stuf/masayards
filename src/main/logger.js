// @flow
import winston from 'winston';

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: `${process.env.HOME}/.masayards/main.log` })
  ]
});

export default logger;
