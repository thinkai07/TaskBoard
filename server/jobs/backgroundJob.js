//backgroundjob.js
const Rule = require('../models/Rule');
const Project = require('../models/Project');
const Card = require('../models/Card');
const Task = require('../models/Task');
const User = require('../models/User');

<<<<<<< HEAD
=======

>>>>>>> e2080dec6c5ef2d42c0feb4e3c203f5c14403dfe
const executeBackgroundJob = async () => {
  try {
    console.log('Running scheduled background job...');

    // Find rules related to 'Card Move' that need to be executed
    const rules = await Rule.find({ trigger: 'Card Move' });

    for (const rule of rules) {
<<<<<<< HEAD
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

=======
      // console.log(`Processing rule ${rule._id}:`);

      // Fetch the project by ID
      const project = await Project.findById(rule.projectId);
      if (!project) {
        console.error(`Project ${rule.projectId} not found.`);
        continue; // Skip to the next rule if the project is not found
      }

      // Fetch all cards associated with the project
      let cardsToMove = await Card.find({ project: rule.projectId });

      for (const card of cardsToMove) {
        // Get the user ID based on the updatedBy email
        const user = await User.findOne({ email: card.updatedBy });
        if (!user) {
          console.error(`User with email ${card.updatedBy} not found.`);
          continue; // Skip to the next card if the user is not found
        }

        // Check the createdByCondition
        if (rule.createdByCondition === 'by me') {
          if (!rule.createdBy.includes(user._id.toString())) {
            console.log(`Skipping card ${card._id} as it was not updated by the specified user.`);
            continue; // Skip this card if the user ID doesn't match
          }
        } else if (rule.createdByCondition === 'by anyone except me') {
          if (rule.createdBy.includes(user._id.toString())) {
            console.log(`Skipping card ${card._id} as it was updated by the excluded user.`);
            continue; // Skip this card if the user ID matches the excluded user
          }
        }

        // Fetch the destination list by name
        const destinationList = await Task.findOne({ name: rule.actionDetails.get('moveToList'), project: rule.projectId });
        if (!destinationList) {
          console.error(`Destination list ${rule.actionDetails.get('moveToList')} not found in project ${rule.projectId}.`);
          continue; // Skip to the next rule if the destination list is not found
        }

        // Check if the rule applies to this card based on triggerCondition
        if (!rule.triggerCondition || card.status === rule.triggerCondition) {
          // Find the current task (list) of the card
          const currentTask = await Task.findById(card.task);

          // Remove the card from the current list
>>>>>>> e2080dec6c5ef2d42c0feb4e3c203f5c14403dfe
          if (currentTask) {
            currentTask.card = currentTask.card.filter(cardId => !cardId.equals(card._id));
            await currentTask.save();
          }

<<<<<<< HEAD
          destinationList.card.push(card._id);
          await destinationList.save();

          card.task = destinationList._id;
          await card.save();
=======
          // Add the card to the destination list
          destinationList.card.push(card._id);
          await destinationList.save();

          // Update the card's task field
          card.task = destinationList._id;
          await card.save();

          // console.log(`Card ${card._id} moved to list ${destinationList.name} based on rule ${rule._id}`);
>>>>>>> e2080dec6c5ef2d42c0feb4e3c203f5c14403dfe
        }
      }
    }
  } catch (error) {
    console.error('Error running scheduled job:', error);
  }
};

<<<<<<< HEAD
=======


>>>>>>> e2080dec6c5ef2d42c0feb4e3c203f5c14403dfe
module.exports = executeBackgroundJob;