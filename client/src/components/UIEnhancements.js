import React, { useState, useEffect, createContext, useContext } from 'react';
import './UIEnhancements.css';

/**
 * Category 6.7: Mobile-Responsive Interface
 */
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop };
};

export const ResponsiveContainer = ({ children, mobileView, tabletView, desktopView }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && mobileView) return mobileView;
  if (isTablet && tabletView) return tabletView;
  if (isDesktop && desktopView) return desktopView;

  return <div className="responsive-container">{children}</div>;
};

/**
 * Category 6.8: Dark Mode Support
 */
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
      <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
    </button>
  );
};

/**
 * Category 6.9: Accessibility Features (WCAG 2.1 AA)
 */
export const AccessibilityProvider = ({ children }) => {
  const [a11ySettings, setA11ySettings] = useState({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReaderOptimized: false
  });

  useEffect(() => {
    // Apply accessibility settings
    if (a11ySettings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (a11ySettings.largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }

    if (a11ySettings.reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }, [a11ySettings]);

  const toggleSetting = (setting) => {
    setA11ySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="accessibility-wrapper">
      <div className="accessibility-controls">
        <button onClick={() => toggleSetting('highContrast')}>
          {a11ySettings.highContrast ? '✓' : ''} High Contrast
        </button>
        <button onClick={() => toggleSetting('largeText')}>
          {a11ySettings.largeText ? '✓' : ''} Large Text
        </button>
        <button onClick={() => toggleSetting('reduceMotion')}>
          {a11ySettings.reduceMotion ? '✓' : ''} Reduce Motion
        </button>
      </div>
      {children}
    </div>
  );
};

// Skip to main content link for screen readers
export const SkipToMain = () => (
  <a href="#main-content" className="skip-to-main">
    Skip to main content
  </a>
);

// Focus trap for modals
export const useFocusTrap = (isActive) => {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isActive]);
};

// ARIA live region for announcements
export const LiveRegion = ({ message, politeness = 'polite' }) => (
  <div
    role="status"
    aria-live={politeness}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);

/**
 * Category 6.10: Onboarding Tutorial System
 */
export const OnboardingTutorial = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(() => {
    return localStorage.getItem('onboarding-completed') === 'true';
  });

  useEffect(() => {
    if (hasCompleted) {
      setIsVisible(false);
    }
  }, [hasCompleted]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setHasCompleted(true);
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const resetTutorial = () => {
    localStorage.removeItem('onboarding-completed');
    setHasCompleted(false);
    setCurrentStep(0);
    setIsVisible(true);
  };

  if (!isVisible) {
    return (
      <button className="restart-tutorial-btn" onClick={resetTutorial}>
        🎓 Restart Tutorial
      </button>
    );
  }

  const step = steps[currentStep];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-spotlight" style={step.spotlight} />
      
      <div 
        className="onboarding-tooltip"
        style={{
          top: step.tooltipPosition?.top || '50%',
          left: step.tooltipPosition?.left || '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="tooltip-header">
          <h3>{step.title}</h3>
          <button className="btn-close" onClick={handleSkip}>×</button>
        </div>
        
        <div className="tooltip-body">
          {step.icon && <div className="tooltip-icon">{step.icon}</div>}
          <p>{step.description}</p>
          {step.image && <img src={step.image} alt={step.title} />}
        </div>
        
        <div className="tooltip-footer">
          <div className="progress-dots">
            {steps.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          
          <div className="tooltip-actions">
            <button
              className="btn-secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </button>
            <button className="btn-skip" onClick={handleSkip}>
              Skip Tutorial
            </button>
            <button className="btn-primary" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive tour component
export const InteractiveTour = ({ tourSteps }) => {
  const [activeTour, setActiveTour] = useState(null);

  const startTour = (tourId) => {
    setActiveTour(tourId);
  };

  const endTour = () => {
    setActiveTour(null);
  };

  return (
    <div className="interactive-tour">
      {activeTour && (
        <OnboardingTutorial
          steps={tourSteps[activeTour]}
          onComplete={endTour}
        />
      )}
      
      <div className="tour-menu">
        <h4>Interactive Tours</h4>
        <button onClick={() => startTour('getting-started')}>
          Getting Started
        </button>
        <button onClick={() => startTour('certificate-builder')}>
          Certificate Builder
        </button>
        <button onClick={() => startTour('advanced-features')}>
          Advanced Features
        </button>
      </div>
    </div>
  );
};

// Tooltip helper component
export const Tooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
};

// Help sidebar component
export const HelpSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="help-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle help sidebar"
      >
        ❓ Help
      </button>
      
      {isOpen && (
        <aside className="help-sidebar" role="complementary">
          <div className="sidebar-header">
            <h3>Help & Support</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          
          <div className="sidebar-content">
            <section>
              <h4>Quick Start</h4>
              <ul>
                <li><a href="#getting-started">Getting Started Guide</a></li>
                <li><a href="#video-tutorials">Video Tutorials</a></li>
                <li><a href="#keyboard-shortcuts">Keyboard Shortcuts</a></li>
              </ul>
            </section>
            
            <section>
              <h4>Features</h4>
              <ul>
                <li><a href="#certificate-builder">Certificate Builder</a></li>
                <li><a href="#transcript-generator">Transcript Generator</a></li>
                <li><a href="#gpa-calculator">GPA Calculator</a></li>
              </ul>
            </section>
            
            <section>
              <h4>Support</h4>
              <ul>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#feedback">Send Feedback</a></li>
              </ul>
            </section>
          </div>
        </aside>
      )}
    </>
  );
};

// Progress indicator component
export const ProgressIndicator = ({ currentStep, totalSteps, labels = [] }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-indicator">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin="0"
          aria-valuemax={totalSteps}
        />
      </div>
      
      <div className="progress-steps">
        {labels.map((label, index) => (
          <div
            key={index}
            className={`progress-step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
          >
            <div className="step-marker">{index + 1}</div>
            <div className="step-label">{label}</div>
          </div>
        ))}
      </div>
      
      <div className="progress-text">
        Step {currentStep} of {totalSteps} ({Math.round(progress)}%)
      </div>
    </div>
  );
};

export default {
  useResponsive,
  ResponsiveContainer,
  ThemeProvider,
  useTheme,
  ThemeToggle,
  AccessibilityProvider,
  SkipToMain,
  useFocusTrap,
  LiveRegion,
  OnboardingTutorial,
  InteractiveTour,
  Tooltip,
  HelpSidebar,
  ProgressIndicator
};
