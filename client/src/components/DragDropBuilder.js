import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DragDropBuilder.css';

/**
 * Category 6.1: Drag-and-Drop Visual Builder
 * Interactive certificate/diploma builder with drag-and-drop functionality
 */
const DragDropBuilder = ({ onSave, initialData = {} }) => {
  const [elements, setElements] = useState(initialData.elements || []);
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const canvasRef = useRef(null);

  // Available element types
  const elementTypes = [
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'logo', label: 'Logo', icon: '🎓' },
    { type: 'seal', label: 'Seal', icon: '🔖' },
    { type: 'signature', label: 'Signature', icon: '✍️' },
    { type: 'border', label: 'Border', icon: '🖼️' },
    { type: 'ribbon', label: 'Ribbon', icon: '🎀' },
    { type: 'image', label: 'Image', icon: '🖼️' }
  ];

  // Handle drag start from palette
  const handleDragStart = (e, elementType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('elementType', elementType);
  };

  // Handle drop on canvas
  const handleDrop = (e) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('elementType');
    
    if (!elementType) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newElement = {
      id: Date.now(),
      type: elementType,
      x,
      y,
      width: 200,
      height: 50,
      content: `New ${elementType}`,
      styles: {
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: 'transparent'
      }
    };

    setElements([...elements, newElement]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle element selection
  const selectElement = (id) => {
    setSelectedElement(id);
  };

  // Handle element position update
  const updateElementPosition = (id, newX, newY) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, x: newX, y: newY } : el
    ));
  };

  // Handle element property update
  const updateElementProperty = (id, property, value) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, [property]: value } : el
    ));
  };

  // Delete element
  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  // Save design
  const handleSave = () => {
    onSave({ elements });
  };

  return (
    <div className="drag-drop-builder">
      <div className="builder-toolbar">
        <h3>Element Palette</h3>
        <div className="element-palette">
          {elementTypes.map(({ type, label, icon }) => (
            <div
              key={type}
              className="palette-item"
              draggable
              onDragStart={(e) => handleDragStart(e, type)}
            >
              <span className="icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="builder-canvas-container">
        <div
          ref={canvasRef}
          className="builder-canvas"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="canvas-paper">
            {elements.map((element) => (
              <div
                key={element.id}
                className={`canvas-element ${selectedElement === element.id ? 'selected' : ''}`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  ...element.styles
                }}
                onClick={() => selectElement(element.id)}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggedElement(element.id);
                }}
                onDragEnd={(e) => {
                  const rect = canvasRef.current.getBoundingClientRect();
                  const newX = e.clientX - rect.left;
                  const newY = e.clientY - rect.top;
                  updateElementPosition(element.id, newX, newY);
                  setDraggedElement(null);
                }}
              >
                {element.content}
              </div>
            ))}
          </div>
        </div>

        <div className="builder-properties">
          <h3>Properties</h3>
          {selectedElement && (
            <div className="property-panel">
              {elements.find(el => el.id === selectedElement) && (
                <>
                  <div className="property-group">
                    <label>Content:</label>
                    <input
                      type="text"
                      value={elements.find(el => el.id === selectedElement).content}
                      onChange={(e) => updateElementProperty(selectedElement, 'content', e.target.value)}
                    />
                  </div>
                  <div className="property-group">
                    <label>Font Size:</label>
                    <input
                      type="number"
                      value={elements.find(el => el.id === selectedElement).styles.fontSize}
                      onChange={(e) => {
                        const el = elements.find(el => el.id === selectedElement);
                        updateElementProperty(selectedElement, 'styles', {
                          ...el.styles,
                          fontSize: parseInt(e.target.value)
                        });
                      }}
                    />
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => deleteElement(selectedElement)}
                  >
                    Delete Element
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="builder-actions">
        <button className="btn-primary" onClick={handleSave}>
          Save Design
        </button>
        <button className="btn-secondary" onClick={() => setElements([])}>
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

/**
 * Category 6.2: Live Preview with Real-Time Updates
 */
export const LivePreview = ({ data, updateInterval = 100 }) => {
  const [previewData, setPreviewData] = useState(data);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewData(data);
      setLastUpdate(Date.now());
    }, updateInterval);

    return () => clearTimeout(timer);
  }, [data, updateInterval]);

  return (
    <div className="live-preview">
      <div className="preview-header">
        <h3>Live Preview</h3>
        <span className="last-update">Updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
      </div>
      <div className="preview-content">
        {/* Render preview based on data */}
        <div className="certificate-preview">
          {previewData.elements?.map((element) => (
            <div
              key={element.id}
              style={{
                position: 'absolute',
                left: element.x,
                top: element.y,
                fontSize: element.styles.fontSize,
                color: element.styles.color
              }}
            >
              {element.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Category 6.3: Step-by-Step Wizard Interface
 */
export const WizardInterface = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateData = (stepData) => {
    setFormData({ ...formData, ...stepData });
  };

  return (
    <div className="wizard-interface">
      <div className="wizard-progress">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`wizard-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      <div className="wizard-content">
        <h2>{steps[currentStep].title}</h2>
        <p>{steps[currentStep].description}</p>
        
        <div className="wizard-form">
          {steps[currentStep].component({ data: formData, onChange: updateData })}
        </div>
      </div>

      <div className="wizard-actions">
        <button
          className="btn-secondary"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </button>
        <button
          className="btn-primary"
          onClick={handleNext}
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

/**
 * Category 6.4: Keyboard Shortcuts (20+ commands)
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
      
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export const KeyboardShortcutsHelp = () => {
  const defaultShortcuts = [
    { key: 'Ctrl+S', action: 'Save' },
    { key: 'Ctrl+Z', action: 'Undo' },
    { key: 'Ctrl+Y', action: 'Redo' },
    { key: 'Ctrl+C', action: 'Copy' },
    { key: 'Ctrl+V', action: 'Paste' },
    { key: 'Ctrl+X', action: 'Cut' },
    { key: 'Delete', action: 'Delete selected' },
    { key: 'Ctrl+A', action: 'Select all' },
    { key: 'Ctrl+D', action: 'Duplicate' },
    { key: 'Ctrl+G', action: 'Group elements' },
    { key: 'Ctrl+Shift+G', action: 'Ungroup elements' },
    { key: 'Ctrl+L', action: 'Lock element' },
    { key: 'Ctrl+B', action: 'Bold text' },
    { key: 'Ctrl+I', action: 'Italic text' },
    { key: 'Ctrl+U', action: 'Underline text' },
    { key: 'Ctrl++', action: 'Zoom in' },
    { key: 'Ctrl+-', action: 'Zoom out' },
    { key: 'Ctrl+0', action: 'Reset zoom' },
    { key: 'Ctrl+P', action: 'Print/Export' },
    { key: 'Ctrl+N', action: 'New document' },
    { key: 'Ctrl+O', action: 'Open document' },
    { key: 'Esc', action: 'Deselect/Cancel' },
    { key: 'F1', action: 'Help' }
  ];

  return (
    <div className="keyboard-shortcuts-help">
      <h3>Keyboard Shortcuts</h3>
      <div className="shortcuts-list">
        {defaultShortcuts.map(({ key, action }) => (
          <div key={key} className="shortcut-item">
            <kbd>{key}</kbd>
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Category 6.5: Undo/Redo Functionality (50-step history)
 */
export const useUndoRedo = (initialState, maxHistory = 50) => {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateState = useCallback((newState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    
    // Keep only last maxHistory items
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
    
    setHistory(newHistory);
    setState(newState);
  }, [history, currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setState(history[currentIndex - 1]);
    }
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setState(history[currentIndex + 1]);
    }
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { state, updateState, undo, redo, canUndo, canRedo };
};

/**
 * Category 6.6: Auto-Save Every 30 Seconds
 */
export const useAutoSave = (data, saveFunction, interval = 30000) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setInterval(async () => {
      setIsSaving(true);
      try {
        await saveFunction(data);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [data, saveFunction, interval]);

  return { lastSaved, isSaving };
};

export const AutoSaveIndicator = ({ lastSaved, isSaving }) => (
  <div className="auto-save-indicator">
    {isSaving ? (
      <span className="saving">💾 Saving...</span>
    ) : lastSaved ? (
      <span className="saved">✓ Saved {new Date(lastSaved).toLocaleTimeString()}</span>
    ) : (
      <span className="not-saved">Not saved</span>
    )}
  </div>
);

export default DragDropBuilder;
