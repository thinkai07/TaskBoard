import React, { useState } from 'react';
import { ChevronDown, ArrowRight, PlusCircle, Clock, CheckSquare, MessageSquare, AlignLeft } from 'lucide-react';

const TriggerOption = ({ icon: Icon, label, isSelected, onClick }) => (
  <button 
    className={`flex items-center space-x-2 p-2 hover:bg-gray-100 w-full text-left ${isSelected ? 'bg-blue-100' : ''}`}
    onClick={onClick}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

function RulesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRulesUI, setShowRulesUI] = useState(false);
  const [showTriggers, setShowTriggers] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState('Card Move');
  const [triggerCondition, setTriggerCondition] = useState('added to');
  const [listName, setListName] = useState('');
  const [labelName, setLabelName] = useState('');

  const toggleDropdown = () => setIsOpen(!isOpen);
  const openRulesUI = () => {
    setIsOpen(false);
    setShowRulesUI(true);
  };

  const handleAddTrigger = () => {
    setShowTriggers(true);
  };

  const handleTriggerSelect = (trigger) => {
    setSelectedTrigger(trigger);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="bg-purple-500 text-white px-4 py-2 rounded-full flex items-center"
      >
        Rules <ChevronDown className="ml-2" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-md shadow-lg">
          <button
            onClick={openRulesUI}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            RULES
          </button>
        </div>
      )}
      {showRulesUI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-2/3">
            <h2 className="text-2xl font-bold mb-4">Rules Configuration</h2>
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gray-200 rounded-full px-4 py-2 text-sm">
                1 Select trigger
              </div>
              <div className="text-gray-400">&gt;</div>
              <div className="bg-gray-200 rounded-full px-4 py-2 text-sm">
                2 Select action
              </div>
              <div className="text-gray-400">&gt;</div>
              <div className="bg-gray-200 rounded-full px-4 py-2 text-sm">
                3 Review and save
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Select Trigger</h3>
            {!showTriggers ? (
              <button 
                className="w-full bg-blue-500 text-white py-2 rounded-md"
                onClick={handleAddTrigger}
              >
                + Add Trigger
              </button>
            ) : (
              <div>
                <div className="flex space-x-2 mb-4">
                  <TriggerOption icon={ArrowRight} label="Card Move" isSelected={selectedTrigger === 'Card Move'} onClick={() => handleTriggerSelect('Card Move')} />
                  <TriggerOption icon={PlusCircle} label="Card Changes" isSelected={selectedTrigger === 'Card Changes'} onClick={() => handleTriggerSelect('Card Changes')} />
                  <TriggerOption icon={Clock} label="Dates" isSelected={selectedTrigger === 'Dates'} onClick={() => handleTriggerSelect('Dates')} />
                  <TriggerOption icon={CheckSquare} label="Checklists" isSelected={selectedTrigger === 'Checklists'} onClick={() => handleTriggerSelect('Checklists')} />
                  <TriggerOption icon={MessageSquare} label="Card Content" isSelected={selectedTrigger === 'Card Content'} onClick={() => handleTriggerSelect('Card Content')} />
                  <TriggerOption icon={AlignLeft} label="Fields" isSelected={selectedTrigger === 'Fields'} onClick={() => handleTriggerSelect('Fields')} />
                </div>
                <div className="bg-gray-100 p-4 rounded-md">
                  {selectedTrigger === 'Card Move' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span>when a card is</span>
                      <select 
                        value={triggerCondition} 
                        onChange={(e) => setTriggerCondition(e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="added to">added to</option>
                        <option value="moved from">moved from</option>
                        <option value="moved to">moved to</option>
                      </select>
                      <input 
                        type="text" 
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="List name"
                        className="border rounded px-2 py-1"
                      />
                      <span>by me</span>
                    </div>
                  )}
                  {selectedTrigger === 'Card Changes' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span>when the</span>
                      <input 
                        type="text" 
                        value={labelName}
                        onChange={(e) => setLabelName(e.target.value)}
                        placeholder="green"
                        className="border rounded px-2 py-1"
                      />
                      <span>label is</span>
                      <select 
                        value={triggerCondition} 
                        onChange={(e) => setTriggerCondition(e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="added to">added to</option>
                        <option value="removed from">removed from</option>
                      </select>
                      <span>a card</span>
                      <span>by me</span>
                    </div>
                  )}
                  {selectedTrigger === 'Card Move' && (
                    <p className="text-sm text-gray-600">
                      "Added" means created, copied, emailed or moved into the list.
                    </p>
                  )}
                </div>
                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md">
                  Add
                </button>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowRulesUI(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RulesButton;