'use client';

import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';

// Define custom blocks for jungle adventure
const customBlocks = {
  'move_up': {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🔼 Move Forward");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Move explorer forward/up");
      this.setHelpUrl("");
    }
  },
  'move_down': {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("🔽 Move Back");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Move explorer back/down");
      this.setHelpUrl("");
    }
  },
  'move_left': {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("⬅️ Move Left");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Move explorer to the left");
      this.setHelpUrl("");
    }
  },
  'move_right': {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("➡️ Move Right");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Move explorer to the right");
      this.setHelpUrl("");
    }
  },
  'wait': {
    init: function(this: any) {
      this.appendDummyInput()
          .appendField("⏸️ Wait");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(45);
      this.setTooltip("Wait for a moment");
      this.setHelpUrl("");
    }
  },
  'repeat': {
    init: function(this: any) {
      this.appendValueInput('TIMES')
          .setCheck('Number')
          .appendField("🔄 Repeat")
          .appendField(new Blockly.FieldNumber(3, 1, 10), 'TIMES')
          .appendField("times");
      this.appendStatementInput('DO')
          .appendField("do");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(220);
      this.setTooltip("Repeat actions multiple times");
      this.setHelpUrl("");
    }
  }
};

// Define the toolbox
const toolbox = {
  "kind": "categoryToolbox",
  "contents": [
    {
      "kind": "category",
      "name": "🏃‍♂️ Movement",
      "colour": "#5ba55b",
      "contents": [
        {
          "kind": "block",
          "type": "move_up"
        },
        {
          "kind": "block",
          "type": "move_down"
        },
        {
          "kind": "block",
          "type": "move_left"
        },
        {
          "kind": "block",
          "type": "move_right"
        }
      ]
    },
    {
      "kind": "category",
      "name": "⏱️ Actions",
      "colour": "#5b80a5",
      "contents": [
        {
          "kind": "block",
          "type": "wait"
        }
      ]
    },
    {
      "kind": "category",
      "name": "🔄 Loops",
      "colour": "#5b67a5",
      "contents": [
        {
          "kind": "block",
          "type": "repeat"
        }
      ]
    }
  ]
};

// Code generators
const generateCode = (workspace: Blockly.WorkspaceSvg): any[] => {
  const topBlocks = workspace.getTopBlocks(true);
  const commands: any[] = [];

  const processBlock = (block: Blockly.Block) => {
    if (!block) return;

    switch (block.type) {
      case 'move_up':
        commands.push({ type: 'move_up' });
        break;
      case 'move_down':
        commands.push({ type: 'move_down' });
        break;
      case 'move_left':
        commands.push({ type: 'move_left' });
        break;
      case 'move_right':
        commands.push({ type: 'move_right' });
        break;
      case 'wait':
        commands.push({ type: 'wait' });
        break;
      case 'repeat':
        const times = (block as any).getFieldValue('TIMES') || 3;
        const doBlock = block.getInputTargetBlock('DO');
        for (let i = 0; i < times; i++) {
          if (doBlock) {
            processBlock(doBlock);
            let nextBlock = doBlock.getNextBlock();
            while (nextBlock) {
              processBlock(nextBlock);
              nextBlock = nextBlock.getNextBlock();
            }
          }
        }
        break;
    }

    // Process next block in sequence
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
      processBlock(nextBlock);
    }
  };

  topBlocks.forEach(block => {
    processBlock(block);
  });

  return commands;
};

interface BlocklyWorkspaceProps {
  onCodeGenerated?: (code: any[]) => void;
  onRunCode?: () => void;
  onReset?: () => void;
}

export default function BlocklyWorkspace({ onCodeGenerated, onRunCode, onReset }: BlocklyWorkspaceProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Register custom blocks
    Object.keys(customBlocks).forEach(blockType => {
      if (!Blockly.Blocks[blockType]) {
        Blockly.Blocks[blockType] = customBlocks[blockType as keyof typeof customBlocks];
      }
    });

    // Create workspace
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      scrollbars: true,
      trashcan: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      grid: {
        spacing: 25,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      theme: Blockly.Themes.Classic
    });

    // Don't add auto change listener - only execute on button click

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
      }
    };
  }, []);

  const runCode = () => {
    if (workspace.current && onCodeGenerated) {
      // Always generate fresh code from current workspace state
      const code = generateCode(workspace.current);
      // Update the parent's generated code
      onCodeGenerated(code);
      // Small delay to ensure state is updated before running
      setTimeout(() => {
        onRunCode?.();
      }, 10);
    }
  };

  const resetWorkspace = () => {
    if (workspace.current) {
      workspace.current.clear();
    }
    // Call parent reset handler
    onReset?.();
  };

  const cloneLastBlock = () => {
    if (workspace.current) {
      const topBlocks = workspace.current.getTopBlocks();
      if (topBlocks.length > 0) {
        const lastBlock = topBlocks[topBlocks.length - 1];
        const blockCopy = workspace.current.newBlock(lastBlock.type);
        blockCopy.initSvg();
        blockCopy.render();
        blockCopy.moveBy(20, 20);
      }
    }
  };

  const showHint = () => {
    alert("💡 Hint: Try using Move Forward blocks to reach the gems, then find the treasure chest!");
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <button 
          onClick={runCode}
          className="group bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl border-2 border-green-300"
        >
          <span className="flex items-center space-x-2">
            <span className="text-xl group-hover:animate-bounce">🚀</span>
            <span className="text-lg">Run Magic</span>
          </span>
        </button>
        
        <button 
          onClick={resetWorkspace}
          className="group bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl border-2 border-red-300"
        >
          <span className="flex items-center space-x-2">
            <span className="text-xl group-hover:animate-spin">🔄</span>
            <span className="text-lg">Reset</span>
          </span>
        </button>
        
        <button 
          onClick={cloneLastBlock}
          className="group bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl border-2 border-purple-300"
        >
          <span className="flex items-center space-x-2">
            <span className="text-xl group-hover:animate-pulse">📋</span>
            <span className="text-lg">Copy</span>
          </span>
        </button>
        
        <button 
          onClick={showHint}
          className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 hover:shadow-2xl border-2 border-yellow-300"
        >
          <span className="flex items-center space-x-2">
            <span className="text-xl group-hover:animate-bounce">💡</span>
            <span className="text-lg">Hint</span>
          </span>
        </button>
      </div>
      
      {/* Blockly Workspace */}
      <div 
        ref={blocklyDiv} 
        className="flex-1 min-h-[400px] rounded-2xl shadow-2xl border-4 border-gradient-to-r from-blue-300 to-purple-300 bg-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)'
        }}
      />
      
      {/* Instructions */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
        <p className="text-center text-blue-700 font-semibold flex items-center justify-center space-x-2">
          <span className="text-xl animate-bounce">🧙‍♂️</span>
          <span>Drag and drop blocks to create magical commands for your character!</span>
          <span className="text-xl animate-bounce delay-150">✨</span>
        </p>
      </div>
    </div>
  );
}
