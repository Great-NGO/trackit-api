const { Model, Types } = require("mongoose");
const { translateError } = require("../utils/translateError");
const logger = require("../config/logger");
const log = require("../utils/logger");

// BaseRepository class provides CRUD methods which can be inherited by other repository classes.
class BaseRepository {
    constructor(model) {
        this.model = model;
        this.defaultPageSize = 10;
    }

    // Retrieve all documents from the database.
    async getAll() {
        try {
            const foundAll = await this.model.find();
            return [true, foundAll, "All Data returned", { status: 200 }];
        } catch (error) {
            const errResponse = translateError(error, "getting all data");
            logger.error("Base Repository Get All", errResponse);
            return errResponse;
        }
    }

    // Retrieve a document by its ID.
    async getById(id) {
        try {
            let data = await this.model.findById(id);
            if (data) {
                return [true, data, "Data returned successfully", { status: 200 }];
            }
            return [false, null, "Not found.", { status: 404 }];
        } catch (error) {
            const errResponse = translateError(error, "finding data by id");
            logger.error("Base Repository Get by Id", errResponse);
            return errResponse;
        }
    }

    // Retrieve a single document by a query condition.
    async getOne(queryCondition) {
        try {
            const data = await this.model.findOne(queryCondition);
            if (data) {
                return [true, data, "Data returned successfully", { status: 200 }];
            }
            return [false, null, "Not found.", { status: 404 }];
        } catch (error) {
            const errResponse = translateError(error, "finding data.");
            logger.error("Base Repository Get One", errResponse);
            return errResponse;
        }
    }

    // Create a new document.
    async create(data) {
        try {
            const createdData = await this.model.create(data);
            if (createdData) {
                return [true, createdData, 'Success', { status: 201 }];
            }
            return [false, null, 'Failed to create data', { status: 400 }];
        } catch (error) {
            const errResponse = translateError(error, "creating data.");
            logger.error("Base Repository Create method", errResponse);
            return errResponse;
        }
    }

    // Update a document by its ID.
    async update(id, data) {
        try {
            const updatedData = await this.model.findByIdAndUpdate(id, data, { new: true });
            if (updatedData) {
                return [true, updatedData, 'Update Success', { status: 200 }];
            }
            return [false, null, 'Update Failed', { status: 400 }];
        } catch (error) {
            const errResponse = translateError(error, "updating data");
            logger.error("Base Repository Update method", errResponse);
            return errResponse;
        }
    }

    // Delete a document by its ID.
    async delete(id) {
        try {
            const deletedData = await this.model.findByIdAndDelete(id);
            if (deletedData) {
                return [true, deletedData, 'Delete Successful', { status: 200 }];
            }
            return [false, null, 'Resource not found. Delete Failed!', { status: 404 }];
        } catch (error) {
            const errResponse = translateError(error, "deleting");
            logger.error("Base Repository Delete method", errResponse);
            return errResponse;
        }
    }

    // Find all documents by a query condition.
    async findAllByCondition(query) {
        try {
            const data = await this.model.find(query);
            return [true, data, 'Data retrieved successfully', { status: 200 }];
        } catch (error) {
            const errResponse = translateError(error, "finding data");
            logger.error("Base Repository findAllByCondition method", errResponse);
            return errResponse;
        }
    }

    // Find all documents with pagination support.
    async findAllPaginated(paginationOptions) {
        try {
            const { page = 1, limit = this.defaultPageSize } = paginationOptions || {}
            const totalCount = await this.model.countDocuments();
            const totalPages = Math.ceil(totalCount / limit);
            const data = await this.model.find().skip((page - 1) * limit).limit(limit);
            const paginatedData = {
                data, 
                currentPage: page,
                totalCount,
                totalPages
            };
            return [true, paginatedData, "Data returned successfully.", { status: 200 }];
        } catch (error) {
            const errResponse = translateError(error, "finding all data");
            logger.error("Base Repository FindAllPaginated method", errResponse);
            return errResponse;
        }
    }

    // Find all documents by a query condition with pagination support.
    async findAllByConditionPaginated(query, paginationOptions) {
        try {
            const { page = 1, limit = this.defaultPageSize } = paginationOptions || {};
            const totalCount = await this.model.countDocuments(query);
            const totalPages = Math.ceil(totalCount / limit);
            const data = await this.model.find(query).skip((page - 1) * limit).limit(limit);
            const paginatedData = {
                data,
                currentPage: page,
                totalCount,
                totalPages
            };
            return [true, paginatedData, "Data returned successfully.", { status: 200 }];
        } catch (error) {
            const errResponse = translateError(error, "retrieving data");
            logger.error("Base Repository findAllByConditionPaginated method", errResponse);
            return errResponse;
        }
    }
}

module.exports = BaseRepository;
