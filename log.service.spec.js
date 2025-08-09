const { Injectable } = require('@nestjs/common');

@Injectable()
class LogService {
  extractMatchId(logLine) {
    const regex = /New match (\d+) has started/;
    const match = logLine.match(regex);
    return match ? match[1] : null;
  }
}

module.exports = LogService;