const socketService = require('./socketService');

/**
 * dbWatcherService
 * A Mongoose plugin that broadcasts changes to all connected clients via Socket.io.
 */
module.exports = function dbWatcherPlugin(schema, options) {
    const collection = schema.options.collection || (options && options.collection);

    // Post-save hook (Create and Update)
    schema.post('save', function (doc) {
        socketService.broadcastUpdate(collection, 'save', { id: doc._id });
    });

    // Post-remove/delete hook
    schema.post('remove', function (doc) {
        socketService.broadcastUpdate(collection, 'remove', { id: doc._id });
    });

    // Handle findOneAndUpdate and other Query-based updates
    schema.post('findOneAndUpdate', function (doc) {
        if (doc) {
            socketService.broadcastUpdate(collection, 'update', { id: doc._id });
        }
    });

    schema.post('updateMany', function (res) {
        socketService.broadcastUpdate(collection, 'updateMany');
    });

    schema.post('deleteOne', { document: true, query: false }, function (doc) {
        socketService.broadcastUpdate(collection, 'delete', { id: doc._id });
    });
};
