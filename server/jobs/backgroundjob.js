//backgroundjob.js
const Rule = require('../models/Rule');
const Project = require('../models/Project');
const Card = require('../models/Card');
const Task = require('../models/Task');
const User = require('../models/User');

const executeBackgroundJob = async () => {
    try {
        console.log('Running scheduled background job...');

        // Find rules related to 'Card Move' that need to be executed
        const rules = await Rule.find({ trigger: 'Card Move' });

        for (const rule of rules) {
            const project = await Project.findById(rule.projectId);
            if (!project) {
                console.error(`Project ${rule.projectId} not found.`);
                continue;
            }

            let cardsToMove = await Card.find({ project: rule.projectId });

            for (const card of cardsToMove) {
                const user = await User.findOne({ email: card.updatedBy });
                if (!user) {
                    console.error(`User with email ${card.updatedBy} not found.`);
                    continue;
                }

                if (rule.createdByCondition === 'by me' && !rule.createdBy.includes(user._id.toString())) {
                    console.log(`Skipping card ${card._id} as it was not updated by the specified user.`);
                    continue;
                } else if (rule.createdByCondition === 'by anyone except me' && rule.createdBy.includes(user._id.toString())) {
                    console.log(`Skipping card ${card._id} as it was updated by the excluded user.`);
                    continue;
                }

                const destinationList = await Task.findOne({ name: rule.actionDetails.get('moveToList'), project: rule.projectId });
                if (!destinationList) {
                    console.error(`Destination list ${rule.actionDetails.get('moveToList')} not found in project ${rule.projectId}.`);
                    continue;
                }

                if (!rule.triggerCondition || card.status === rule.triggerCondition) {
                    const currentTask = await Task.findById(card.task);

                    if (currentTask) {
                        currentTask.card = currentTask.card.filter(cardId => !cardId.equals(card._id));
                        await currentTask.save();
                    }

                    destinationList.card.push(card._id);
                    await destinationList.save();

                    card.task = destinationList._id;
                    await card.save();
                }
            }
        }
    } catch (error) {
        console.error('Error running scheduled job:', error);
    }
};

module.exports = executeBackgroundJob;