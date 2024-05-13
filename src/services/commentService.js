

const BaseRepository = require("./baseRepoService")
const Comment = require("../models/commentModel");
const logger = require("../config/logger");

/** Comment Service Class - Manage every Comment related operation */
class CommentService extends BaseRepository {

    constructor() {
        super(Comment)
    }
  
}

module.exports = CommentService;