

const BaseRepository = require("./baseRepoService")
const Issue = require("../models/issueModel");
const logger = require("../config/logger");

/** Issue Service Class - Manage every Issue related operation */
class IssueService extends BaseRepository {

    constructor() {
        super(Issue)
    }
  
}

module.exports = IssueService;