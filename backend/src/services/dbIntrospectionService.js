const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

/**
 * dbIntrospectionService
 * Provides dynamic metadata and targeted data fetching for all Mongoose models.
 */
class DBIntrospectionService {
    constructor() {
        this.loadAllModels();
    }

    /**
     * Proactively require all models in the models directory
     */
    loadAllModels() {
        const modelsPath = path.join(__dirname, '../models');
        if (fs.existsSync(modelsPath)) {
            const files = fs.readdirSync(modelsPath).filter(f => f.endsWith('.js'));
            files.forEach(file => {
                try {
                    require(path.join(modelsPath, file));
                } catch (err) {
                    console.error(`Failed to load model ${file}:`, err);
                }
            });
        }
        this.models = mongoose.models;
    }

    /**
     * Get a high-level overview of all collections
     */
    async getUniversalContext() {
        const context = {};
        const modelNames = Object.keys(this.models);

        for (const name of modelNames) {
            try {
                const count = await this.models[name].countDocuments();
                const schema = this.models[name].schema.obj;
                const fields = Object.keys(schema).filter(f => !f.startsWith('_'));

                context[name] = {
                    count,
                    fields: fields.slice(0, 10), // Limit fields to keep context small
                    description: `Contains ${count} records with fields like ${fields.slice(0, 5).join(', ')}.`
                };
            } catch (err) {
                console.error(`Error introspecting model ${name}:`, err);
            }
        }

        return context;
    }

    /**
     * Fetch specific data based on Gemini's requirements
     */
    async queryCollection(modelName, query = {}, limit = 5, sort = {}) {
        const model = this.models[modelName];
        if (!model) return { error: `Model ${modelName} not found` };

        try {
            const data = await model.find(query).sort(sort).limit(limit).lean();
            return data;
        } catch (err) {
            console.error(`Query error in ${modelName}:`, err);
            return { error: err.message };
        }
    }

    /**
     * Specialized summary statistics for HR
     */
    async getHRStats() {
        const stats = {};
        try {
            stats.employeeCount = await this.models.Employee?.countDocuments() || 0;
            stats.activeJobs = await this.models.Job?.countDocuments({ status: 'active' }) || 0;
            stats.pendingApplications = await this.models.JobApplication?.countDocuments({ status: { $in: ['pending', 'under_review'] } }) || 0;

            // Total payroll liability (annual)
            if (this.models.Employee) {
                const employees = await this.models.Employee.find({}, 'salary');
                stats.totalPayroll = employees.reduce((sum, e) => sum + (parseFloat(e.salary) || 0), 0);
            }

            // Attendance today
            if (this.models.Attendance) {
                const today = new Date().toISOString().split('T')[0];
                stats.presentToday = await this.models.Attendance.countDocuments({ date: today, status: 'present' });
            }
        } catch (err) {
            console.error('Error fetching HR stats:', err);
        }
        return stats;
    }

    /**
     * Get a formatted text summary for a specific collection
     */
    async summarizeCollection(modelName) {
        const model = this.models[modelName];
        if (!model) return `Collection ${modelName} not found.`;

        try {
            const count = await model.countDocuments();
            const sample = await model.find().limit(3).lean();

            let summary = `The **${modelName}** collection contains **${count}** records.\n\n`;
            if (sample.length > 0) {
                summary += `**Recent Entries:**\n`;
                sample.forEach((item, i) => {
                    const identifier = item.name || item.title || item.fullName || item.code || item.id || item._id;
                    summary += `${i + 1}. ${identifier}\n`;
                });
            }
            return summary;
        } catch (err) {
            return `Error summarizing ${modelName}: ${err.message}`;
        }
    }

    /**
     * Search for a specific entity by name across relevant collections
     */
    async findEntityByName(name) {
        const results = [];
        const searchableModels = ['Employee', 'Job', 'Project', 'User', 'JobApplication'];

        for (const modelName of searchableModels) {
            const model = this.models[modelName];
            if (!model) continue;

            const field = modelName === 'JobApplication' ? 'fullName' : (modelName === 'Job' || modelName === 'Project' ? 'title' : 'name');
            const match = await model.findOne({ [field]: new RegExp(name, 'i') }).lean();

            if (match) {
                results.push({ type: modelName, data: match });
            }
        }
        return results;
    }
}

module.exports = new DBIntrospectionService();
