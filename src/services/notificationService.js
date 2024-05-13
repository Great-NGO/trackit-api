

const BaseRepository = require("./baseRepoService")
const Notification = require("../models/notificationModel");
const logger = require("../config/logger");

/** Notification Service Class - Manage every Notification related operation */
class NotificationService extends BaseRepository {

    constructor() {
        super(Notification)
    }
  
}

module.exports = NotificationService;